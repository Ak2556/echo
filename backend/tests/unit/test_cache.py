"""
Unit tests for cache module.
"""

import time
from unittest.mock import AsyncMock, patch

import pytest

from app.core.cache import (
    CacheManager,
    InMemoryCache,
    cache_manager,
    cached,
    get_cache,
)


class TestInMemoryCache:
    """Tests for InMemoryCache class."""

    @pytest.mark.asyncio
    async def test_set_and_get(self):
        """Test setting and getting values."""
        cache = InMemoryCache()

        # Set a value
        await cache.set("test_key", "test_value", ttl=300)

        # Get the value
        result = await cache.get("test_key")
        assert result == "test_value"

    @pytest.mark.asyncio
    async def test_get_nonexistent_key(self):
        """Test getting a non-existent key."""
        cache = InMemoryCache()
        result = await cache.get("nonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_expiration(self):
        """Test that values expire after TTL."""
        cache = InMemoryCache()

        # Set with very short TTL
        await cache.set("expire_key", "expire_value", ttl=0.1)

        # Get immediately - should exist
        result = await cache.get("expire_key")
        assert result == "expire_value"

        # Wait for expiration
        time.sleep(0.2)

        # Get after expiration - should be None
        result = await cache.get("expire_key")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self):
        """Test deleting a key."""
        cache = InMemoryCache()

        # Set and verify
        await cache.set("delete_key", "delete_value")
        assert await cache.get("delete_key") == "delete_value"

        # Delete
        result = await cache.delete("delete_key")
        assert result is True

        # Verify deletion
        assert await cache.get("delete_key") is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(self):
        """Test deleting a non-existent key."""
        cache = InMemoryCache()
        result = await cache.delete("nonexistent")
        assert result is False

    @pytest.mark.asyncio
    async def test_clear(self):
        """Test clearing all cache entries."""
        cache = InMemoryCache()

        # Set multiple values
        await cache.set("key1", "value1")
        await cache.set("key2", "value2")
        await cache.set("key3", "value3")

        # Clear cache
        result = await cache.clear()
        assert result is True

        # Verify all entries are gone
        assert await cache.get("key1") is None
        assert await cache.get("key2") is None
        assert await cache.get("key3") is None

    @pytest.mark.asyncio
    async def test_exists(self):
        """Test checking if key exists."""
        cache = InMemoryCache()

        # Non-existent key
        assert await cache.exists("nonexistent") is False

        # Set a key
        await cache.set("exist_key", "exist_value")
        assert await cache.exists("exist_key") is True

        # Expired key
        await cache.set("expire_key", "expire_value", ttl=0.1)
        time.sleep(0.2)
        assert await cache.exists("expire_key") is False

    @pytest.mark.asyncio
    async def test_max_size_eviction(self):
        """Test that cache evicts oldest entry when max size reached."""
        cache = InMemoryCache(max_size=3)

        # Fill cache to max size
        await cache.set("key1", "value1")
        await cache.set("key2", "value2")
        await cache.set("key3", "value3")

        # Add one more - should evict oldest (key1)
        time.sleep(0.01)  # Ensure different timestamps
        await cache.set("key4", "value4")

        # key1 should be evicted
        assert await cache.get("key1") is None
        # Others should still exist
        assert await cache.get("key2") == "value2"
        assert await cache.get("key3") == "value3"
        assert await cache.get("key4") == "value4"

    @pytest.mark.asyncio
    async def test_cleanup_expired(self):
        """Test cleaning up expired entries."""
        cache = InMemoryCache()

        # Set multiple values with different TTLs
        await cache.set("short1", "value1", ttl=0.1)
        await cache.set("short2", "value2", ttl=0.1)
        await cache.set("long", "value3", ttl=10)

        # Wait for short TTL to expire
        time.sleep(0.2)

        # Cleanup expired entries
        await cache.cleanup_expired()

        # Short TTL entries should be gone
        assert await cache.get("short1") is None
        assert await cache.get("short2") is None
        # Long TTL entry should still exist
        assert await cache.get("long") == "value3"


class TestCacheManager:
    """Tests for CacheManager class."""

    @pytest.mark.asyncio
    async def test_initialization(self):
        """Test CacheManager initialization."""
        manager = CacheManager()
        assert manager.cache is not None
        assert manager.local_cache is manager.cache
        assert manager._connected is True

    @pytest.mark.asyncio
    async def test_connect(self):
        """Test cache connection."""
        manager = CacheManager()
        await manager.connect()
        # Should not raise any errors
        assert True

    @pytest.mark.asyncio
    async def test_disconnect(self):
        """Test cache disconnection."""
        manager = CacheManager()

        # Add some data
        await manager.set("key1", "value1")

        # Disconnect
        await manager.disconnect()

        # Cache should be cleared
        assert await manager.get("key1") is None

    @pytest.mark.asyncio
    async def test_get_set_operations(self):
        """Test get/set operations through manager."""
        manager = CacheManager()

        # Set value
        result = await manager.set("test", "value", ttl=300)
        assert result is True

        # Get value
        value = await manager.get("test")
        assert value == "value"

    @pytest.mark.asyncio
    async def test_delete_operation(self):
        """Test delete operation through manager."""
        manager = CacheManager()

        # Set and delete
        await manager.set("delete_test", "value")
        result = await manager.delete("delete_test")
        assert result is True

        # Verify deletion
        assert await manager.get("delete_test") is None

    @pytest.mark.asyncio
    async def test_clear_operation(self):
        """Test clear operation through manager."""
        manager = CacheManager()

        # Set multiple values
        await manager.set("key1", "value1")
        await manager.set("key2", "value2")

        # Clear
        result = await manager.clear()
        assert result is True

        # Verify all cleared
        assert await manager.get("key1") is None
        assert await manager.get("key2") is None

    def test_get_stats(self):
        """Test getting cache statistics."""
        manager = CacheManager()
        stats = manager.get_stats()

        assert "type" in stats
        assert stats["type"] == "in_memory"
        assert "total_entries" in stats
        assert "connected" in stats
        assert stats["connected"] is True


class TestGlobalCacheInstance:
    """Tests for global cache instance."""

    @pytest.mark.asyncio
    async def test_get_cache(self):
        """Test getting global cache instance."""
        cache = await get_cache()
        assert cache is cache_manager
        assert isinstance(cache, CacheManager)


class TestCachedDecorator:
    """Tests for cached decorator."""

    @pytest.mark.asyncio
    async def test_cached_function(self):
        """Test caching function results."""
        call_count = 0

        @cached(ttl=300)
        async def expensive_function(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        # First call - should execute function
        result1 = await expensive_function(5)
        assert result1 == 10
        assert call_count == 1

        # Second call - should use cache
        result2 = await expensive_function(5)
        assert result2 == 10
        assert call_count == 1  # Should not increase

    @pytest.mark.asyncio
    async def test_cached_with_different_args(self):
        """Test that different arguments create different cache entries."""
        call_count = 0

        @cached(ttl=300)
        async def cached_func(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        # Call with different arguments
        result1 = await cached_func(5)
        result2 = await cached_func(10)

        assert result1 == 10
        assert result2 == 20
        assert call_count == 2  # Both should execute

    @pytest.mark.asyncio
    async def test_cached_with_kwargs(self):
        """Test caching with keyword arguments."""
        call_count = 0

        @cached(ttl=300)
        async def cached_func(x: int, y: int = 0) -> int:
            nonlocal call_count
            call_count += 1
            return x + y

        # Call with kwargs
        result1 = await cached_func(5, y=3)
        assert result1 == 8
        assert call_count == 1

        # Call again with same kwargs - should use cache
        result2 = await cached_func(5, y=3)
        assert result2 == 8
        assert call_count == 1

    @pytest.mark.asyncio
    async def test_cached_with_key_prefix(self):
        """Test caching with custom key prefix."""
        call_count = 0

        @cached(ttl=300, key_prefix="custom_prefix")
        async def cached_func(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        # Should work normally
        result = await cached_func(5)
        assert result == 10
        assert call_count == 1

        # Second call should use cache
        result2 = await cached_func(5)
        assert result2 == 10
        assert call_count == 1

    @pytest.mark.asyncio
    async def test_cached_expiration(self):
        """Test that cached values expire."""
        # Clear cache before test
        await cache_manager.clear()

        call_count = 0

        @cached(ttl=0.1)
        async def cached_func(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        # First call
        result1 = await cached_func(5)
        assert result1 == 10
        assert call_count == 1

        # Wait for expiration
        time.sleep(0.2)

        # Should execute function again
        result2 = await cached_func(5)
        assert result2 == 10
        assert call_count == 2


class TestCacheIntegration:
    """Integration tests for cache system."""

    @pytest.mark.asyncio
    async def test_multiple_cache_operations(self):
        """Test multiple cache operations in sequence."""
        cache = InMemoryCache()

        # Set multiple values
        await cache.set("user:1", {"name": "Alice", "age": 30})
        await cache.set("user:2", {"name": "Bob", "age": 25})
        await cache.set("post:1", {"title": "Hello", "content": "World"})

        # Get values
        user1 = await cache.get("user:1")
        user2 = await cache.get("user:2")
        post1 = await cache.get("post:1")

        assert user1["name"] == "Alice"
        assert user2["age"] == 25
        assert post1["title"] == "Hello"

        # Delete one value
        await cache.delete("user:1")
        assert await cache.get("user:1") is None
        assert await cache.get("user:2") is not None

    @pytest.mark.asyncio
    async def test_cache_complex_data_types(self):
        """Test caching complex data types."""
        cache = InMemoryCache()

        # Test with dict
        await cache.set("dict_key", {"a": 1, "b": [2, 3, 4]})
        result = await cache.get("dict_key")
        assert result == {"a": 1, "b": [2, 3, 4]}

        # Test with list
        await cache.set("list_key", [1, 2, 3, "four"])
        result = await cache.get("list_key")
        assert result == [1, 2, 3, "four"]

        # Test with tuple
        await cache.set("tuple_key", (1, 2, 3))
        result = await cache.get("tuple_key")
        assert result == (1, 2, 3)
