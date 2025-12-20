"""
Advanced search algorithms for content discovery.
"""

import math
import re
from collections import Counter, defaultdict
from typing import Any, Dict, List, Set, Tuple

import structlog

logger = structlog.get_logger(__name__)


class TFIDFSearchEngine:
    """
    TF-IDF based search engine for content ranking.

    Features:
    - Term frequency and inverse document frequency scoring
    - Phrase matching with proximity scoring
    - Fuzzy matching for typos
    - Real-time index updates
    """

    def __init__(self):
        self.documents: Dict[str, str] = {}  # doc_id -> content
        self.term_frequencies: Dict[str, Dict[str, int]] = {}  # doc_id -> {term: count}
        self.document_frequencies: Dict[str, int] = {}  # term -> doc_count
        self.total_documents = 0
        self.vocabulary: Set[str] = set()

    def add_document(self, doc_id: str, content: str, metadata: Dict[str, Any] = None) -> None:
        """
        Add or update a document in the search index.

        Args:
            doc_id: Unique document identifier
            content: Document content to index
            metadata: Additional document metadata
        """
        # Remove existing document if it exists
        if doc_id in self.documents:
            self.remove_document(doc_id)

        # Preprocess content
        terms = self._preprocess_text(content)

        # Store document
        self.documents[doc_id] = content

        # Calculate term frequencies
        term_counts = Counter(terms)
        self.term_frequencies[doc_id] = dict(term_counts)

        # Update document frequencies
        for term in set(terms):
            self.document_frequencies[term] = self.document_frequencies.get(term, 0) + 1
            self.vocabulary.add(term)

        self.total_documents += 1

        logger.debug("Document indexed", doc_id=doc_id, terms_count=len(set(terms)))

    def remove_document(self, doc_id: str) -> bool:
        """
        Remove a document from the search index.

        Args:
            doc_id: Document identifier to remove

        Returns:
            True if document was removed, False if not found
        """
        if doc_id not in self.documents:
            return False

        # Update document frequencies
        for term in self.term_frequencies[doc_id]:
            self.document_frequencies[term] -= 1
            if self.document_frequencies[term] == 0:
                del self.document_frequencies[term]
                self.vocabulary.discard(term)

        # Remove document data
        del self.documents[doc_id]
        del self.term_frequencies[doc_id]
        self.total_documents -= 1

        logger.debug("Document removed", doc_id=doc_id)
        return True

    def search(
        self, query: str, limit: int = 20, min_score: float = 0.1
    ) -> List[Tuple[str, float]]:
        """
        Search for documents matching the query.

        Args:
            query: Search query
            limit: Maximum number of results
            min_score: Minimum relevance score

        Returns:
            List of (doc_id, score) tuples sorted by relevance
        """
        if not query.strip():
            return []

        query_terms = self._preprocess_text(query)
        if not query_terms:
            return []

        # Calculate TF-IDF scores for each document
        scores = {}

        for doc_id in self.documents:
            score = self._calculate_tfidf_score(doc_id, query_terms)

            # Add phrase matching bonus
            phrase_bonus = self._calculate_phrase_bonus(doc_id, query, query_terms)
            score += phrase_bonus

            if score >= min_score:
                scores[doc_id] = score

        # Sort by score (descending)
        results = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        logger.debug(
            "Search completed",
            query=query,
            results_count=len(results),
            top_score=results[0][1] if results else 0,
        )

        return results[:limit]

    def suggest_corrections(self, query: str, max_suggestions: int = 5) -> List[str]:
        """
        Suggest spelling corrections for query terms.

        Args:
            query: Original query
            max_suggestions: Maximum number of suggestions

        Returns:
            List of suggested corrections
        """
        query_terms = self._preprocess_text(query)
        suggestions = []

        for term in query_terms:
            if term not in self.vocabulary:
                # Find similar terms using edit distance
                similar_terms = self._find_similar_terms(term, max_distance=2)
                suggestions.extend(similar_terms[:2])  # Top 2 per term

        return list(set(suggestions))[:max_suggestions]

    def get_popular_terms(self, limit: int = 20) -> List[Tuple[str, int]]:
        """
        Get most popular terms across all documents.

        Args:
            limit: Maximum number of terms to return

        Returns:
            List of (term, frequency) tuples
        """
        return sorted(self.document_frequencies.items(), key=lambda x: x[1], reverse=True)[:limit]

    def _preprocess_text(self, text: str) -> List[str]:
        """Preprocess text into searchable terms."""
        # Convert to lowercase
        text = text.lower()

        # Remove special characters and split into words
        words = re.findall(r"\b\w+\b", text)

        # Filter out very short words and common stop words
        stop_words = {
            "a",
            "an",
            "and",
            "are",
            "as",
            "at",
            "be",
            "by",
            "for",
            "from",
            "has",
            "he",
            "in",
            "is",
            "it",
            "its",
            "of",
            "on",
            "that",
            "the",
            "to",
            "was",
            "will",
            "with",
            "the",
            "this",
            "but",
            "they",
            "have",
            "had",
            "what",
            "said",
            "each",
            "which",
            "their",
            "time",
            "if",
        }

        terms = [word for word in words if len(word) > 2 and word not in stop_words]

        return terms

    def _calculate_tfidf_score(self, doc_id: str, query_terms: List[str]) -> float:
        """Calculate TF-IDF score for a document given query terms."""
        score = 0.0
        doc_terms = self.term_frequencies[doc_id]
        doc_length = sum(doc_terms.values())

        for term in query_terms:
            if term in doc_terms:
                # Term frequency (normalized by document length)
                tf = doc_terms[term] / doc_length

                # Inverse document frequency
                idf = math.log(self.total_documents / self.document_frequencies[term])

                # TF-IDF score
                score += tf * idf

        return score

    def _calculate_phrase_bonus(
        self, doc_id: str, original_query: str, query_terms: List[str]
    ) -> float:
        """Calculate bonus score for phrase matching."""
        if len(query_terms) < 2:
            return 0.0

        content = self.documents[doc_id].lower()

        # Check for exact phrase match
        if original_query.lower() in content:
            return 0.5  # Significant bonus for exact phrase

        # Check for proximity of terms
        positions = {}
        for term in query_terms:
            positions[term] = [
                m.start() for m in re.finditer(r"\b" + re.escape(term) + r"\b", content)
            ]

        # Calculate proximity score
        proximity_score = 0.0
        for i, term1 in enumerate(query_terms[:-1]):
            term2 = query_terms[i + 1]

            if term1 in positions and term2 in positions:
                min_distance = float("inf")
                for pos1 in positions[term1]:
                    for pos2 in positions[term2]:
                        distance = abs(pos2 - pos1)
                        min_distance = min(min_distance, distance)

                if min_distance < 100:  # Within 100 characters
                    proximity_score += 0.1 / (1 + min_distance / 10)

        return proximity_score

    def _find_similar_terms(self, term: str, max_distance: int = 2) -> List[str]:
        """Find terms similar to the given term using edit distance."""
        similar_terms = []

        for vocab_term in self.vocabulary:
            if abs(len(vocab_term) - len(term)) <= max_distance:
                distance = self._edit_distance(term, vocab_term)
                if distance <= max_distance:
                    similar_terms.append((vocab_term, distance))

        # Sort by edit distance and frequency
        similar_terms.sort(key=lambda x: (x[1], -self.document_frequencies[x[0]]))

        return [term for term, _ in similar_terms]

    def _edit_distance(self, s1: str, s2: str) -> int:
        """Calculate edit distance between two strings."""
        if len(s1) < len(s2):
            s1, s2 = s2, s1

        if len(s2) == 0:
            return len(s1)

        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]


class SemanticSearchEngine:
    """
    Semantic search engine using embeddings for meaning-based search.

    This would integrate with vector databases like ChromaDB for
    production-grade semantic search capabilities.
    """

    def __init__(self):
        self.embeddings: Dict[str, List[float]] = {}
        self.documents: Dict[str, str] = {}

    async def add_document(self, doc_id: str, content: str, embedding: List[float]) -> None:
        """Add document with its embedding vector."""
        self.documents[doc_id] = content
        self.embeddings[doc_id] = embedding

        logger.debug("Document added to semantic index", doc_id=doc_id)

    async def search(
        self, query_embedding: List[float], limit: int = 20, threshold: float = 0.7
    ) -> List[Tuple[str, float]]:
        """Search using semantic similarity."""
        similarities = []

        for doc_id, doc_embedding in self.embeddings.items():
            similarity = self._cosine_similarity(query_embedding, doc_embedding)
            if similarity >= threshold:
                similarities.append((doc_id, similarity))

        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)

        return similarities[:limit]

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(a * a for a in vec2))

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)


class HybridSearchEngine:
    """
    Hybrid search engine combining TF-IDF and semantic search.

    Provides the best of both worlds: exact term matching and
    semantic understanding.
    """

    def __init__(self, tfidf_weight: float = 0.6, semantic_weight: float = 0.4):
        self.tfidf_engine = TFIDFSearchEngine()
        self.semantic_engine = SemanticSearchEngine()
        self.tfidf_weight = tfidf_weight
        self.semantic_weight = semantic_weight

    async def search(
        self, query: str, query_embedding: List[float], limit: int = 20
    ) -> List[Tuple[str, float]]:
        """
        Perform hybrid search combining TF-IDF and semantic results.

        Args:
            query: Text query
            query_embedding: Query embedding vector
            limit: Maximum results to return

        Returns:
            List of (doc_id, combined_score) tuples
        """
        # Get TF-IDF results
        tfidf_results = self.tfidf_engine.search(query, limit=limit * 2)
        tfidf_scores = dict(tfidf_results)

        # Get semantic results
        semantic_results = await self.semantic_engine.search(query_embedding, limit=limit * 2)
        semantic_scores = dict(semantic_results)

        # Combine scores
        all_doc_ids = set(tfidf_scores.keys()) | set(semantic_scores.keys())
        combined_scores = []

        for doc_id in all_doc_ids:
            tfidf_score = tfidf_scores.get(doc_id, 0.0)
            semantic_score = semantic_scores.get(doc_id, 0.0)

            # Normalize scores (simple min-max normalization)
            max_tfidf = max(tfidf_scores.values()) if tfidf_scores else 1.0
            max_semantic = max(semantic_scores.values()) if semantic_scores else 1.0

            normalized_tfidf = tfidf_score / max_tfidf if max_tfidf > 0 else 0
            normalized_semantic = semantic_score / max_semantic if max_semantic > 0 else 0

            # Weighted combination
            combined_score = (
                self.tfidf_weight * normalized_tfidf + self.semantic_weight * normalized_semantic
            )

            combined_scores.append((doc_id, combined_score))

        # Sort by combined score
        combined_scores.sort(key=lambda x: x[1], reverse=True)

        logger.debug(
            "Hybrid search completed",
            query=query,
            tfidf_results=len(tfidf_results),
            semantic_results=len(semantic_results),
            combined_results=len(combined_scores),
        )

        return combined_scores[:limit]
