"""Simple rate limiting implementation."""

import time
from typing import Dict, Tuple
from collections import defaultdict, deque


class RateLimiter:
    """Simple sliding window rate limiter."""

    def __init__(self):
        self._requests: Dict[str, deque] = defaultdict(deque)

    async def check_rate_limit(
        self,
        key: str,
        max_requests: int = 100,
        window_seconds: int = 60
    ) -> Tuple[bool, int, float]:
        """
        Check if request is within rate limit.

        Returns:
            (allowed, remaining, reset_time)
        """
        now = time.time()
        cutoff = now - window_seconds

        # Get request history for this key
        requests = self._requests[key]

        # Remove old requests
        while requests and requests[0] < cutoff:
            requests.popleft()

        # Check if under limit
        if len(requests) < max_requests:
            requests.append(now)
            remaining = max_requests - len(requests)
            reset_time = now + window_seconds
            return True, remaining, reset_time
        else:
            remaining = 0
            reset_time = requests[0] + window_seconds
            return False, remaining, reset_time

    async def reset(self, key: str):
        """Reset rate limit for a key."""
        if key in self._requests:
            del self._requests[key]

    def get_stats(self) -> Dict:
        """Get rate limiter statistics."""
        return {
            'total_keys': len(self._requests),
            'type': 'in_memory'
        }


# Global rate limiter instance
_rate_limiter = RateLimiter()


def get_rate_limiter() -> RateLimiter:
    """Get global rate limiter instance."""
    return _rate_limiter
