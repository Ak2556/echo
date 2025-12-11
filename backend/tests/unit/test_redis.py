"""
Unit tests for Redis utilities.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest

from app.core.redis import (
    MockRedis,
    RateLimiter,
    RedisManager,
    cache,
    close_redis,
    get_redis,
    init_redis,
    rate_limiter,
    redis_manager,
)


class TestMockRedis:
    """Tests for MockRedis implementation."""

    def test_mock_redis_creation(self):
        """Test MockRedis creation."""
        mock_redis = MockRedis()
        assert mock_redis._data == {}
        assert mock_redis._ttl == {}

    @pytest.mark.asyncio
    async def test_mock_redis_get_set(self):
        """Test MockRedis get and set operations."""
        mock_redis = MockRedis()

        # Test set and get
        result = await mock_redis.set("key1", "value1")
        assert result is True

        value = await mock_redis.get("key1")
        assert value == "value1"

    @pytest.mark.asyncio
    async def test_mock_redis_get_nonexistent(self):
        """Test MockRedis get for nonexistent key."""
        mock_redis = MockRedis()
        value = await mock_redis.get("nonexistent")
        assert value is None

    @pytest.mark.asyncio
    async def test_mock_redis_set_with_ttl(self):
        """Test MockRedis set with TTL."""
        mock_redis = MockRedis()

        result = await mock_redis.set("key1", "value1", ttl=300)
        assert result is True
        assert "key1" in mock_redis._ttl
        assert mock_redis._ttl["key1"] == 300

    @pytest.mark.asyncio
    async def test_mock_redis_delete(self):
        """Test MockRedis delete operation."""
        mock_redis = MockRedis()

        # Set some keys
        await mock_redis.set("key1", "value1")
        await mock_redis.set("key2", "value2", ttl=300)

        # Delete keys
        count = await mock_redis.delete("key1", "key2", "nonexistent")
        assert count == 2

        # Verify deletion
        assert await mock_redis.get("key1") is None
        assert await mock_redis.get("key2") is None
        assert "key1" not in mock_redis._ttl
        assert "key2" not in mock_redis._ttl

    @pytest.mark.asyncio
    async def test_mock_redis_exists(self):
        """Test MockRedis exists operation."""
        mock_redis = MockRedis()

        await mock_redis.set("key1", "value1")

        count = await mock_redis.exists("key1", "nonexistent")
        assert count == 1

    @pytest.mark.asyncio
    async def test_mock_redis_ping(self):
        """Test MockRedis ping operation."""
        mock_redis = MockRedis()
        result = await mock_redis.ping()
        assert result is True

    @pytest.mark.asyncio
    async def test_mock_redis_close(self):
        """Test MockRedis close operation."""
        mock_redis = MockRedis()
        await mock_redis.close()  # Should not raise any exception


class TestRedisManager:
    """Tests for RedisManager class."""

    def test_redis_manager_creation(self):
        """Test RedisManager creation."""
        manager = RedisManager()
        assert isinstance(manager.client, MockRedis)
        assert manager._initialized is False

    @pytest.mark.asyncio
    async def test_redis_manager_init(self):
        """Test RedisManager initialization."""
        manager = RedisManager()
        await manager.init()
        assert manager._initialized is True

    @pytest.mark.asyncio
    async def test_redis_manager_close(self):
        """Test RedisManager close."""
        manager = RedisManager()
        await manager.init()
        await manager.close()
        # Should not raise any exception

    @pytest.mark.asyncio
    async def test_redis_manager_close_legacy_method(self):
        """Test RedisManager close with legacy close method."""
        from unittest.mock import Mock

        manager = RedisManager()
        await manager.init()

        # Create a mock client with only close() method (not aclose)
        # Use a Mock that doesn't have aclose attribute
        class LegacyRedisClient:
            def __init__(self):
                self.close = AsyncMock()

        mock_client = LegacyRedisClient()
        manager.client = mock_client

        await manager.close()

        # Verify close was called (legacy method)
        mock_client.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_redis_manager_get_set(self):
        """Test RedisManager get and set operations."""
        manager = RedisManager()
        await manager.init()

        # Test set and get
        result = await manager.set("test_key", "test_value")
        assert result is True

        value = await manager.get("test_key")
        assert value == "test_value"

    @pytest.mark.asyncio
    async def test_redis_manager_get_with_default(self):
        """Test RedisManager get with default value."""
        manager = RedisManager()
        await manager.init()

        value = await manager.get("nonexistent", "default_value")
        assert value == "default_value"

    @pytest.mark.asyncio
    async def test_redis_manager_set_with_ttl(self):
        """Test RedisManager set with TTL."""
        manager = RedisManager()
        await manager.init()

        result = await manager.set("test_key", "test_value", ttl=300)
        assert result is True

    @pytest.mark.asyncio
    async def test_redis_manager_delete(self):
        """Test RedisManager delete operation."""
        manager = RedisManager()
        await manager.init()

        await manager.set("key1", "value1")
        await manager.set("key2", "value2")

        count = await manager.delete("key1", "key2")
        assert count == 2

    @pytest.mark.asyncio
    async def test_redis_manager_exists(self):
        """Test RedisManager exists operation."""
        manager = RedisManager()
        await manager.init()

        await manager.set("existing_key", "value")

        count = await manager.exists("existing_key", "nonexistent_key")
        assert count == 1

    @pytest.mark.asyncio
    async def test_redis_manager_health_check(self):
        """Test RedisManager health check."""
        manager = RedisManager()
        await manager.init()

        result = await manager.health_check()
        assert result is True


class TestGlobalRedisManager:
    """Tests for global redis_manager instance."""

    def test_global_redis_manager_instance(self):
        """Test global redis_manager instance."""
        assert isinstance(redis_manager, RedisManager)

    @pytest.mark.asyncio
    async def test_init_redis_function(self):
        """Test init_redis function."""
        await init_redis()
        assert redis_manager._initialized is True

    @pytest.mark.asyncio
    async def test_close_redis_function(self):
        """Test close_redis function."""
        await close_redis()
        # Should not raise any exception

    @pytest.mark.asyncio
    async def test_get_redis_function(self):
        """Test get_redis function."""
        result = await get_redis()
        assert result is redis_manager


import pytest_asyncio


@pytest_asyncio.fixture(scope="function", autouse=True)
async def clear_cache():
    """Clear redis cache before each test to ensure isolation."""
    # Ensure redis_manager is initialized
    if not redis_manager._initialized:
        await redis_manager.init()

    # Clear the MockRedis data
    if hasattr(redis_manager.client, "_data"):
        redis_manager.client._data.clear()
    if hasattr(redis_manager.client, "_ttl"):
        redis_manager.client._ttl.clear()
    yield

    # Clear after test as well
    if hasattr(redis_manager.client, "_data"):
        redis_manager.client._data.clear()
    if hasattr(redis_manager.client, "_ttl"):
        redis_manager.client._ttl.clear()


class TestCacheDecorator:
    """Tests for cache decorator."""

    @pytest.mark.asyncio
    async def test_cache_decorator_basic(self):
        """Test basic cache decorator functionality."""
        call_count = 0

        @cache(ttl=300, key_prefix="test")
        async def test_function(arg1, arg2):
            nonlocal call_count
            call_count += 1
            return f"result_{arg1}_{arg2}"

        # First call should execute function
        result1 = await test_function("a", "b")
        assert result1 == "result_a_b"
        assert call_count == 1

        # Second call should return cached result
        result2 = await test_function("a", "b")
        assert result2 == "result_a_b"
        assert call_count == 1  # Function not called again

    @pytest.mark.asyncio
    async def test_cache_decorator_different_args(self):
        """Test cache decorator with different arguments."""
        call_count = 0

        @cache(ttl=300)
        async def test_function(arg):
            nonlocal call_count
            call_count += 1
            return f"result_{arg}"

        # Different arguments should result in different cache keys
        result1 = await test_function("a")
        result2 = await test_function("b")

        assert result1 == "result_a"
        assert result2 == "result_b"
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_cache_decorator_custom_key_func(self):
        """Test cache decorator with custom key function."""
        call_count = 0

        # Use unique prefix to avoid cache collision from other tests
        import uuid

        test_id = str(uuid.uuid4())[:8]

        def custom_key_func(arg1, arg2):
            return f"custom_key_{test_id}_{arg1}"

        @cache(ttl=300, key_func=custom_key_func)
        async def test_function(arg1, arg2):
            nonlocal call_count
            call_count += 1
            return f"result_{arg1}_{arg2}"

        # Same arg1 should use same cache key regardless of arg2
        result1 = await test_function("a", "x")
        result2 = await test_function("a", "y")

        assert result1 == "result_a_x"
        assert result2 == "result_a_x"  # Cached result
        assert call_count == 1


class TestRateLimiter:
    """Tests for RateLimiter class."""

    def test_rate_limiter_creation(self):
        """Test RateLimiter creation."""
        manager = RedisManager()
        limiter = RateLimiter(manager)
        assert limiter.redis is manager
        assert limiter._counters == {}

    @pytest.mark.asyncio
    async def test_rate_limiter_is_allowed_first_request(self):
        """Test rate limiter allows first request."""
        manager = RedisManager()
        limiter = RateLimiter(manager)

        allowed, info = await limiter.is_allowed("user:123", 10, 60)

        assert allowed is True
        assert info["allowed"] is True
        assert info["current_requests"] == 0
        assert info["limit"] == 10
        assert info["window"] == 60

    @pytest.mark.asyncio
    async def test_rate_limiter_is_allowed_within_limit(self):
        """Test rate limiter allows requests within limit."""
        manager = RedisManager()
        limiter = RateLimiter(manager)

        # Make several requests
        for i in range(5):
            allowed, info = await limiter.is_allowed("user:123", 10, 60)
            assert allowed is True

        assert info["current_requests"] == 4  # 0-indexed

    @pytest.mark.asyncio
    async def test_rate_limiter_exceeds_limit(self):
        """Test rate limiter blocks requests exceeding limit."""
        manager = RedisManager()
        limiter = RateLimiter(manager)

        # Make requests up to limit
        for i in range(10):
            allowed, info = await limiter.is_allowed("user:123", 10, 60)
            assert allowed is True

        # Next request should be blocked
        allowed, info = await limiter.is_allowed("user:123", 10, 60)
        assert allowed is False
        assert info["allowed"] is False

    @pytest.mark.asyncio
    async def test_rate_limiter_different_keys(self):
        """Test rate limiter with different keys."""
        manager = RedisManager()
        limiter = RateLimiter(manager)

        # Different keys should have separate limits
        allowed1, _ = await limiter.is_allowed("user:123", 1, 60)
        allowed2, _ = await limiter.is_allowed("user:456", 1, 60)

        assert allowed1 is True
        assert allowed2 is True

    @pytest.mark.asyncio
    async def test_rate_limiter_burst_limit(self):
        """Test rate limiter with burst limit."""
        manager = RedisManager()
        limiter = RateLimiter(manager)

        allowed, info = await limiter.is_allowed("user:123", 10, 60, burst=15)

        assert allowed is True
        assert info["burst"] == 15
        assert info["burst_allowed"] is True


class TestGlobalRateLimiter:
    """Tests for global rate_limiter instance."""

    def test_global_rate_limiter_instance(self):
        """Test global rate_limiter instance."""
        assert isinstance(rate_limiter, RateLimiter)
        assert rate_limiter.redis is redis_manager


class TestRedisManagerExceptionHandling:
    """Tests for RedisManager exception handling."""

    @pytest.mark.asyncio
    async def test_get_with_exception(self):
        """Test get operation handles exceptions."""
        from unittest.mock import AsyncMock, patch

        manager = RedisManager()

        # Mock client.get to raise an exception
        with patch.object(
            manager.client, "get", new_callable=AsyncMock, side_effect=Exception("Redis error")
        ):
            result = await manager.get("test_key", default="fallback")
            # Should return default on error
            assert result == "fallback"

    @pytest.mark.asyncio
    async def test_set_with_exception(self):
        """Test set operation handles exceptions."""
        from unittest.mock import AsyncMock, patch

        manager = RedisManager()

        # Mock client.set to raise an exception
        with patch.object(
            manager.client, "set", new_callable=AsyncMock, side_effect=Exception("Redis error")
        ):
            result = await manager.set("test_key", "value")
            # Should return False on error
            assert result is False

    @pytest.mark.asyncio
    async def test_delete_with_exception(self):
        """Test delete operation handles exceptions."""
        from unittest.mock import AsyncMock, patch

        manager = RedisManager()

        # Mock client.delete to raise an exception
        with patch.object(
            manager.client, "delete", new_callable=AsyncMock, side_effect=Exception("Redis error")
        ):
            result = await manager.delete("test_key")
            # Should return 0 on error
            assert result == 0

    @pytest.mark.asyncio
    async def test_exists_with_exception(self):
        """Test exists operation handles exceptions."""
        from unittest.mock import AsyncMock, patch

        manager = RedisManager()

        # Mock client.exists to raise an exception
        with patch.object(
            manager.client, "exists", new_callable=AsyncMock, side_effect=Exception("Redis error")
        ):
            result = await manager.exists("test_key")
            # Should return 0 on error
            assert result == 0

    @pytest.mark.asyncio
    async def test_health_check_with_exception(self):
        """Test health_check operation handles exceptions."""
        from unittest.mock import AsyncMock, patch

        manager = RedisManager()

        # Mock client.ping to raise an exception
        with patch.object(
            manager.client, "ping", new_callable=AsyncMock, side_effect=Exception("Redis error")
        ):
            result = await manager.health_check()
            # Should return False on error
            assert result is False


class TestRedisErrorPaths:
    """Tests for Redis error handling and edge cases."""

    @pytest.mark.asyncio
    async def test_redis_manager_double_init(self):
        """Test that double initialization is handled correctly."""
        manager = RedisManager()
        await manager.init()
        assert manager._initialized is True

        # Second init should return early without error
        await manager.init()
        assert manager._initialized is True

    @pytest.mark.asyncio
    async def test_redis_manager_connection_failure_fallback(self):
        """Test fallback to mock Redis when connection fails."""
        manager = RedisManager()

        # Mock Redis to raise an exception on ping
        with patch("app.core.redis.REDIS_AVAILABLE", True):
            with patch("app.core.redis.ConnectionPool") as mock_pool:
                with patch("app.core.redis.aioredis") as mock_aioredis:
                    # Create a mock client that fails on ping
                    mock_client = AsyncMock()
                    mock_client.ping = AsyncMock(side_effect=Exception("Connection failed"))
                    mock_aioredis.Redis.return_value = mock_client

                    await manager.init("redis://localhost:6379/0")

                    # Should fall back to MockRedis
                    assert manager._initialized is True
                    assert isinstance(manager.client, MockRedis)
                    assert manager._use_real_redis is False

    @pytest.mark.asyncio
    async def test_redis_library_not_available(self):
        """Test behavior when redis library is not available."""
        manager = RedisManager()

        with patch("app.core.redis.REDIS_AVAILABLE", False):
            await manager.init()

            # Should use MockRedis
            assert manager._initialized is True
            assert isinstance(manager.client, MockRedis)
            assert manager._use_real_redis is False

    def test_redis_import_error_handling(self):
        """Test that ImportError during redis import is handled correctly."""
        import importlib
        import sys

        # Save the original modules
        original_redis = sys.modules.get("redis.asyncio")
        original_redis_package = sys.modules.get("redis")
        original_app_core_redis = sys.modules.get("app.core.redis")

        try:
            # Remove redis from sys.modules to simulate it not being installed
            if "redis.asyncio" in sys.modules:
                del sys.modules["redis.asyncio"]
            if "redis" in sys.modules:
                del sys.modules["redis"]
            if "app.core.redis" in sys.modules:
                del sys.modules["app.core.redis"]

            # Mock the import to raise ImportError
            import builtins

            original_import = builtins.__import__

            def mock_import(name, *args, **kwargs):
                if "redis" in name and "asyncio" in name:
                    raise ImportError("No module named 'redis.asyncio'")
                return original_import(name, *args, **kwargs)

            with patch.object(builtins, "__import__", side_effect=mock_import):
                # Reload the module - this will trigger the ImportError and execute lines 18-19
                import app.core.redis as redis_module

                importlib.reload(redis_module)

                # Verify REDIS_AVAILABLE is False
                assert redis_module.REDIS_AVAILABLE is False

        finally:
            # Restore original modules
            if original_redis is not None:
                sys.modules["redis.asyncio"] = original_redis
            if original_redis_package is not None:
                sys.modules["redis"] = original_redis_package
            if original_app_core_redis is not None:
                sys.modules["app.core.redis"] = original_app_core_redis
            else:
                # Reload to restore normal state
                import app.core.redis

                importlib.reload(app.core.redis)
