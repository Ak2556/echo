"""
Unit tests for auth redis service.
"""

import pytest
import json
from unittest.mock import AsyncMock, Mock, patch
from app.auth.redis_service import (
    RedisService,
    init_redis_service,
    get_redis_service,
)


class TestRedisService:
    """Tests for RedisService class."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService instance."""
        return RedisService(redis_url="fakeredis://localhost:6379")

    @pytest.mark.asyncio
    async def test_connect_fakeredis(self, redis_service):
        """Test connecting to FakeRedis."""
        with patch('app.auth.redis_service.HAS_FAKEREDIS', True):
            with patch('app.auth.redis_service.fakeredis_module') as mock_fakeredis:
                mock_client = AsyncMock()
                mock_fakeredis.FakeRedis.return_value = mock_client

                await redis_service.connect()

                assert redis_service.client is not None
                mock_fakeredis.FakeRedis.assert_called_once_with(decode_responses=True)

    @pytest.mark.asyncio
    async def test_connect_real_redis(self, redis_service):
        """Test connecting to real Redis."""
        redis_service.redis_url = "redis://localhost:6379"

        with patch('app.auth.redis_service.redis.from_url', new_callable=AsyncMock) as mock_from_url:
            mock_client = AsyncMock()
            mock_from_url.return_value = mock_client

            await redis_service.connect()

            assert redis_service.client == mock_client
            mock_from_url.assert_called_once_with(
                "redis://localhost:6379",
                encoding="utf-8",
                decode_responses=True
            )

    @pytest.mark.asyncio
    async def test_disconnect(self, redis_service):
        """Test disconnecting from Redis."""
        mock_client = AsyncMock()
        redis_service.client = mock_client

        await redis_service.disconnect()

        mock_client.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_disconnect_no_client(self, redis_service):
        """Test disconnect when no client exists."""
        redis_service.client = None

        # Should not raise an error
        await redis_service.disconnect()


class TestTokenBlacklist:
    """Tests for token blacklist operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_blacklist_token(self, redis_service):
        """Test blacklisting a token."""
        jti = "test-jti-123"
        expires_in = 3600

        await redis_service.blacklist_token(jti, expires_in)

        redis_service.client.setex.assert_called_once_with(
            f"blacklist:token:{jti}",
            expires_in,
            "1"
        )

    @pytest.mark.asyncio
    async def test_is_token_blacklisted_true(self, redis_service):
        """Test checking if token is blacklisted (true)."""
        jti = "test-jti-123"
        redis_service.client.exists.return_value = 1

        result = await redis_service.is_token_blacklisted(jti)

        assert result is True
        redis_service.client.exists.assert_called_once_with(f"blacklist:token:{jti}")

    @pytest.mark.asyncio
    async def test_is_token_blacklisted_false(self, redis_service):
        """Test checking if token is blacklisted (false)."""
        jti = "test-jti-123"
        redis_service.client.exists.return_value = 0

        result = await redis_service.is_token_blacklisted(jti)

        assert result is False

    @pytest.mark.asyncio
    async def test_blacklist_user_tokens(self, redis_service):
        """Test blacklisting all user tokens."""
        user_id = "user-123"
        expires_in = 86400

        await redis_service.blacklist_user_tokens(user_id, expires_in)

        redis_service.client.setex.assert_called_once_with(
            f"blacklist:user:{user_id}",
            expires_in,
            "1"
        )

    @pytest.mark.asyncio
    async def test_blacklist_user_tokens_default_expiry(self, redis_service):
        """Test blacklisting all user tokens with default expiry."""
        user_id = "user-123"

        await redis_service.blacklist_user_tokens(user_id)

        redis_service.client.setex.assert_called_once_with(
            f"blacklist:user:{user_id}",
            86400,  # default
            "1"
        )

    @pytest.mark.asyncio
    async def test_is_user_tokens_blacklisted_true(self, redis_service):
        """Test checking if all user tokens are blacklisted (true)."""
        user_id = "user-123"
        redis_service.client.exists.return_value = 1

        result = await redis_service.is_user_tokens_blacklisted(user_id)

        assert result is True

    @pytest.mark.asyncio
    async def test_is_user_tokens_blacklisted_false(self, redis_service):
        """Test checking if all user tokens are blacklisted (false)."""
        user_id = "user-123"
        redis_service.client.exists.return_value = 0

        result = await redis_service.is_user_tokens_blacklisted(user_id)

        assert result is False


class TestSessionManagement:
    """Tests for session management operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_store_session(self, redis_service):
        """Test storing session data."""
        session_id = "session-123"
        data = {"user_id": "user-123", "role": "admin"}
        expires_in = 3600

        await redis_service.store_session(session_id, data, expires_in)

        redis_service.client.setex.assert_called_once_with(
            f"session:{session_id}",
            expires_in,
            json.dumps(data)
        )

    @pytest.mark.asyncio
    async def test_get_session_exists(self, redis_service):
        """Test getting existing session data."""
        session_id = "session-123"
        data = {"user_id": "user-123", "role": "admin"}
        redis_service.client.get.return_value = json.dumps(data)

        result = await redis_service.get_session(session_id)

        assert result == data
        redis_service.client.get.assert_called_once_with(f"session:{session_id}")

    @pytest.mark.asyncio
    async def test_get_session_not_exists(self, redis_service):
        """Test getting non-existent session."""
        session_id = "session-123"
        redis_service.client.get.return_value = None

        result = await redis_service.get_session(session_id)

        assert result is None

    @pytest.mark.asyncio
    async def test_delete_session(self, redis_service):
        """Test deleting a session."""
        session_id = "session-123"

        await redis_service.delete_session(session_id)

        redis_service.client.delete.assert_called_once_with(f"session:{session_id}")

    @pytest.mark.asyncio
    async def test_extend_session(self, redis_service):
        """Test extending session TTL."""
        session_id = "session-123"
        extends_by = 1800

        await redis_service.extend_session(session_id, extends_by)

        redis_service.client.expire.assert_called_once_with(
            f"session:{session_id}",
            extends_by
        )


class TestRateLimiting:
    """Tests for rate limiting operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = Mock()
        service.client.get = AsyncMock()
        service.client.delete = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_check_rate_limit_allowed_first_request(self, redis_service):
        """Test rate limit check for first request."""
        key = "user:123:login"
        max_requests = 5
        window_seconds = 60

        redis_service.client.get.return_value = None
        mock_pipeline = Mock()
        mock_pipeline.incr = Mock()
        mock_pipeline.expire = Mock()
        mock_pipeline.execute = AsyncMock()
        redis_service.client.pipeline.return_value = mock_pipeline

        is_allowed, remaining = await redis_service.check_rate_limit(
            key, max_requests, window_seconds
        )

        assert is_allowed is True
        assert remaining == 4
        mock_pipeline.incr.assert_called_once_with(f"ratelimit:{key}")
        mock_pipeline.expire.assert_called_once_with(f"ratelimit:{key}", window_seconds)

    @pytest.mark.asyncio
    async def test_check_rate_limit_allowed_subsequent_request(self, redis_service):
        """Test rate limit check for subsequent request."""
        key = "user:123:login"
        max_requests = 5
        window_seconds = 60

        redis_service.client.get.return_value = "2"
        mock_pipeline = Mock()
        mock_pipeline.incr = Mock()
        mock_pipeline.expire = Mock()
        mock_pipeline.execute = AsyncMock()
        redis_service.client.pipeline.return_value = mock_pipeline

        is_allowed, remaining = await redis_service.check_rate_limit(
            key, max_requests, window_seconds
        )

        assert is_allowed is True
        assert remaining == 2
        mock_pipeline.incr.assert_called_once_with(f"ratelimit:{key}")
        # Expire should NOT be called for subsequent requests
        mock_pipeline.expire.assert_not_called()

    @pytest.mark.asyncio
    async def test_check_rate_limit_exceeded(self, redis_service):
        """Test rate limit check when exceeded."""
        key = "user:123:login"
        max_requests = 5
        window_seconds = 60

        redis_service.client.get.return_value = "5"

        is_allowed, remaining = await redis_service.check_rate_limit(
            key, max_requests, window_seconds
        )

        assert is_allowed is False
        assert remaining == 0

    @pytest.mark.asyncio
    async def test_get_rate_limit_remaining(self, redis_service):
        """Test getting remaining requests in rate limit."""
        key = "user:123:login"
        max_requests = 10

        redis_service.client.get.return_value = "3"

        remaining = await redis_service.get_rate_limit_remaining(key, max_requests)

        assert remaining == 7

    @pytest.mark.asyncio
    async def test_get_rate_limit_remaining_no_usage(self, redis_service):
        """Test getting remaining requests when no usage."""
        key = "user:123:login"
        max_requests = 10

        redis_service.client.get.return_value = None

        remaining = await redis_service.get_rate_limit_remaining(key, max_requests)

        assert remaining == 10

    @pytest.mark.asyncio
    async def test_reset_rate_limit(self, redis_service):
        """Test resetting rate limit counter."""
        key = "user:123:login"

        await redis_service.reset_rate_limit(key)

        redis_service.client.delete.assert_called_once_with(f"ratelimit:{key}")


class TestVerificationCodes:
    """Tests for verification code operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_store_verification_code(self, redis_service):
        """Test storing verification code."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"
        expires_in = 600

        await redis_service.store_verification_code(email, code, purpose, expires_in)

        expected_data = json.dumps({"code": code, "attempts": 0})
        redis_service.client.setex.assert_called_once_with(
            f"verify:{purpose}:{email}",
            expires_in,
            expected_data
        )

    @pytest.mark.asyncio
    async def test_store_verification_code_default_expiry(self, redis_service):
        """Test storing verification code with default expiry."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"

        await redis_service.store_verification_code(email, code, purpose)

        expected_data = json.dumps({"code": code, "attempts": 0})
        redis_service.client.setex.assert_called_once_with(
            f"verify:{purpose}:{email}",
            600,  # default
            expected_data
        )

    @pytest.mark.asyncio
    async def test_verify_code_success(self, redis_service):
        """Test successful code verification."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"

        stored_data = json.dumps({"code": code, "attempts": 0})
        redis_service.client.get.return_value = stored_data

        is_valid, attempts_remaining = await redis_service.verify_code(
            email, code, purpose
        )

        assert is_valid is True
        assert attempts_remaining == 3
        redis_service.client.delete.assert_called_once_with(f"verify:{purpose}:{email}")

    @pytest.mark.asyncio
    async def test_verify_code_invalid_code(self, redis_service):
        """Test verification with wrong code."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"

        stored_data = json.dumps({"code": "654321", "attempts": 0})
        redis_service.client.get.return_value = stored_data
        redis_service.client.ttl.return_value = 500

        is_valid, attempts_remaining = await redis_service.verify_code(
            email, code, purpose
        )

        assert is_valid is False
        assert attempts_remaining == 2
        # Should update attempts
        updated_data = json.dumps({"code": "654321", "attempts": 1})
        redis_service.client.setex.assert_called_once_with(
            f"verify:{purpose}:{email}",
            500,
            updated_data
        )

    @pytest.mark.asyncio
    async def test_verify_code_max_attempts_exceeded(self, redis_service):
        """Test verification when max attempts exceeded."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"

        stored_data = json.dumps({"code": "654321", "attempts": 3})
        redis_service.client.get.return_value = stored_data

        is_valid, attempts_remaining = await redis_service.verify_code(
            email, code, purpose
        )

        assert is_valid is False
        assert attempts_remaining == 0
        redis_service.client.delete.assert_called_once_with(f"verify:{purpose}:{email}")

    @pytest.mark.asyncio
    async def test_verify_code_not_found(self, redis_service):
        """Test verification when code doesn't exist."""
        email = "test@example.com"
        code = "123456"
        purpose = "registration"

        redis_service.client.get.return_value = None

        is_valid, attempts_remaining = await redis_service.verify_code(
            email, code, purpose
        )

        assert is_valid is False
        assert attempts_remaining == 0


class TestLoginAttempts:
    """Tests for login attempts tracking."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_increment_failed_login_first_attempt(self, redis_service):
        """Test incrementing failed login (first attempt)."""
        identifier = "user@example.com"

        redis_service.client.incr.return_value = 1

        count = await redis_service.increment_failed_login(identifier)

        assert count == 1
        redis_service.client.incr.assert_called_once_with(f"failed_login:{identifier}")
        redis_service.client.expire.assert_called_once_with(f"failed_login:{identifier}", 3600)

    @pytest.mark.asyncio
    async def test_increment_failed_login_subsequent_attempt(self, redis_service):
        """Test incrementing failed login (subsequent attempt)."""
        identifier = "user@example.com"

        redis_service.client.incr.return_value = 3

        count = await redis_service.increment_failed_login(identifier)

        assert count == 3
        # Expire should NOT be called for subsequent attempts
        redis_service.client.expire.assert_not_called()

    @pytest.mark.asyncio
    async def test_reset_failed_login(self, redis_service):
        """Test resetting failed login attempts."""
        identifier = "user@example.com"

        await redis_service.reset_failed_login(identifier)

        redis_service.client.delete.assert_called_once_with(f"failed_login:{identifier}")

    @pytest.mark.asyncio
    async def test_get_failed_login_count_exists(self, redis_service):
        """Test getting failed login count when exists."""
        identifier = "user@example.com"

        redis_service.client.get.return_value = "5"

        count = await redis_service.get_failed_login_count(identifier)

        assert count == 5

    @pytest.mark.asyncio
    async def test_get_failed_login_count_not_exists(self, redis_service):
        """Test getting failed login count when not exists."""
        identifier = "user@example.com"

        redis_service.client.get.return_value = None

        count = await redis_service.get_failed_login_count(identifier)

        assert count == 0


class TestTokenFamily:
    """Tests for token family operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_store_token_family(self, redis_service):
        """Test storing token family data."""
        family_id = "family-123"
        data = {"user_id": "user-123", "tokens": ["token1", "token2"]}
        expires_in = 7200

        await redis_service.store_token_family(family_id, data, expires_in)

        redis_service.client.setex.assert_called_once_with(
            f"token_family:{family_id}",
            expires_in,
            json.dumps(data)
        )

    @pytest.mark.asyncio
    async def test_get_token_family_exists(self, redis_service):
        """Test getting existing token family."""
        family_id = "family-123"
        data = {"user_id": "user-123", "tokens": ["token1", "token2"]}

        redis_service.client.get.return_value = json.dumps(data)

        result = await redis_service.get_token_family(family_id)

        assert result == data

    @pytest.mark.asyncio
    async def test_get_token_family_not_exists(self, redis_service):
        """Test getting non-existent token family."""
        family_id = "family-123"

        redis_service.client.get.return_value = None

        result = await redis_service.get_token_family(family_id)

        assert result is None

    @pytest.mark.asyncio
    async def test_invalidate_token_family(self, redis_service):
        """Test invalidating token family."""
        family_id = "family-123"

        await redis_service.invalidate_token_family(family_id)

        redis_service.client.delete.assert_called_once_with(f"token_family:{family_id}")


class TestCache:
    """Tests for cache operations."""

    @pytest.fixture
    def redis_service(self):
        """Create a RedisService with mocked client."""
        service = RedisService(redis_url="fakeredis://localhost:6379")
        service.client = AsyncMock()
        return service

    @pytest.mark.asyncio
    async def test_cache_set(self, redis_service):
        """Test setting cached value."""
        key = "user:123:profile"
        value = {"name": "John", "email": "john@example.com"}
        expires_in = 300

        await redis_service.cache_set(key, value, expires_in)

        redis_service.client.setex.assert_called_once_with(
            f"cache:{key}",
            expires_in,
            json.dumps(value)
        )

    @pytest.mark.asyncio
    async def test_cache_get_exists(self, redis_service):
        """Test getting existing cached value."""
        key = "user:123:profile"
        value = {"name": "John", "email": "john@example.com"}

        redis_service.client.get.return_value = json.dumps(value)

        result = await redis_service.cache_get(key)

        assert result == value

    @pytest.mark.asyncio
    async def test_cache_get_not_exists(self, redis_service):
        """Test getting non-existent cached value."""
        key = "user:123:profile"

        redis_service.client.get.return_value = None

        result = await redis_service.cache_get(key)

        assert result is None

    @pytest.mark.asyncio
    async def test_cache_delete(self, redis_service):
        """Test deleting cached value."""
        key = "user:123:profile"

        await redis_service.cache_delete(key)

        redis_service.client.delete.assert_called_once_with(f"cache:{key}")


class TestGlobalInstance:
    """Tests for global instance management."""

    @pytest.mark.asyncio
    async def test_init_redis_service(self):
        """Test initializing global Redis service."""
        redis_url = "fakeredis://localhost:6379"

        with patch('app.auth.redis_service.RedisService') as MockRedisService:
            mock_service = AsyncMock()
            MockRedisService.return_value = mock_service

            result = await init_redis_service(redis_url)

            assert result == mock_service
            MockRedisService.assert_called_once_with(redis_url)
            mock_service.connect.assert_called_once()

    def test_get_redis_service(self):
        """Test getting global Redis service instance."""
        from app.auth import redis_service as redis_module

        # Set a mock service
        mock_service = Mock()
        redis_module.redis_service = mock_service

        result = get_redis_service()

        assert result == mock_service

        # Clean up
        redis_module.redis_service = None
