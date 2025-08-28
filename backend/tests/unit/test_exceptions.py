"""
Unit tests for exception handling.
"""

import pytest
from fastapi import status
from app.core.exceptions import (
    APIException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    RateLimitException,
    ExternalServiceException,
    DatabaseException,
    CacheException,
    create_error_response,
    create_success_response,
)


class TestAPIException:
    """Tests for APIException base class."""

    def test_api_exception_default(self):
        """Test APIException with default values."""
        exc = APIException("Test error")
        assert exc.message == "Test error"
        assert exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc.error_code == "INTERNAL_ERROR"
        assert exc.details == {}
        assert exc.headers == {}

    def test_api_exception_custom(self):
        """Test APIException with custom values."""
        details = {"field": "value"}
        headers = {"X-Custom": "header"}
        exc = APIException(
            message="Custom error",
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="CUSTOM_ERROR",
            details=details,
            headers=headers
        )
        assert exc.message == "Custom error"
        assert exc.status_code == status.HTTP_400_BAD_REQUEST
        assert exc.error_code == "CUSTOM_ERROR"
        assert exc.details == details
        assert exc.headers == headers

    def test_api_exception_to_dict(self):
        """Test APIException to_dict method."""
        exc = APIException("Test error", error_code="TEST_ERROR")
        result = exc.to_dict()
        
        assert result["success"] is False
        assert result["error"]["code"] == "TEST_ERROR"
        assert result["error"]["message"] == "Test error"
        assert result["error"]["details"] == {}


class TestValidationException:
    """Tests for ValidationException."""

    def test_validation_exception_default(self):
        """Test ValidationException with default values."""
        exc = ValidationException()
        assert exc.message == "Validation failed"
        assert exc.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert exc.error_code == "VALIDATION_ERROR"
        assert exc.details["field_errors"] == {}

    def test_validation_exception_with_field_errors(self):
        """Test ValidationException with field errors."""
        field_errors = {"email": "Invalid email format"}
        exc = ValidationException("Custom validation error", field_errors)
        assert exc.message == "Custom validation error"
        assert exc.details["field_errors"] == field_errors


class TestAuthenticationException:
    """Tests for AuthenticationException."""

    def test_authentication_exception_default(self):
        """Test AuthenticationException with default values."""
        exc = AuthenticationException()
        assert exc.message == "Authentication failed"
        assert exc.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.error_code == "AUTHENTICATION_ERROR"
        assert exc.headers["WWW-Authenticate"] == "Bearer"

    def test_authentication_exception_custom(self):
        """Test AuthenticationException with custom message."""
        exc = AuthenticationException("Token expired")
        assert exc.message == "Token expired"


class TestAuthorizationException:
    """Tests for AuthorizationException."""

    def test_authorization_exception_default(self):
        """Test AuthorizationException with default values."""
        exc = AuthorizationException()
        assert exc.message == "Insufficient permissions"
        assert exc.status_code == status.HTTP_403_FORBIDDEN
        assert exc.error_code == "AUTHORIZATION_ERROR"

    def test_authorization_exception_custom(self):
        """Test AuthorizationException with custom message."""
        exc = AuthorizationException("Admin access required")
        assert exc.message == "Admin access required"


class TestNotFoundException:
    """Tests for NotFoundException."""

    def test_not_found_exception_default(self):
        """Test NotFoundException with default values."""
        exc = NotFoundException()
        assert exc.message == "Resource not found"
        assert exc.status_code == status.HTTP_404_NOT_FOUND
        assert exc.error_code == "NOT_FOUND"
        assert exc.details["resource_type"] == "resource"

    def test_not_found_exception_custom(self):
        """Test NotFoundException with custom values."""
        exc = NotFoundException("User not found", "user")
        assert exc.message == "User not found"
        assert exc.details["resource_type"] == "user"


class TestConflictException:
    """Tests for ConflictException."""

    def test_conflict_exception_default(self):
        """Test ConflictException with default values."""
        exc = ConflictException()
        assert exc.message == "Resource conflict"
        assert exc.status_code == status.HTTP_409_CONFLICT
        assert exc.error_code == "CONFLICT"
        assert exc.details["conflict_type"] == "duplicate"

    def test_conflict_exception_custom(self):
        """Test ConflictException with custom values."""
        exc = ConflictException("Email already exists", "email_duplicate")
        assert exc.message == "Email already exists"
        assert exc.details["conflict_type"] == "email_duplicate"


class TestRateLimitException:
    """Tests for RateLimitException."""

    def test_rate_limit_exception_default(self):
        """Test RateLimitException with default values."""
        exc = RateLimitException()
        assert exc.message == "Rate limit exceeded"
        assert exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert exc.error_code == "RATE_LIMIT_EXCEEDED"
        assert exc.details == {}
        assert exc.headers == {}

    def test_rate_limit_exception_with_retry_after(self):
        """Test RateLimitException with retry after."""
        limit_info = {"requests": 100, "window": 60}
        exc = RateLimitException("Too many requests", 60, limit_info)
        assert exc.message == "Too many requests"
        assert exc.headers["Retry-After"] == "60"
        assert exc.details == limit_info


class TestExternalServiceException:
    """Tests for ExternalServiceException."""

    def test_external_service_exception_default(self):
        """Test ExternalServiceException with default values."""
        exc = ExternalServiceException()
        assert exc.message == "External service error"
        assert exc.status_code == status.HTTP_502_BAD_GATEWAY
        assert exc.error_code == "EXTERNAL_SERVICE_ERROR"
        assert exc.details["service_name"] == "unknown"
        assert exc.details["service_error"] is None

    def test_external_service_exception_custom(self):
        """Test ExternalServiceException with custom values."""
        exc = ExternalServiceException("API timeout", "payment_gateway", "Connection timeout")
        assert exc.message == "API timeout"
        assert exc.details["service_name"] == "payment_gateway"
        assert exc.details["service_error"] == "Connection timeout"


class TestDatabaseException:
    """Tests for DatabaseException."""

    def test_database_exception_default(self):
        """Test DatabaseException with default values."""
        exc = DatabaseException()
        assert exc.message == "Database error"
        assert exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc.error_code == "DATABASE_ERROR"
        assert exc.details["operation"] == "unknown"

    def test_database_exception_custom(self):
        """Test DatabaseException with custom values."""
        exc = DatabaseException("Connection failed", "select")
        assert exc.message == "Connection failed"
        assert exc.details["operation"] == "select"


class TestCacheException:
    """Tests for CacheException."""

    def test_cache_exception_default(self):
        """Test CacheException with default values."""
        exc = CacheException()
        assert exc.message == "Cache error"
        assert exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc.error_code == "CACHE_ERROR"
        assert exc.details["operation"] == "unknown"

    def test_cache_exception_custom(self):
        """Test CacheException with custom values."""
        exc = CacheException("Redis connection failed", "get")
        assert exc.message == "Redis connection failed"
        assert exc.details["operation"] == "get"


class TestResponseHelpers:
    """Tests for response helper functions."""

    def test_create_error_response_default(self):
        """Test create_error_response with default values."""
        response = create_error_response("Test error")
        
        assert response["success"] is False
        assert response["error"]["code"] == "ERROR"
        assert response["error"]["message"] == "Test error"
        assert response["error"]["details"] == {}

    def test_create_error_response_custom(self):
        """Test create_error_response with custom values."""
        details = {"field": "value"}
        response = create_error_response(
            "Custom error",
            "CUSTOM_ERROR",
            status.HTTP_400_BAD_REQUEST,
            details
        )
        
        assert response["success"] is False
        assert response["error"]["code"] == "CUSTOM_ERROR"
        assert response["error"]["message"] == "Custom error"
        assert response["error"]["details"] == details

    def test_create_success_response_default(self):
        """Test create_success_response with default values."""
        response = create_success_response()
        
        assert response["success"] is True
        assert response["message"] == "Success"
        assert "data" not in response
        assert "meta" not in response

    def test_create_success_response_with_data(self):
        """Test create_success_response with data."""
        data = {"id": 1, "name": "Test"}
        response = create_success_response(data, "Operation successful")
        
        assert response["success"] is True
        assert response["message"] == "Operation successful"
        assert response["data"] == data

    def test_create_success_response_with_meta(self):
        """Test create_success_response with metadata."""
        data = [1, 2, 3]
        meta = {"total": 3, "page": 1}
        response = create_success_response(data, "Data retrieved", meta)
        
        assert response["success"] is True
        assert response["message"] == "Data retrieved"
        assert response["data"] == data
        assert response["meta"] == meta

    def test_create_success_response_none_data(self):
        """Test create_success_response with None data."""
        response = create_success_response(None, "No data")

        assert response["success"] is True
        assert response["message"] == "No data"
        assert "data" not in response


class TestExceptionHandlers:
    """Tests for exception handler functions."""

    @pytest.fixture
    def mock_request(self):
        """Create a mock FastAPI Request."""
        from unittest.mock import Mock
        request = Mock()
        request.url.path = "/api/test"
        request.method = "GET"
        request.client.host = "127.0.0.1"
        return request

    @pytest.mark.asyncio
    async def test_api_exception_handler(self, mock_request):
        """Test api_exception_handler."""
        from app.core.exceptions import api_exception_handler

        exc = APIException(
            message="Test error",
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="TEST_ERROR",
            details={"field": "value"}
        )

        response = await api_exception_handler(mock_request, exc)

        assert response.status_code == 400
        # Response content is in body
        import json
        content = json.loads(response.body.decode())
        assert content["success"] is False
        assert content["error"]["code"] == "TEST_ERROR"
        assert content["error"]["message"] == "Test error"

    @pytest.mark.asyncio
    async def test_validation_exception_handler(self, mock_request):
        """Test validation_exception_handler with Pydantic ValidationError."""
        from app.core.exceptions import validation_exception_handler
        from pydantic import BaseModel, ValidationError

        class TestModel(BaseModel):
            email: str
            age: int

        # Trigger a validation error
        try:
            TestModel(email=123, age="not_a_number")
        except ValidationError as exc:
            response = await validation_exception_handler(mock_request, exc)

            assert response.status_code == 422
            import json
            content = json.loads(response.body.decode())
            assert content["success"] is False
            assert content["error"]["code"] == "VALIDATION_ERROR"

    @pytest.mark.asyncio
    async def test_authentication_exception_handler(self, mock_request):
        """Test authentication_exception_handler."""
        from app.core.exceptions import authentication_exception_handler

        exc = AuthenticationException(message="Invalid credentials")

        response = await authentication_exception_handler(mock_request, exc)

        assert response.status_code == 401
        import json
        content = json.loads(response.body.decode())
        assert content["error"]["message"] == "Invalid credentials"

    @pytest.mark.asyncio
    async def test_authorization_exception_handler(self, mock_request):
        """Test authorization_exception_handler."""
        from app.core.exceptions import authorization_exception_handler

        exc = AuthorizationException(message="Admin access required")

        response = await authorization_exception_handler(mock_request, exc)

        assert response.status_code == 403
        import json
        content = json.loads(response.body.decode())
        assert content["error"]["message"] == "Admin access required"

    @pytest.mark.asyncio
    async def test_rate_limit_exception_handler(self, mock_request):
        """Test rate_limit_exception_handler."""
        from app.core.exceptions import rate_limit_exception_handler

        exc = RateLimitException(
            message="Too many requests",
            retry_after=60,
            limit_info={"limit": 100}
        )

        response = await rate_limit_exception_handler(mock_request, exc)

        assert response.status_code == 429
        import json
        content = json.loads(response.body.decode())
        assert content["error"]["code"] == "RATE_LIMIT_EXCEEDED"

    @pytest.mark.asyncio
    async def test_general_exception_handler(self, mock_request):
        """Test general_exception_handler for unexpected errors."""
        from app.core.exceptions import general_exception_handler

        exc = Exception("Unexpected error occurred")

        response = await general_exception_handler(mock_request, exc)

        assert response.status_code == 500
        import json
        content = json.loads(response.body.decode())
        assert content["success"] is False
        assert content["error"]["code"] == "INTERNAL_ERROR"
        assert content["error"]["message"] == "An unexpected error occurred"
        assert "error_id" in content["error"]["details"]