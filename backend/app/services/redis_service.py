"""
Production-grade Redis service for distributed caching and rate limiting.
"""
import redis.asyncio as redis
from typing import Optional, Any
import json
import structlog
from datetime import timedelta

from app.config.settings import settings

logger = structlog.get_logger(__name__)


class RedisService:
    """Distributed Redis service for caching and rate limiting."""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.connected = False

    async def connect(self):
        """Connect to Redis."""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                max_connections=settings.redis_max_connections,
                decode_responses=True,
                encoding="utf-8",
            )
            # Test connection
            await self.redis_client.ping()
            self.connected = True
            logger.info("Redis connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.connected = False
            # Don't raise - allow app to start without Redis

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis_client:
            await self.redis_client.close()
            self.connected = False
            logger.info("Redis disconnected")

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        if not self.connected:
            return None
        try:
            return await self.redis_client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error: {e}", key=key)
            return None

    async def set(
        self,
        key: str,
        value: str,
        expire: Optional[int] = None
    ) -> bool:
        """Set value in Redis with optional expiration."""
        if not self.connected:
            return False
        try:
            if expire:
                await self.redis_client.setex(key, expire, value)
            else:
                await self.redis_client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error: {e}", key=key)
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        if not self.connected:
            return False
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}", key=key)
            return False

    async def incr(self, key: str) -> Optional[int]:
        """Increment counter in Redis."""
        if not self.connected:
            return None
        try:
            return await self.redis_client.incr(key)
        except Exception as e:
            logger.error(f"Redis INCR error: {e}", key=key)
            return None

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key."""
        if not self.connected:
            return False
        try:
            await self.redis_client.expire(key, seconds)
            return True
        except Exception as e:
            logger.error(f"Redis EXPIRE error: {e}", key=key)
            return False

    async def ttl(self, key: str) -> Optional[int]:
        """Get TTL of key."""
        if not self.connected:
            return None
        try:
            return await self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Redis TTL error: {e}", key=key)
            return None

    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        if not self.connected:
            return False
        try:
            return bool(await self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}", key=key)
            return False

    # Rate limiting methods

    async def check_rate_limit(
        self,
        identifier: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, int, int]:
        """
        Check if request is within rate limit using sliding window.

        Args:
            identifier: Unique identifier (e.g., IP address, user ID)
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds

        Returns:
            tuple: (allowed, remaining, reset_time)
        """
        if not self.connected:
            # Allow request if Redis is down (fail open for availability)
            return True, max_requests, 0

        key = f"rate_limit:{identifier}"

        try:
            # Get current count
            current = await self.redis_client.get(key)

            if current is None:
                # First request in window
                await self.redis_client.setex(key, window_seconds, "1")
                return True, max_requests - 1, window_seconds

            current_count = int(current)

            if current_count >= max_requests:
                # Rate limit exceeded
                ttl = await self.redis_client.ttl(key)
                return False, 0, ttl

            # Increment counter
            new_count = await self.redis_client.incr(key)
            remaining = max(0, max_requests - new_count)
            ttl = await self.redis_client.ttl(key)

            return True, remaining, ttl

        except Exception as e:
            logger.error(f"Rate limit check error: {e}", identifier=identifier)
            # Fail open on error
            return True, max_requests, 0

    async def reset_rate_limit(self, identifier: str) -> bool:
        """Reset rate limit for identifier."""
        key = f"rate_limit:{identifier}"
        return await self.delete(key)

    # Caching methods

    async def cache_set(
        self,
        key: str,
        value: Any,
        ttl: int = 300
    ) -> bool:
        """Cache a value with JSON serialization."""
        try:
            json_value = json.dumps(value)
            return await self.set(f"cache:{key}", json_value, ttl)
        except Exception as e:
            logger.error(f"Cache set error: {e}", key=key)
            return False

    async def cache_get(self, key: str) -> Optional[Any]:
        """Get cached value with JSON deserialization."""
        try:
            value = await self.get(f"cache:{key}")
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}", key=key)
            return None

    async def cache_delete(self, key: str) -> bool:
        """Delete cached value."""
        return await self.delete(f"cache:{key}")

    async def cache_clear_pattern(self, pattern: str) -> int:
        """Clear all cache keys matching pattern."""
        if not self.connected:
            return 0
        try:
            keys = []
            async for key in self.redis_client.scan_iter(f"cache:{pattern}"):
                keys.append(key)
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}", pattern=pattern)
            return 0

    # Health check
    async def health_check(self) -> dict:
        """Check Redis health."""
        try:
            if not self.connected:
                return {
                    "status": "unhealthy",
                    "connected": False,
                    "error": "Not connected"
                }

            # Ping Redis
            await self.redis_client.ping()

            # Get info
            info = await self.redis_client.info()

            return {
                "status": "healthy",
                "connected": True,
                "version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_seconds": info.get("uptime_in_seconds"),
            }
        except Exception as e:
            logger.error(f"Redis health check error: {e}")
            return {
                "status": "unhealthy",
                "connected": self.connected,
                "error": str(e)
            }


# Global Redis service instance
redis_service = RedisService()
