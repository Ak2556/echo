"""
Production-grade exception handling with structured error responses,
logging, and monitoring integration.
"""

import traceback
from typing import Any, Dict, Optional, Union

import structlog
from fastapi import Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = structlog.get_logger(__name__)


class APIException(Exception):
    """Base API exception with structured error handling."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        self.headers = headers or {}
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for JSON response."""
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details,
            },
            "success": False,
        }


class ValidationException(APIException):
    """Validation error exception."""

    def __init__(
        self,
        message: str = "Validation failed",
        field_errors: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            error_code="VALIDATION_ERROR",
            details={"field_errors": field_errors or {}},
        )


class AuthenticationException(APIException):
    """Authentication error exception."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTHENTICATION_ERROR",
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationException(APIException):
    """Authorization error exception."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="AUTHORIZATION_ERROR",
        )


class NotFoundException(APIException):
    """Resource not found exception."""

    def __init__(self, message: str = "Resource not found", resource_type: str = "resource"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details={"resource_type": resource_type},
        )


class ConflictException(APIException):
    """Resource conflict exception."""

    def __init__(self, message: str = "Resource conflict", conflict_type: str = "duplicate"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT",
            details={"conflict_type": conflict_type},
        )


class RateLimitException(APIException):
    """Rate limit exceeded exception."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        limit_info: Optional[Dict[str, Any]] = None,
    ):
        headers = {}
        if retry_after:
            headers["Retry-After"] = str(retry_after)

        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            details=limit_info or {},
            headers=headers,
        )


class ExternalServiceException(APIException):
    """External service error exception."""

    def __init__(
        self,
        message: str = "External service error",
        service_name: str = "unknown",
        service_error: Optional[str] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_code="EXTERNAL_SERVICE_ERROR",
            details={
                "service_name": service_name,
                "service_error": service_error,
            },
        )


class DatabaseException(APIException):
    """Database error exception."""

    def __init__(self, message: str = "Database error", operation: str = "unknown"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
            details={"operation": operation},
        )


class CacheException(APIException):
    """Cache error exception."""

    def __init__(self, message: str = "Cache error", operation: str = "unknown"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="CACHE_ERROR",
            details={"operation": operation},
        )


# Exception handlers


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Handle API exceptions with structured logging."""
    logger.error(
        "API exception occurred",
        error_code=exc.error_code,
        message=exc.message,
        status_code=exc.status_code,
        path=request.url.path,
        method=request.method,
        details=exc.details,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
        headers=exc.headers,
    )


async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation exceptions."""
    field_errors = {}
    for error in exc.errors():
        field_path = ".".join(str(loc) for loc in error["loc"])
        field_errors[field_path] = {
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input"),
        }

    logger.warning(
        "Validation error occurred",
        path=request.url.path,
        method=request.method,
        field_errors=field_errors,
    )

    validation_exc = ValidationException(
        message="Request validation failed",
        field_errors=field_errors,
    )

    return JSONResponse(
        status_code=validation_exc.status_code,
        content=validation_exc.to_dict(),
    )


async def authentication_exception_handler(
    request: Request, exc: AuthenticationException
) -> JSONResponse:
    """Handle authentication exceptions."""
    logger.warning(
        "Authentication failed",
        path=request.url.path,
        method=request.method,
        message=exc.message,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
        headers=exc.headers,
    )


async def authorization_exception_handler(
    request: Request, exc: AuthorizationException
) -> JSONResponse:
    """Handle authorization exceptions."""
    logger.warning(
        "Authorization failed",
        path=request.url.path,
        method=request.method,
        message=exc.message,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
    )


async def rate_limit_exception_handler(request: Request, exc: RateLimitException) -> JSONResponse:
    """Handle rate limit exceptions."""
    logger.warning(
        "Rate limit exceeded",
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else "unknown",
        details=exc.details,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
        headers=exc.headers,
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions with error tracking."""
    error_id = f"error_{hash(str(exc))}_{request.url.path}"

    logger.error(
        "Unexpected error occurred",
        error_id=error_id,
        error_type=type(exc).__name__,
        error_message=str(exc),
        path=request.url.path,
        method=request.method,
        traceback=traceback.format_exc(),
    )

    # Don't expose internal errors in production
    error_response = {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "details": {
                "error_id": error_id,
            },
        },
        "success": False,
    }

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response,
    )


# Error response helpers


def create_error_response(
    message: str,
    error_code: str = "ERROR",
    status_code: int = status.HTTP_400_BAD_REQUEST,
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create standardized error response."""
    return {
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {},
        },
        "success": False,
    }


def create_success_response(
    data: Any = None,
    message: str = "Success",
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create standardized success response."""
    response = {
        "success": True,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    if meta:
        response["meta"] = meta

    return response
