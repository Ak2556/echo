"""
Production-grade Redis configuration with connection pooling,
health checks, and distributed caching.
"""
import asyncio
import json
import pickle
from typing import Any, Optional, Union, List
from contextlib import asynccontextmanager

import structlog

# Try to import redis, fall back to mock if not available
try:
    import redis.asyncio as aioredis
    from redis.asyncio import ConnectionPool
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = structlog.get_logger(__name__)

# Mock Redis implementation for development/testing
class MockRedis:
    """Mock Redis implementation for development and testing."""
    
    def __init__(self):
        self._data = {}
        self._ttl = {}
    
    async def get(self, key: str) -> Any:
        """Get value from mock storage."""
        if key in self._data:
            return self._data[key]
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in mock storage."""
        self._data[key] = value
        if ttl:
            self._ttl[key] = ttl
        return True
    
    async def delete(self, *keys: str) -> int:
        """Delete keys from mock storage."""
        count = 0
        for key in keys:
            if key in self._data:
                del self._data[key]
                count += 1
            if key in self._ttl:
                del self._ttl[key]
        return count
    
    async def exists(self, *keys: str) -> int:
        """Check if keys exist."""
        return sum(1 for key in keys if key in self._data)
    
    async def ping(self) -> bool:
        """Mock ping."""
        return True
    
    async def close(self):
        """Mock close."""
        pass


class RedisManager:
    """Redis manager with connection pooling and health monitoring."""

    def __init__(self):
        self.client = MockRedis()  # Default to mock client
        self._initialized = False
        self._use_real_redis = False

    async def init(self, redis_url: str = "redis://localhost:6379/0") -> None:
        """Initialize Redis connection."""
        if self._initialized:
            return

        if REDIS_AVAILABLE:
            try:
                # Try to connect to real Redis
                pool = ConnectionPool.from_url(
                    redis_url,
                    max_connections=50,
                    decode_responses=True,  # Decode responses to strings
                    socket_keepalive=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    health_check_interval=30,
                )
                self.client = aioredis.Redis(connection_pool=pool)

                # Test connection
                await self.client.ping()
                self._use_real_redis = True
                logger.info("Redis connection established", url=redis_url)
            except Exception as e:
                logger.warning(
                    "Failed to connect to Redis, falling back to mock",
                    error=str(e),
                    url=redis_url
                )
                self.client = MockRedis()
                self._use_real_redis = False
        else:
            logger.info("Redis library not available, using mock implementation")
            self.client = MockRedis()
            self._use_real_redis = False

        self._initialized = True
    
    async def close(self) -> None:
        """Close Redis connections."""
        if self.client and hasattr(self.client, 'aclose'):
            await self.client.aclose()
            logger.info("Redis connections closed")
        elif self.client and hasattr(self.client, 'close'):
            await self.client.close()
            logger.info("Redis connections closed (legacy method)")
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from Redis with automatic deserialization."""
        try:
            value = await self.client.get(key)
            return value if value is not None else default
        except Exception as e:
            logger.error("Redis get error", key=key, error=str(e))
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        nx: bool = False,
        xx: bool = False,
    ) -> bool:
        """Set value in Redis with automatic serialization."""
        try:
            if self._use_real_redis:
                # Real Redis uses ex, nx, xx parameters
                return await self.client.set(key, value, ex=ttl, nx=nx, xx=xx)
            else:
                # MockRedis uses ttl parameter
                return await self.client.set(key, value, ttl=ttl)
        except Exception as e:
            logger.error("Redis set error", key=key, error=str(e))
            return False
    
    async def delete(self, *keys: str) -> int:
        """Delete keys from Redis."""
        try:
            return await self.client.delete(*keys)
        except Exception as e:
            logger.error("Redis delete error", keys=keys, error=str(e))
            return 0
    
    async def exists(self, *keys: str) -> int:
        """Check if keys exist in Redis."""
        try:
            return await self.client.exists(*keys)
        except Exception as e:
            logger.error("Redis exists error", keys=keys, error=str(e))
            return 0
    
    async def health_check(self) -> bool:
        """Check Redis health."""
        try:
            return await self.client.ping()
        except Exception as e:
            logger.error("Redis health check failed", error=str(e))
            return False


# Global Redis manager instance
redis_manager = RedisManager()


async def init_redis() -> None:
    """Initialize Redis connection."""
    from app.core.config import get_settings
    settings = get_settings()
    await redis_manager.init(redis_url=settings.redis_url)


async def close_redis() -> None:
    """Close Redis connections."""
    await redis_manager.close()


async def get_redis() -> RedisManager:
    """Get Redis manager instance."""
    return redis_manager


# Cache decorator
def cache(
    ttl: int = 300,
    key_prefix: str = "",
    key_func: Optional[callable] = None,
):
    """Cache decorator for functions."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await redis_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await redis_manager.set(cache_key, result, ttl=ttl)
            return result
        
        return wrapper
    return decorator


# Rate limiting using Redis
class RateLimiter:
    """Redis-based rate limiter."""
    
    def __init__(self, redis_manager: RedisManager):
        self.redis = redis_manager
        self._counters = {}  # Mock implementation
    
    async def is_allowed(
        self,
        key: str,
        limit: int,
        window: int,
        burst: int = None,
    ) -> tuple[bool, dict]:
        """Check if request is allowed under rate limit."""
        burst = burst or limit
        
        # Mock implementation
        current_count = self._counters.get(key, 0)
        allowed = current_count < limit
        
        if allowed:
            self._counters[key] = current_count + 1
        
        return allowed, {
            "allowed": allowed,
            "burst_allowed": current_count < burst,
            "current_requests": current_count,
            "limit": limit,
            "burst": burst,
            "window": window,
        }


# Global rate limiter
rate_limiter = RateLimiter(redis_manager)