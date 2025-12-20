"""Simple caching system with in-memory fallback."""

import hashlib
import time
from functools import wraps
from typing import Any, Dict, Optional


class InMemoryCache:
    """Simple in-memory cache implementation."""

    def __init__(self, max_size: int = 1000):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._max_size = max_size

    async def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if entry["expires_at"] > time.time():
                return entry["value"]
            else:
                await self.delete(key)
        return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        if len(self._cache) >= self._max_size:
            # Simple eviction: remove oldest entry
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k].get("created_at", 0))
            await self.delete(oldest_key)

        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl,
            "created_at": time.time(),
        }
        return True

    async def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    async def clear(self) -> bool:
        self._cache.clear()
        return True

    async def exists(self, key: str) -> bool:
        return key in self._cache and self._cache[key]["expires_at"] > time.time()

    async def cleanup_expired(self):
        """Remove expired entries from cache."""
        now = time.time()
        expired_keys = [key for key, entry in self._cache.items() if entry["expires_at"] <= now]
        for key in expired_keys:
            await self.delete(key)


class CacheManager:
    """Main cache manager."""

    def __init__(self):
        self.cache = InMemoryCache(max_size=1000)
        self.local_cache = self.cache  # Alias for compatibility
        self._connected = True

    async def connect(self):
        """Initialize cache."""
        pass

    async def disconnect(self):
        """Close cache connections."""
        await self.cache.clear()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        return await self.cache.get(key)

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache."""
        return await self.cache.set(key, value, ttl)

    async def delete(self, key: str) -> bool:
        """Delete value from cache."""
        return await self.cache.delete(key)

    async def clear(self) -> bool:
        """Clear all cache."""
        return await self.cache.clear()

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "type": "in_memory",
            "total_entries": len(self.cache._cache),
            "connected": self._connected,
        }


# Global cache instance
cache_manager = CacheManager()


async def get_cache() -> CacheManager:
    """Get global cache manager instance."""
    return cache_manager


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results.

    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache keys
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix or func.__name__]

            # Add args to key
            for arg in args:
                if isinstance(arg, (str, int, float, bool)):
                    key_parts.append(str(arg))

            # Add kwargs to key (sorted for consistency)
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (str, int, float, bool)):
                    key_parts.append(f"{k}={v}")

            # Create hash for the key
            key_str = ":".join(key_parts)
            cache_key = hashlib.md5(key_str.encode()).hexdigest()

            # Try to get from cache
            cached_value = await cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Call function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ttl)
            return result

        return wrapper

    return decorator
