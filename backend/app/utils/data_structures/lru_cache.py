"""
Production-grade LRU Cache implementation with TTL support and thread safety.
"""

import threading
import time
from collections import OrderedDict
from typing import Any, Dict, Optional, Tuple

import structlog

logger = structlog.get_logger(__name__)


class LRUCache:
    """
    Thread-safe LRU Cache with TTL support and monitoring.

    Features:
    - O(1) get/put operations
    - TTL (Time To Live) support
    - Thread-safe operations
    - Memory usage monitoring
    - Hit/miss statistics
    """

    def __init__(self, capacity: int = 1000, default_ttl: int = 300):
        """
        Initialize LRU Cache.

        Args:
            capacity: Maximum number of items to store
            default_ttl: Default TTL in seconds (0 = no expiration)
        """
        self.capacity = capacity
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, Tuple[Any, float]] = OrderedDict()
        self.lock = threading.RLock()

        # Statistics
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                self.misses += 1
                logger.debug("Cache miss", key=key)
                return None

            value, expiry = self.cache[key]

            # Check if expired
            if expiry > 0 and time.time() > expiry:
                del self.cache[key]
                self.misses += 1
                logger.debug("Cache expired", key=key)
                return None

            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.hits += 1
            logger.debug("Cache hit", key=key)
            return value

    def put(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Put value in cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: TTL in seconds (None = use default)
        """
        with self.lock:
            ttl = ttl if ttl is not None else self.default_ttl
            expiry = time.time() + ttl if ttl > 0 else 0

            if key in self.cache:
                # Update existing key
                self.cache[key] = (value, expiry)
                self.cache.move_to_end(key)
            else:
                # Add new key
                if len(self.cache) >= self.capacity:
                    # Evict least recently used
                    oldest_key = next(iter(self.cache))
                    del self.cache[oldest_key]
                    self.evictions += 1
                    logger.debug("Cache eviction", evicted_key=oldest_key)

                self.cache[key] = (value, expiry)

            logger.debug("Cache put", key=key, ttl=ttl)

    def delete(self, key: str) -> bool:
        """
        Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if key was deleted, False if not found
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                logger.debug("Cache delete", key=key)
                return True
            return False

    def clear(self) -> None:
        """Clear all cache entries."""
        with self.lock:
            self.cache.clear()
            logger.info("Cache cleared")

    def size(self) -> int:
        """Get current cache size."""
        return len(self.cache)

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache statistics
        """
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0

        return {
            "size": len(self.cache),
            "capacity": self.capacity,
            "hits": self.hits,
            "misses": self.misses,
            "evictions": self.evictions,
            "hit_rate": round(hit_rate, 2),
            "total_requests": total_requests,
        }

    def cleanup_expired(self) -> int:
        """
        Remove expired entries.

        Returns:
            Number of expired entries removed
        """
        with self.lock:
            current_time = time.time()
            expired_keys = []

            for key, (_, expiry) in self.cache.items():
                if expiry > 0 and current_time > expiry:
                    expired_keys.append(key)

            for key in expired_keys:
                del self.cache[key]

            if expired_keys:
                logger.info("Expired entries cleaned", count=len(expired_keys))

            return len(expired_keys)


class LFUCache:
    """
    Least Frequently Used Cache implementation.

    Features:
    - O(1) get/put operations
    - Frequency-based eviction
    - Thread-safe operations
    """

    def __init__(self, capacity: int = 1000):
        """
        Initialize LFU Cache.

        Args:
            capacity: Maximum number of items to store
        """
        self.capacity = capacity
        self.cache: Dict[str, Any] = {}
        self.frequencies: Dict[str, int] = {}
        self.freq_to_keys: Dict[int, set] = {}
        self.min_freq = 0
        self.lock = threading.RLock()

    def get(self, key: str) -> Optional[Any]:
        """Get value and increment frequency."""
        with self.lock:
            if key not in self.cache:
                return None

            self._increment_freq(key)
            return self.cache[key]

    def put(self, key: str, value: Any) -> None:
        """Put value in cache."""
        with self.lock:
            if self.capacity <= 0:
                return

            if key in self.cache:
                self.cache[key] = value
                self._increment_freq(key)
                return

            if len(self.cache) >= self.capacity:
                self._evict()

            self.cache[key] = value
            self.frequencies[key] = 1
            self.freq_to_keys.setdefault(1, set()).add(key)
            self.min_freq = 1

    def _increment_freq(self, key: str) -> None:
        """Increment frequency of a key."""
        freq = self.frequencies[key]
        self.frequencies[key] = freq + 1

        self.freq_to_keys[freq].remove(key)
        if not self.freq_to_keys[freq] and freq == self.min_freq:
            self.min_freq += 1

        self.freq_to_keys.setdefault(freq + 1, set()).add(key)

    def _evict(self) -> None:
        """Evict least frequently used item."""
        key = self.freq_to_keys[self.min_freq].pop()
        del self.cache[key]
        del self.frequencies[key]
