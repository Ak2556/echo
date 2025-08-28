"""
Database compatibility utilities for handling different database types.
Provides compatibility layer for vector operations between PostgreSQL and SQLite.
"""
from typing import Optional, List, Any
from sqlalchemy import Column, JSON, Text
from sqlalchemy.types import TypeDecorator, String
import json


class VectorField(TypeDecorator):
    """
    A custom SQLAlchemy type that provides vector storage compatibility
    between PostgreSQL (with pgvector) and SQLite (with JSON storage).
    """
    impl = String
    cache_ok = True

    def __init__(self, dimensions: int = 1536):
        self.dimensions = dimensions
        super().__init__()

    def load_dialect_impl(self, dialect):
        """Load the appropriate implementation based on the database dialect."""
        if dialect.name == 'postgresql':
            try:
                from pgvector.sqlalchemy import Vector
                return dialect.type_descriptor(Vector(self.dimensions))
            except ImportError:
                # Fallback to JSON if pgvector is not available
                return dialect.type_descriptor(JSON())
        else:
            # For SQLite and other databases, use JSON
            return dialect.type_descriptor(JSON())

    def process_bind_param(self, value: Optional[List[float]], dialect) -> Optional[str]:
        """Convert Python list to database format."""
        if value is None:
            return None
        
        if dialect.name == 'postgresql':
            try:
                from pgvector.sqlalchemy import Vector
                # Let pgvector handle the conversion
                return value
            except ImportError:
                # Fallback to JSON string
                return json.dumps(value)
        else:
            # For SQLite, store as JSON string
            return json.dumps(value)

    def process_result_value(self, value: Any, dialect) -> Optional[List[float]]:
        """Convert database format to Python list."""
        if value is None:
            return None
            
        if dialect.name == 'postgresql':
            try:
                from pgvector.sqlalchemy import Vector
                # pgvector returns the value directly as a list
                if isinstance(value, list):
                    return value
                # If it's a string, parse it
                if isinstance(value, str):
                    return json.loads(value)
                return value
            except ImportError:
                # Fallback to JSON parsing
                if isinstance(value, str):
                    return json.loads(value)
                return value
        else:
            # For SQLite, parse JSON string
            if isinstance(value, str):
                return json.loads(value)
            return value


def get_vector_column(dimensions: int = 1536) -> Column:
    """
    Get a vector column that works with both PostgreSQL and SQLite.
    
    Args:
        dimensions: Number of dimensions for the vector (default: 1536 for OpenAI embeddings)
        
    Returns:
        SQLAlchemy Column configured for vector storage
    """
    return Column(VectorField(dimensions))


def calculate_cosine_similarity(vector1: List[float], vector2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Args:
        vector1: First vector
        vector2: Second vector
        
    Returns:
        Cosine similarity score between -1 and 1
    """
    if not vector1 or not vector2 or len(vector1) != len(vector2):
        return 0.0
    
    # Calculate dot product
    dot_product = sum(a * b for a, b in zip(vector1, vector2))
    
    # Calculate magnitudes
    magnitude1 = sum(a * a for a in vector1) ** 0.5
    magnitude2 = sum(b * b for b in vector2) ** 0.5
    
    # Avoid division by zero
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    return dot_product / (magnitude1 * magnitude2)


def get_database_type(database_url: str) -> str:
    """
    Determine database type from URL.
    
    Args:
        database_url: Database connection URL
        
    Returns:
        Database type ('postgresql', 'sqlite', etc.)
    """
    if 'postgresql' in database_url or 'postgres' in database_url:
        return 'postgresql'
    elif 'sqlite' in database_url:
        return 'sqlite'
    elif 'mysql' in database_url:
        return 'mysql'
    else:
        return 'unknown'


def is_vector_search_supported(database_url: str) -> bool:
    """
    Check if the database supports native vector search operations.
    
    Args:
        database_url: Database connection URL
        
    Returns:
        True if native vector search is supported
    """
    db_type = get_database_type(database_url)
    
    if db_type == 'postgresql':
        try:
            import pgvector
            return True
        except ImportError:
            return False
    
    # SQLite and other databases don't have native vector search
    return False


class DatabaseCompatibilityError(Exception):
    """Raised when database compatibility issues are encountered."""
    pass


def validate_vector_dimensions(vector: List[float], expected_dimensions: int = 1536) -> bool:
    """
    Validate that a vector has the expected number of dimensions.
    
    Args:
        vector: Vector to validate
        expected_dimensions: Expected number of dimensions
        
    Returns:
        True if vector is valid
    """
    if not isinstance(vector, list):
        return False
    
    if len(vector) != expected_dimensions:
        return False
    
    # Check that all elements are numbers
    try:
        for element in vector:
            float(element)
        return True
    except (ValueError, TypeError):
        return False


def normalize_vector(vector: List[float]) -> List[float]:
    """
    Normalize a vector to unit length.
    
    Args:
        vector: Vector to normalize
        
    Returns:
        Normalized vector
    """
    if not vector:
        return vector
    
    magnitude = sum(x * x for x in vector) ** 0.5
    
    if magnitude == 0:
        return vector
    
    return [x / magnitude for x in vector]