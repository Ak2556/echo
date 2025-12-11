"""
Redis service for sessions, token blacklist, rate limiting, and caching.
"""

import json
from datetime import timedelta
from typing import Optional

# Import both real and fake redis
import redis.asyncio as redis
import structlog

try:
    from fakeredis import aioredis as fakeredis_module

    HAS_FAKEREDIS = True
except ImportError:
    HAS_FAKEREDIS = False

logger = structlog.get_logger(__name__)


class RedisService:
    """Redis service for auth operations."""

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.client: Optional[redis.Redis] = None

    async def connect(self):
        """Connect to Redis."""
        # Use fakeredis for development/testing
        if "fakeredis" in self.redis_url and HAS_FAKEREDIS:
            self.client = fakeredis_module.FakeRedis(decode_responses=True)
            logger.info("Connected to FakeRedis (development/test mode)")
        else:
            self.client = await redis.from_url(
                self.redis_url, encoding="utf-8", decode_responses=True
            )
            logger.info("Connected to Redis")

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from Redis")

    # Token Blacklist

    async def blacklist_token(self, jti: str, expires_in_seconds: int):
        """Add a token JTI to the blacklist."""
        key = f"blacklist:token:{jti}"
        await self.client.setex(key, expires_in_seconds, "1")
        logger.info("Token blacklisted", jti=jti)

    async def is_token_blacklisted(self, jti: str) -> bool:
        """Check if a token is blacklisted."""
        key = f"blacklist:token:{jti}"
        result = await self.client.exists(key)
        return bool(result)

    async def blacklist_user_tokens(self, user_id: str, expires_in_seconds: int = 86400):
        """Blacklist all tokens for a user (global logout)."""
        key = f"blacklist:user:{user_id}"
        await self.client.setex(key, expires_in_seconds, "1")
        logger.info("All user tokens blacklisted", user_id=user_id)

    async def is_user_tokens_blacklisted(self, user_id: str) -> bool:
        """Check if all user tokens are blacklisted."""
        key = f"blacklist:user:{user_id}"
        result = await self.client.exists(key)
        return bool(result)

    # Session Management

    async def store_session(self, session_id: str, data: dict, expires_in_seconds: int):
        """Store session data."""
        key = f"session:{session_id}"
        await self.client.setex(key, expires_in_seconds, json.dumps(data))

    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data."""
        key = f"session:{session_id}"
        data = await self.client.get(key)
        return json.loads(data) if data else None

    async def delete_session(self, session_id: str):
        """Delete a session."""
        key = f"session:{session_id}"
        await self.client.delete(key)

    async def extend_session(self, session_id: str, extends_by_seconds: int):
        """Extend session TTL."""
        key = f"session:{session_id}"
        await self.client.expire(key, extends_by_seconds)

    # Rate Limiting

    async def check_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if rate limit is exceeded.
        Returns (is_allowed, remaining_requests).
        """
        rate_key = f"ratelimit:{key}"

        # Get current count
        current = await self.client.get(rate_key)
        count = int(current) if current else 0

        if count >= max_requests:
            return False, 0

        # Increment
        pipe = self.client.pipeline()
        pipe.incr(rate_key)
        if count == 0:
            pipe.expire(rate_key, window_seconds)
        await pipe.execute()

        remaining = max_requests - count - 1
        return True, remaining

    async def get_rate_limit_remaining(self, key: str, max_requests: int) -> int:
        """Get remaining requests in rate limit window."""
        rate_key = f"ratelimit:{key}"
        current = await self.client.get(rate_key)
        count = int(current) if current else 0
        return max(0, max_requests - count)

    async def reset_rate_limit(self, key: str):
        """Reset a rate limit counter."""
        rate_key = f"ratelimit:{key}"
        await self.client.delete(rate_key)

    # Verification Codes

    async def store_verification_code(
        self, email: str, code: str, purpose: str, expires_in_seconds: int = 600  # 10 minutes
    ):
        """Store a verification code."""
        key = f"verify:{purpose}:{email}"
        data = {
            "code": code,
            "attempts": 0,
        }
        await self.client.setex(key, expires_in_seconds, json.dumps(data))

    async def verify_code(
        self, email: str, code: str, purpose: str, max_attempts: int = 3
    ) -> tuple[bool, int]:
        """
        Verify a code and track attempts.
        Returns (is_valid, attempts_remaining).
        """
        key = f"verify:{purpose}:{email}"
        data_str = await self.client.get(key)

        if not data_str:
            return False, 0

        data = json.loads(data_str)
        attempts = data["attempts"] + 1

        if attempts > max_attempts:
            await self.client.delete(key)
            return False, 0

        if data["code"] == code:
            await self.client.delete(key)
            return True, max_attempts

        # Update attempts
        data["attempts"] = attempts
        ttl = await self.client.ttl(key)
        await self.client.setex(key, ttl, json.dumps(data))

        return False, max(0, max_attempts - attempts)

    # Login Attempts Tracking

    async def increment_failed_login(self, identifier: str) -> int:
        """Increment failed login attempts. Returns total count."""
        key = f"failed_login:{identifier}"
        count = await self.client.incr(key)
        if count == 1:
            # Set expiry on first failure
            await self.client.expire(key, 3600)  # 1 hour
        return count

    async def reset_failed_login(self, identifier: str):
        """Reset failed login attempts."""
        key = f"failed_login:{identifier}"
        await self.client.delete(key)

    async def get_failed_login_count(self, identifier: str) -> int:
        """Get failed login attempt count."""
        key = f"failed_login:{identifier}"
        count = await self.client.get(key)
        return int(count) if count else 0

    # Token Family Tracking (for refresh token rotation)

    async def store_token_family(self, family_id: str, data: dict, expires_in_seconds: int):
        """Store token family data for rotation tracking."""
        key = f"token_family:{family_id}"
        await self.client.setex(key, expires_in_seconds, json.dumps(data))

    async def get_token_family(self, family_id: str) -> Optional[dict]:
        """Get token family data."""
        key = f"token_family:{family_id}"
        data = await self.client.get(key)
        return json.loads(data) if data else None

    async def invalidate_token_family(self, family_id: str):
        """Invalidate an entire token family (rotation detected)."""
        key = f"token_family:{family_id}"
        await self.client.delete(key)
        logger.warning("Token family invalidated", family_id=family_id)

    # Cache

    async def cache_set(self, key: str, value: any, expires_in_seconds: int):
        """Set a cached value."""
        cache_key = f"cache:{key}"
        await self.client.setex(cache_key, expires_in_seconds, json.dumps(value))

    async def cache_get(self, key: str) -> Optional[any]:
        """Get a cached value."""
        cache_key = f"cache:{key}"
        data = await self.client.get(cache_key)
        return json.loads(data) if data else None

    async def cache_delete(self, key: str):
        """Delete a cached value."""
        cache_key = f"cache:{key}"
        await self.client.delete(cache_key)


# Global instance
redis_service: Optional[RedisService] = None


async def init_redis_service(redis_url: str) -> RedisService:
    """Initialize the global Redis service."""
    global redis_service
    redis_service = RedisService(redis_url)
    await redis_service.connect()
    return redis_service


def get_redis_service() -> Optional[RedisService]:
    """Get the global Redis service instance."""
    return redis_service
