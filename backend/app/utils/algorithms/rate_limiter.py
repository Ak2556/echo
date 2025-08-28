"""
Production-grade rate limiting algorithms with multiple strategies.
"""
import time
import asyncio
from typing import Dict, List, Optional, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class RateLimitResult:
    """Result of rate limit check."""
    allowed: bool
    remaining: int
    reset_time: float
    retry_after: Optional[int] = None


class TokenBucketRateLimiter:
    """
    Token Bucket Rate Limiter - allows bursts up to bucket capacity.
    
    Features:
    - Handles burst traffic
    - Smooth rate limiting
    - Per-key rate limiting
    - Thread-safe operations
    """
    
    def __init__(self, rate: int, capacity: int, window: int = 60):
        """
        Initialize Token Bucket Rate Limiter.
        
        Args:
            rate: Tokens added per window
            capacity: Maximum tokens in bucket
            window: Time window in seconds
        """
        self.rate = rate
        self.capacity = capacity
        self.window = window
        self.buckets: Dict[str, Tuple[float, float]] = {}  # key -> (tokens, last_update)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, key: str) -> RateLimitResult:
        """
        Check if request is allowed.
        
        Args:
            key: Identifier for rate limiting (user_id, ip, etc.)
            
        Returns:
            RateLimitResult with decision and metadata
        """
        async with self.lock:
            now = time.time()
            
            if key not in self.buckets:
                self.buckets[key] = (self.capacity - 1, now)
                return RateLimitResult(
                    allowed=True,
                    remaining=self.capacity - 1,
                    reset_time=now + self.window
                )
            
            tokens, last_update = self.buckets[key]
            
            # Add tokens based on elapsed time
            elapsed = now - last_update
            tokens_to_add = (elapsed / self.window) * self.rate
            tokens = min(self.capacity, tokens + tokens_to_add)
            
            if tokens >= 1:
                tokens -= 1
                self.buckets[key] = (tokens, now)
                return RateLimitResult(
                    allowed=True,
                    remaining=int(tokens),
                    reset_time=now + self.window
                )
            else:
                self.buckets[key] = (tokens, now)
                retry_after = int((1 - tokens) / self.rate * self.window)
                return RateLimitResult(
                    allowed=False,
                    remaining=0,
                    reset_time=now + self.window,
                    retry_after=retry_after
                )
    
    async def reset(self, key: Optional[str] = None):
        """
        Reset rate limiter state.
        
        Args:
            key: Specific key to reset, or None to reset all
        """
        async with self.lock:
            if key is None:
                self.buckets.clear()
            elif key in self.buckets:
                del self.buckets[key]


class SlidingWindowLogRateLimiter:
    """
    Sliding Window Log Rate Limiter - precise rate limiting.
    
    Features:
    - Precise rate limiting
    - Memory efficient with cleanup
    - Per-key tracking
    """
    
    def __init__(self, limit: int, window: int = 60):
        """
        Initialize Sliding Window Log Rate Limiter.
        
        Args:
            limit: Maximum requests per window
            window: Time window in seconds
        """
        self.limit = limit
        self.window = window
        self.logs: Dict[str, deque] = defaultdict(deque)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, key: str) -> RateLimitResult:
        """Check if request is allowed."""
        async with self.lock:
            now = time.time()
            window_start = now - self.window
            
            # Clean old entries
            log = self.logs[key]
            while log and log[0] < window_start:
                log.popleft()
            
            if len(log) < self.limit:
                log.append(now)
                return RateLimitResult(
                    allowed=True,
                    remaining=self.limit - len(log),
                    reset_time=log[0] + self.window if log else now + self.window
                )
            else:
                oldest_request = log[0]
                retry_after = int(oldest_request + self.window - now)
                return RateLimitResult(
                    allowed=False,
                    remaining=0,
                    reset_time=oldest_request + self.window,
                    retry_after=max(1, retry_after)
                )


class FixedWindowRateLimiter:
    """
    Fixed Window Rate Limiter - simple and memory efficient.
    
    Features:
    - Low memory usage
    - Simple implementation
    - Good for basic rate limiting
    """
    
    def __init__(self, limit: int, window: int = 60):
        """
        Initialize Fixed Window Rate Limiter.
        
        Args:
            limit: Maximum requests per window
            window: Time window in seconds
        """
        self.limit = limit
        self.window = window
        self.counters: Dict[str, Tuple[int, float]] = {}  # key -> (count, window_start)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, key: str) -> RateLimitResult:
        """Check if request is allowed."""
        async with self.lock:
            now = time.time()
            window_start = int(now // self.window) * self.window
            
            if key not in self.counters:
                self.counters[key] = (1, window_start)
                return RateLimitResult(
                    allowed=True,
                    remaining=self.limit - 1,
                    reset_time=window_start + self.window
                )
            
            count, last_window = self.counters[key]
            
            if last_window < window_start:
                # New window
                self.counters[key] = (1, window_start)
                return RateLimitResult(
                    allowed=True,
                    remaining=self.limit - 1,
                    reset_time=window_start + self.window
                )
            elif count < self.limit:
                # Within limit
                self.counters[key] = (count + 1, window_start)
                return RateLimitResult(
                    allowed=True,
                    remaining=self.limit - count - 1,
                    reset_time=window_start + self.window
                )
            else:
                # Rate limited
                retry_after = int(window_start + self.window - now)
                return RateLimitResult(
                    allowed=False,
                    remaining=0,
                    reset_time=window_start + self.window,
                    retry_after=max(1, retry_after)
                )


class AdaptiveRateLimiter:
    """
    Adaptive Rate Limiter that adjusts limits based on system load.
    
    Features:
    - Dynamic limit adjustment
    - System load awareness
    - Graceful degradation
    """
    
    def __init__(self, base_limit: int, window: int = 60):
        """
        Initialize Adaptive Rate Limiter.
        
        Args:
            base_limit: Base limit under normal conditions
            window: Time window in seconds
        """
        self.base_limit = base_limit
        self.window = window
        self.current_limit = base_limit
        self.limiter = FixedWindowRateLimiter(base_limit, window)
        self.load_factor = 1.0
        self.last_adjustment = time.time()
    
    async def is_allowed(self, key: str) -> RateLimitResult:
        """Check if request is allowed with adaptive limits."""
        await self._adjust_limits()
        return await self.limiter.is_allowed(key)
    
    async def _adjust_limits(self):
        """Adjust limits based on system metrics."""
        now = time.time()
        if now - self.last_adjustment < 10:  # Adjust every 10 seconds
            return
        
        # Simple load factor calculation (can be enhanced with real metrics)
        # This is a placeholder - in production, use actual system metrics
        import psutil
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        
        # Calculate load factor (0.1 to 2.0)
        load_factor = max(0.1, min(2.0, 1.0 - (cpu_percent + memory_percent) / 200))
        
        new_limit = int(self.base_limit * load_factor)
        if new_limit != self.current_limit:
            self.current_limit = new_limit
            self.limiter = FixedWindowRateLimiter(new_limit, self.window)
            logger.info("Rate limit adjusted", 
                       old_limit=self.current_limit,
                       new_limit=new_limit,
                       load_factor=load_factor)
        
        self.last_adjustment = now


class HierarchicalRateLimiter:
    """
    Hierarchical Rate Limiter with multiple tiers (global, user, IP).
    
    Features:
    - Multiple rate limiting tiers
    - Cascading limits
    - Flexible configuration
    """
    
    def __init__(self, limits: Dict[str, Tuple[int, int]]):
        """
        Initialize Hierarchical Rate Limiter.
        
        Args:
            limits: Dict of tier_name -> (limit, window)
        """
        self.limiters = {
            tier: TokenBucketRateLimiter(limit, limit, window)
            for tier, (limit, window) in limits.items()
        }
    
    async def is_allowed(self, keys: Dict[str, str]) -> RateLimitResult:
        """
        Check if request is allowed across all tiers.
        
        Args:
            keys: Dict of tier_name -> key_value
            
        Returns:
            RateLimitResult (denied if any tier denies)
        """
        results = []
        
        for tier, key in keys.items():
            if tier in self.limiters:
                result = await self.limiters[tier].is_allowed(key)
                results.append(result)
                
                if not result.allowed:
                    return result  # Return first denial
        
        # All tiers allowed - return most restrictive remaining count
        if results:
            min_remaining = min(r.remaining for r in results)
            max_reset_time = max(r.reset_time for r in results)
            return RateLimitResult(
                allowed=True,
                remaining=min_remaining,
                reset_time=max_reset_time
            )
        
        return RateLimitResult(allowed=True, remaining=0, reset_time=time.time())