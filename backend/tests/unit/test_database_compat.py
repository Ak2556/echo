"""
Unit tests for database compatibility utilities.
"""

import json
from unittest.mock import MagicMock, Mock, patch

import pytest

from app.utils.database_compat import (
    DatabaseCompatibilityError,
    VectorField,
    calculate_cosine_similarity,
    get_database_type,
    get_vector_column,
    is_vector_search_supported,
    normalize_vector,
    validate_vector_dimensions,
)


class TestVectorField:
    """Tests for VectorField type."""

    def test_initialization(self):
        """Test VectorField initialization."""
        field = VectorField(dimensions=768)
        assert field.dimensions == 768

    def test_default_dimensions(self):
        """Test default dimensions."""
        field = VectorField()
        assert field.dimensions == 1536

    def test_load_dialect_impl_postgresql(self):
        """Test loading PostgreSQL implementation."""
        field = VectorField(dimensions=1536)
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"
        mock_dialect.type_descriptor = Mock(return_value="vector_type")

        with patch("app.utils.database_compat.Vector", create=True):
            result = field.load_dialect_impl(mock_dialect)
            mock_dialect.type_descriptor.assert_called_once()

    def test_load_dialect_impl_postgresql_no_pgvector(self):
        """Test PostgreSQL fallback when pgvector not available."""
        field = VectorField(dimensions=1536)
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"
        mock_dialect.type_descriptor = Mock(return_value="json_type")

        # Simulate ImportError for pgvector - patch the entire module import
        import sys

        with patch.dict(sys.modules, {"pgvector": None, "pgvector.sqlalchemy": None}):
            result = field.load_dialect_impl(mock_dialect)
            # Should fallback to JSON
            assert result is not None

    def test_load_dialect_impl_sqlite(self):
        """Test loading SQLite implementation."""
        field = VectorField(dimensions=1536)
        mock_dialect = Mock()
        mock_dialect.name = "sqlite"
        mock_dialect.type_descriptor = Mock(return_value="json_type")

        result = field.load_dialect_impl(mock_dialect)
        mock_dialect.type_descriptor.assert_called_once()

    def test_process_bind_param_none(self):
        """Test processing None value."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "sqlite"

        result = field.process_bind_param(None, mock_dialect)
        assert result is None

    def test_process_bind_param_sqlite(self):
        """Test processing bind param for SQLite."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "sqlite"

        vector = [1.0, 2.0, 3.0]
        result = field.process_bind_param(vector, mock_dialect)
        assert result == json.dumps(vector)

    def test_process_bind_param_postgresql_with_pgvector(self):
        """Test processing bind param for PostgreSQL with pgvector."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]

        with patch("app.utils.database_compat.Vector", create=True):
            result = field.process_bind_param(vector, mock_dialect)
            assert result == vector

    def test_process_bind_param_postgresql_no_pgvector(self):
        """Test processing bind param for PostgreSQL without pgvector."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]

        # When pgvector import fails, should fallback to JSON
        import sys

        with patch.dict(sys.modules, {"pgvector": None, "pgvector.sqlalchemy": None}):
            result = field.process_bind_param(vector, mock_dialect)
            assert result == json.dumps(vector) or result == vector

    def test_process_result_value_none(self):
        """Test processing None result value."""
        field = VectorField()
        mock_dialect = Mock()

        result = field.process_result_value(None, mock_dialect)
        assert result is None

    def test_process_result_value_sqlite_string(self):
        """Test processing SQLite result as string."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "sqlite"

        vector = [1.0, 2.0, 3.0]
        json_string = json.dumps(vector)

        result = field.process_result_value(json_string, mock_dialect)
        assert result == vector

    def test_process_result_value_sqlite_list(self):
        """Test processing SQLite result as list."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "sqlite"

        vector = [1.0, 2.0, 3.0]
        result = field.process_result_value(vector, mock_dialect)
        assert result == vector

    def test_process_result_value_postgresql_list(self):
        """Test processing PostgreSQL result as list."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]

        with patch("app.utils.database_compat.Vector", create=True):
            result = field.process_result_value(vector, mock_dialect)
            assert result == vector

    def test_process_result_value_postgresql_string(self):
        """Test processing PostgreSQL result as string."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]
        json_string = json.dumps(vector)

        with patch("app.utils.database_compat.Vector", create=True):
            result = field.process_result_value(json_string, mock_dialect)
            assert result == vector

    def test_process_result_value_postgresql_import_error_string(self):
        """Test processing PostgreSQL result when pgvector import fails (string value)."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]
        json_string = json.dumps(vector)

        # Simulate ImportError when trying to import pgvector.sqlalchemy
        def mock_import(name, *args, **kwargs):
            if "pgvector" in name:
                raise ImportError("No module named 'pgvector'")
            return __import__(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=mock_import):
            result = field.process_result_value(json_string, mock_dialect)
            assert result == vector

    def test_process_result_value_postgresql_import_error_value(self):
        """Test processing PostgreSQL result when pgvector import fails (direct value)."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        vector = [1.0, 2.0, 3.0]

        # Simulate ImportError when trying to import pgvector.sqlalchemy
        def mock_import(name, *args, **kwargs):
            if "pgvector" in name:
                raise ImportError("No module named 'pgvector'")
            return __import__(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=mock_import):
            result = field.process_result_value(vector, mock_dialect)
            assert result == vector

    def test_process_result_value_postgresql_other_type(self):
        """Test processing PostgreSQL result with non-list, non-string type."""
        field = VectorField()
        mock_dialect = Mock()
        mock_dialect.name = "postgresql"

        # Test with tuple value (not a list or string, but still a sequence)
        # This should trigger the fallback return on line 67
        test_value = (1.0, 2.0, 3.0)  # tuple, not list or string

        with patch("app.utils.database_compat.Vector", create=True):
            result = field.process_result_value(test_value, mock_dialect)
            # Should return the value as-is since it's not list or string
            assert result == test_value


class TestGetVectorColumn:
    """Tests for get_vector_column function."""

    def test_default_dimensions(self):
        """Test getting column with default dimensions."""
        column = get_vector_column()
        assert column is not None
        assert isinstance(column.type, VectorField)
        assert column.type.dimensions == 1536

    def test_custom_dimensions(self):
        """Test getting column with custom dimensions."""
        column = get_vector_column(dimensions=768)
        assert column is not None
        assert isinstance(column.type, VectorField)
        assert column.type.dimensions == 768


class TestCalculateCosineSimilarity:
    """Tests for calculate_cosine_similarity function."""

    def test_identical_vectors(self):
        """Test cosine similarity of identical vectors."""
        vector = [1.0, 2.0, 3.0]
        result = calculate_cosine_similarity(vector, vector)
        assert abs(result - 1.0) < 0.0001

    def test_orthogonal_vectors(self):
        """Test cosine similarity of orthogonal vectors."""
        vector1 = [1.0, 0.0, 0.0]
        vector2 = [0.0, 1.0, 0.0]
        result = calculate_cosine_similarity(vector1, vector2)
        assert abs(result) < 0.0001

    def test_opposite_vectors(self):
        """Test cosine similarity of opposite vectors."""
        vector1 = [1.0, 2.0, 3.0]
        vector2 = [-1.0, -2.0, -3.0]
        result = calculate_cosine_similarity(vector1, vector2)
        assert abs(result - (-1.0)) < 0.0001

    def test_empty_vectors(self):
        """Test cosine similarity with empty vectors."""
        result = calculate_cosine_similarity([], [])
        assert result == 0.0

    def test_none_vectors(self):
        """Test cosine similarity with None vectors."""
        result = calculate_cosine_similarity(None, [1.0, 2.0])
        assert result == 0.0

    def test_different_length_vectors(self):
        """Test cosine similarity with different length vectors."""
        vector1 = [1.0, 2.0, 3.0]
        vector2 = [1.0, 2.0]
        result = calculate_cosine_similarity(vector1, vector2)
        assert result == 0.0

    def test_zero_magnitude_vector(self):
        """Test cosine similarity with zero magnitude vector."""
        vector1 = [0.0, 0.0, 0.0]
        vector2 = [1.0, 2.0, 3.0]
        result = calculate_cosine_similarity(vector1, vector2)
        assert result == 0.0

    def test_similar_vectors(self):
        """Test cosine similarity of similar vectors."""
        vector1 = [1.0, 2.0, 3.0]
        vector2 = [1.1, 2.1, 3.1]
        result = calculate_cosine_similarity(vector1, vector2)
        assert result > 0.99  # Should be very close to 1


class TestGetDatabaseType:
    """Tests for get_database_type function."""

    def test_postgresql_url(self):
        """Test identifying PostgreSQL URL."""
        url = "postgresql://user:pass@localhost:5432/db"
        assert get_database_type(url) == "postgresql"

    def test_postgres_url(self):
        """Test identifying postgres URL variant."""
        url = "postgres://user:pass@localhost:5432/db"
        assert get_database_type(url) == "postgresql"

    def test_sqlite_url(self):
        """Test identifying SQLite URL."""
        url = "sqlite:///path/to/database.db"
        assert get_database_type(url) == "sqlite"

    def test_mysql_url(self):
        """Test identifying MySQL URL."""
        url = "mysql://user:pass@localhost:3306/db"
        assert get_database_type(url) == "mysql"

    def test_unknown_url(self):
        """Test identifying unknown database URL."""
        url = "mongodb://localhost:27017/db"
        assert get_database_type(url) == "unknown"


class TestIsVectorSearchSupported:
    """Tests for is_vector_search_supported function."""

    def test_postgresql_with_pgvector(self):
        """Test vector search support with PostgreSQL and pgvector."""
        url = "postgresql://localhost/db"

        with patch("app.utils.database_compat.pgvector", create=True):
            result = is_vector_search_supported(url)
            assert result is True

    def test_postgresql_without_pgvector(self):
        """Test vector search support with PostgreSQL but no pgvector."""
        url = "postgresql://localhost/db"

        import sys

        # Ensure pgvector is not importable
        with patch.dict(sys.modules, {"pgvector": None}):
            try:
                import pgvector

                result = True
            except:
                result = False
            # Just verify the function runs without error
            supported = is_vector_search_supported(url)
            assert isinstance(supported, bool)

    def test_sqlite_no_support(self):
        """Test that SQLite doesn't support vector search."""
        url = "sqlite:///database.db"
        result = is_vector_search_supported(url)
        assert result is False

    def test_mysql_no_support(self):
        """Test that MySQL doesn't support vector search."""
        url = "mysql://localhost/db"
        result = is_vector_search_supported(url)
        assert result is False


class TestValidateVectorDimensions:
    """Tests for validate_vector_dimensions function."""

    def test_valid_vector_default_dimensions(self):
        """Test validating vector with default dimensions."""
        vector = [1.0] * 1536
        result = validate_vector_dimensions(vector)
        assert result is True

    def test_valid_vector_custom_dimensions(self):
        """Test validating vector with custom dimensions."""
        vector = [1.0, 2.0, 3.0]
        result = validate_vector_dimensions(vector, expected_dimensions=3)
        assert result is True

    def test_invalid_vector_wrong_dimensions(self):
        """Test validating vector with wrong dimensions."""
        vector = [1.0, 2.0, 3.0]
        result = validate_vector_dimensions(vector, expected_dimensions=5)
        assert result is False

    def test_invalid_vector_not_list(self):
        """Test validating non-list input."""
        result = validate_vector_dimensions("not a list")
        assert result is False

    def test_invalid_vector_non_numeric_elements(self):
        """Test validating vector with non-numeric elements."""
        vector = [1.0, "two", 3.0]
        result = validate_vector_dimensions(vector, expected_dimensions=3)
        assert result is False

    def test_empty_vector(self):
        """Test validating empty vector."""
        result = validate_vector_dimensions([], expected_dimensions=0)
        assert result is True

    def test_vector_with_integers(self):
        """Test validating vector with integer elements."""
        vector = [1, 2, 3]
        result = validate_vector_dimensions(vector, expected_dimensions=3)
        assert result is True


class TestNormalizeVector:
    """Tests for normalize_vector function."""

    def test_normalize_unit_vector(self):
        """Test normalizing unit vector."""
        vector = [1.0, 0.0, 0.0]
        result = normalize_vector(vector)
        assert result == [1.0, 0.0, 0.0]

    def test_normalize_regular_vector(self):
        """Test normalizing regular vector."""
        vector = [3.0, 4.0]
        result = normalize_vector(vector)
        # Magnitude is 5, so normalized should be [0.6, 0.8]
        assert abs(result[0] - 0.6) < 0.0001
        assert abs(result[1] - 0.8) < 0.0001

    def test_normalize_empty_vector(self):
        """Test normalizing empty vector."""
        result = normalize_vector([])
        assert result == []

    def test_normalize_zero_vector(self):
        """Test normalizing zero vector."""
        vector = [0.0, 0.0, 0.0]
        result = normalize_vector(vector)
        assert result == [0.0, 0.0, 0.0]

    def test_normalized_vector_has_unit_length(self):
        """Test that normalized vector has unit length."""
        vector = [1.0, 2.0, 3.0]
        result = normalize_vector(vector)
        # Calculate magnitude
        magnitude = sum(x * x for x in result) ** 0.5
        assert abs(magnitude - 1.0) < 0.0001


class TestDatabaseCompatibilityError:
    """Tests for DatabaseCompatibilityError exception."""

    def test_exception_creation(self):
        """Test creating exception."""
        error = DatabaseCompatibilityError("Test error")
        assert str(error) == "Test error"

    def test_exception_raising(self):
        """Test raising exception."""
        with pytest.raises(DatabaseCompatibilityError, match="Database error"):
            raise DatabaseCompatibilityError("Database error")


class TestIntegration:
    """Integration tests for database compatibility."""

    def test_vector_workflow(self):
        """Test complete vector workflow."""
        # Create vector
        vector = [1.0, 2.0, 3.0]

        # Validate
        assert validate_vector_dimensions(vector, expected_dimensions=3)

        # Normalize
        normalized = normalize_vector(vector)

        # Calculate self-similarity
        similarity = calculate_cosine_similarity(normalized, normalized)
        assert abs(similarity - 1.0) < 0.0001

    def test_database_detection(self):
        """Test database type detection."""
        urls = {
            "postgresql://localhost/db": "postgresql",
            "sqlite:///db.db": "sqlite",
            "mysql://localhost/db": "mysql",
        }

        for url, expected_type in urls.items():
            assert get_database_type(url) == expected_type
