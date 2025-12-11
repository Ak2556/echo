"""
Production-grade Trie implementation for autocomplete and search functionality.
"""

from typing import Dict, List, Optional, Set, Tuple

import structlog

logger = structlog.get_logger(__name__)


class TrieNode:
    """Node in the Trie data structure."""

    def __init__(self):
        self.children: Dict[str, "TrieNode"] = {}
        self.is_end_word = False
        self.frequency = 0
        self.metadata: Dict = {}


class Trie:
    """
    Production-grade Trie for autocomplete and prefix search.

    Features:
    - O(m) insertion and search where m is word length
    - Frequency-based ranking
    - Metadata storage per word
    - Prefix search with ranking
    - Memory-efficient implementation
    """

    def __init__(self):
        self.root = TrieNode()
        self.word_count = 0

    def insert(self, word: str, frequency: int = 1, metadata: Optional[Dict] = None) -> None:
        """
        Insert word into trie.

        Args:
            word: Word to insert
            frequency: Frequency/weight of the word
            metadata: Additional metadata to store with word
        """
        if not word:
            return

        word = word.lower().strip()
        node = self.root

        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]

        if not node.is_end_word:
            self.word_count += 1

        node.is_end_word = True
        node.frequency = frequency
        node.metadata = metadata or {}

        logger.debug("Word inserted", word=word, frequency=frequency)

    def search(self, word: str) -> bool:
        """
        Search for exact word in trie.

        Args:
            word: Word to search for

        Returns:
            True if word exists, False otherwise
        """
        node = self._find_node(word)
        return node is not None and node.is_end_word

    def starts_with(self, prefix: str) -> bool:
        """
        Check if any word starts with given prefix.

        Args:
            prefix: Prefix to check

        Returns:
            True if prefix exists, False otherwise
        """
        return self._find_node(prefix) is not None

    def autocomplete(self, prefix: str, limit: int = 10) -> List[Tuple[str, int, Dict]]:
        """
        Get autocomplete suggestions for prefix.

        Args:
            prefix: Prefix to search for
            limit: Maximum number of suggestions

        Returns:
            List of (word, frequency, metadata) tuples sorted by frequency
        """
        prefix = prefix.lower().strip()
        prefix_node = self._find_node(prefix)

        if not prefix_node:
            return []

        suggestions = []
        self._collect_words(prefix_node, prefix, suggestions)

        # Sort by frequency (descending) and then alphabetically
        suggestions.sort(key=lambda x: (-x[1], x[0]))

        return suggestions[:limit]

    def fuzzy_search(self, word: str, max_distance: int = 2) -> List[Tuple[str, int, int]]:
        """
        Fuzzy search with edit distance.

        Args:
            word: Word to search for
            max_distance: Maximum edit distance allowed

        Returns:
            List of (word, frequency, distance) tuples
        """
        word = word.lower().strip()
        results = []

        def dfs(node: TrieNode, current_word: str, distance: int):
            if distance > max_distance:
                return

            if node.is_end_word and distance <= max_distance:
                results.append((current_word, node.frequency, distance))

            if len(current_word) < len(word) + max_distance:
                # Try all possible characters
                for char, child_node in node.children.items():
                    # Exact match
                    if len(current_word) < len(word) and char == word[len(current_word)]:
                        dfs(child_node, current_word + char, distance)
                    else:
                        # Substitution, insertion, deletion
                        dfs(child_node, current_word + char, distance + 1)

        dfs(self.root, "", 0)

        # Sort by distance, then frequency, then alphabetically
        results.sort(key=lambda x: (x[2], -x[1], x[0]))

        return results

    def delete(self, word: str) -> bool:
        """
        Delete word from trie.

        Args:
            word: Word to delete

        Returns:
            True if word was deleted, False if not found
        """
        word = word.lower().strip()

        def _delete_recursive(node: TrieNode, word: str, index: int) -> bool:
            if index == len(word):
                if not node.is_end_word:
                    return False

                node.is_end_word = False
                node.frequency = 0
                node.metadata = {}

                # Return True if node has no children (can be deleted)
                return len(node.children) == 0

            char = word[index]
            if char not in node.children:
                return False

            should_delete_child = _delete_recursive(node.children[char], word, index + 1)

            if should_delete_child:
                del node.children[char]
                # Return True if current node can be deleted
                return not node.is_end_word and len(node.children) == 0

            return False

        if self.search(word):
            _delete_recursive(self.root, word, 0)
            self.word_count -= 1
            logger.debug("Word deleted", word=word)
            return True

        return False

    def get_all_words(self) -> List[Tuple[str, int, Dict]]:
        """
        Get all words in trie.

        Returns:
            List of (word, frequency, metadata) tuples
        """
        words = []
        self._collect_words(self.root, "", words)
        return sorted(words, key=lambda x: (-x[1], x[0]))

    def get_stats(self) -> Dict:
        """
        Get trie statistics.

        Returns:
            Dictionary with trie statistics
        """

        def count_nodes(node: TrieNode) -> int:
            count = 1
            for child in node.children.values():
                count += count_nodes(child)
            return count

        total_nodes = count_nodes(self.root)

        return {
            "word_count": self.word_count,
            "total_nodes": total_nodes,
            "memory_efficiency": self.word_count / total_nodes if total_nodes > 0 else 0,
        }

    def _find_node(self, prefix: str) -> Optional[TrieNode]:
        """Find node for given prefix."""
        prefix = prefix.lower().strip()
        node = self.root

        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]

        return node

    def _collect_words(
        self, node: TrieNode, prefix: str, words: List[Tuple[str, int, Dict]]
    ) -> None:
        """Recursively collect all words from node."""
        if node.is_end_word:
            words.append((prefix, node.frequency, node.metadata))

        for char, child_node in node.children.items():
            self._collect_words(child_node, prefix + char, words)


class AutocompleteService:
    """
    Production-ready autocomplete service using Trie.

    Features:
    - Multiple trie instances for different categories
    - Caching of popular searches
    - Analytics and monitoring
    """

    def __init__(self):
        self.tries: Dict[str, Trie] = {}
        self.search_cache: Dict[str, List] = {}
        self.search_stats: Dict[str, int] = {}

    def add_category(self, category: str) -> None:
        """Add new autocomplete category."""
        if category not in self.tries:
            self.tries[category] = Trie()
            logger.info("Autocomplete category added", category=category)

    def add_word(
        self, category: str, word: str, frequency: int = 1, metadata: Optional[Dict] = None
    ) -> None:
        """Add word to specific category."""
        if category not in self.tries:
            self.add_category(category)

        self.tries[category].insert(word, frequency, metadata)

        # Invalidate cache for this category
        cache_keys_to_remove = [k for k in self.search_cache.keys() if k.startswith(f"{category}:")]
        for key in cache_keys_to_remove:
            del self.search_cache[key]

    def get_suggestions(self, category: str, prefix: str, limit: int = 10) -> List[Dict]:
        """
        Get autocomplete suggestions.

        Args:
            category: Category to search in
            prefix: Prefix to search for
            limit: Maximum suggestions to return

        Returns:
            List of suggestion dictionaries
        """
        if category not in self.tries:
            return []

        cache_key = f"{category}:{prefix}:{limit}"

        # Check cache first
        if cache_key in self.search_cache:
            self.search_stats[cache_key] = self.search_stats.get(cache_key, 0) + 1
            return self.search_cache[cache_key]

        # Get suggestions from trie
        suggestions = self.tries[category].autocomplete(prefix, limit)

        # Format results
        formatted_suggestions = [
            {"text": word, "frequency": freq, "metadata": meta, "category": category}
            for word, freq, meta in suggestions
        ]

        # Cache results
        self.search_cache[cache_key] = formatted_suggestions
        self.search_stats[cache_key] = 1

        logger.debug(
            "Autocomplete suggestions generated",
            category=category,
            prefix=prefix,
            count=len(formatted_suggestions),
        )

        return formatted_suggestions

    def get_analytics(self) -> Dict:
        """Get autocomplete analytics."""
        return {
            "categories": list(self.tries.keys()),
            "category_stats": {category: trie.get_stats() for category, trie in self.tries.items()},
            "cache_size": len(self.search_cache),
            "popular_searches": sorted(self.search_stats.items(), key=lambda x: x[1], reverse=True)[
                :10
            ],
        }
