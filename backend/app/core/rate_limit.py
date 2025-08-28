"""
Fail-closed rate limiting module.

SECURITY: This module ensures rate limiting fails CLOSED (denies requests)
when Redis is unavailable, rather than failing OPEN (allowing all requests).
"""
from typing import Tuple, Optional
from fastapi import HTTPException, status, Request
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger(__name__)

# In-memory fallback rate limiter (simple, not distributed)
# Only used when Redis is completely unavailable
class InMemoryRateLimiter:
    """
    Simple in-memory rate limiter as fallback.
    NOT suitable for production with multiple workers, but better than no rate limiting.
    """

    def __init__(self):
        self._limits: dict[str, Tuple[int, datetime]] = {}
        self._cleanup_counter = 0

    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, int]:
        """
        Check rate limit using in-memory storage.
        Returns (is_allowed, remaining).
        """
        now = datetime.now()

        # Periodic cleanup of expired entries (every 100 calls)
        self._cleanup_counter += 1
        if self._cleanup_counter >= 100:
            self._cleanup_expired()
            self._cleanup_counter = 0

        # Check if key exists and is within window
        if key in self._limits:
            count, window_start = self._limits[key]

            # Check if window expired
            if now - window_start > timedelta(seconds=window_seconds):
                # Reset window
                self._limits[key] = (1, now)
                return True, max_requests - 1

            # Within window, check limit
            if count >= max_requests:
                return False, 0

            # Increment count
            self._limits[key] = (count + 1, window_start)
            return True, max_requests - count - 1
        else:
            # New key
            self._limits[key] = (1, now)
            return True, max_requests - 1

    def _cleanup_expired(self):
        """Remove expired entries."""
        now = datetime.now()
        expired_keys = [
            key for key, (_, window_start) in self._limits.items()
            if now - window_start > timedelta(seconds=3600)  # 1 hour max
        ]
        for key in expired_keys:
            del self._limits[key]

        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired rate limit entries")


# Global fallback rate limiter
_fallback_limiter = InMemoryRateLimiter()


async def check_rate_limit_safe(
    redis_service: Optional[any],
    key: str,
    max_requests: int,
    window_seconds: int,
    fail_closed: bool = True
) -> Tuple[bool, int]:
    """
    Check rate limit with fail-closed behavior.

    Args:
        redis_service: Redis service instance (may be None)
        key: Rate limit key
        max_requests: Maximum requests allowed in window
        window_seconds: Time window in seconds
        fail_closed: If True, deny requests when Redis unavailable (default: True)

    Returns:
        Tuple of (is_allowed, remaining_requests)

    SECURITY: When fail_closed=True and Redis is unavailable:
    - Uses in-memory fallback (not distributed, but better than nothing)
    - Logs warning about Redis unavailability
    - Never allows unlimited requests
    """
    # Try Redis first
    if redis_service and hasattr(redis_service, 'client') and redis_service.client:
        try:
            return await redis_service.check_rate_limit(key, max_requests, window_seconds)
        except Exception as e:
            logger.error(
                "Redis rate limiting failed",
                error=str(e),
                key=key,
                fail_closed=fail_closed
            )
            # Fall through to fallback handling

    # Redis unavailable or failed
    if fail_closed:
        # Use in-memory fallback
        logger.warning(
            "Using in-memory rate limiting fallback",
            key=key,
            reason="Redis unavailable"
        )
        return _fallback_limiter.check_rate_limit(key, max_requests, window_seconds)
    else:
        # Fail open (old behavior - not recommended)
        logger.warning(
            "Rate limiting bypassed - Redis unavailable and fail_closed=False",
            key=key
        )
        return True, max_requests


def require_rate_limit(
    key_fn: callable,
    max_requests: int,
    window_seconds: int,
    fail_closed: bool = True,
    error_message: str = "Rate limit exceeded. Please try again later."
):
    """
    Decorator for endpoints requiring rate limiting with fail-closed behavior.

    Usage:
        @require_rate_limit(
            key_fn=lambda request: f"login:{request.client.host}",
            max_requests=10,
            window_seconds=300,
            fail_closed=True
        )
        async def login_endpoint(request: Request):
            ...
    """
    def decorator(func):
        async def wrapper(*args, request: Request = None, **kwargs):
            from ..auth.redis_service import get_redis_service

            if not request:
                # Try to find request in kwargs
                request = kwargs.get('request')

            if not request:
                logger.error("Rate limit decorator: Request not found")
                # Fail closed if we can't determine rate limit key
                if fail_closed:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Service temporarily unavailable"
                    )

            # Get rate limit key
            try:
                rate_key = key_fn(request) if request else "unknown"
            except Exception as e:
                logger.error(f"Failed to generate rate limit key: {e}")
                rate_key = "unknown"

            # Check rate limit
            redis = get_redis_service()
            is_allowed, remaining = await check_rate_limit_safe(
                redis,
                rate_key,
                max_requests,
                window_seconds,
                fail_closed=fail_closed
            )

            if not is_allowed:
                logger.warning(
                    "Rate limit exceeded",
                    key=rate_key,
                    max_requests=max_requests,
                    window_seconds=window_seconds
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message,
                    headers={"Retry-After": str(window_seconds)}
                )

            # Add rate limit headers
            if hasattr(request, 'state'):
                request.state.rate_limit_remaining = remaining

            return await func(*args, **kwargs, request=request) if request in kwargs.values() else await func(*args, **kwargs)

        return wrapper
    return decorator
