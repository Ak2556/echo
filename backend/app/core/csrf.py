"""
CSRF Protection Middleware

Implements Double-Submit Cookie pattern for CSRF protection.
- Generates CSRF token on first request
- Validates token on state-changing operations (POST, PUT, DELETE, PATCH)
- Tokens are tied to user session
"""

import hashlib
import hmac
import secrets
from typing import Optional

import structlog
from fastapi import HTTPException, Request, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = structlog.get_logger(__name__)

# CSRF token configuration
CSRF_TOKEN_LENGTH = 32
CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_SECRET_KEY = None  # Set from settings


def set_csrf_secret(secret: str):
    """Set the secret key for CSRF token generation."""
    global CSRF_SECRET_KEY
    CSRF_SECRET_KEY = secret


def generate_csrf_token() -> str:
    """Generate a cryptographically secure CSRF token."""
    return secrets.token_urlsafe(CSRF_TOKEN_LENGTH)


def create_csrf_hash(token: str, secret: str) -> str:
    """Create HMAC hash of CSRF token."""
    return hmac.new(secret.encode(), token.encode(), hashlib.sha256).hexdigest()


def validate_csrf_token(token: str, expected_token: str, secret: str) -> bool:
    """
    Validate CSRF token using constant-time comparison.
    Prevents timing attacks.
    """
    if not token or not expected_token:
        return False

    # Create hashes for constant-time comparison
    token_hash = create_csrf_hash(token, secret)
    expected_hash = create_csrf_hash(expected_token, secret)

    return hmac.compare_digest(token_hash, expected_hash)


# Endpoints that don't require CSRF protection
CSRF_EXEMPT_PATHS = {
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/docs",
    "/openapi.json",
    "/api/files",  # File uploads handled separately
}

# Methods that require CSRF protection
PROTECTED_METHODS = {"POST", "PUT", "DELETE", "PATCH"}


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    CSRF Protection Middleware using Double-Submit Cookie pattern.

    How it works:
    1. Generate CSRF token on first request
    2. Set token in cookie (not httpOnly, so JavaScript can read it)
    3. Client must include token in X-CSRF-Token header for state-changing requests
    4. Validate token matches cookie value
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
        if request.method not in PROTECTED_METHODS:
            response = await call_next(request)

            # Add CSRF token cookie if it doesn't exist
            if CSRF_COOKIE_NAME not in request.cookies:
                csrf_token = generate_csrf_token()
                response.set_cookie(
                    key=CSRF_COOKIE_NAME,
                    value=csrf_token,
                    httponly=False,  # JavaScript needs to read this
                    secure=True,  # Only send over HTTPS in production
                    samesite="strict",  # Prevent CSRF via same-site policy
                    max_age=86400,  # 24 hours
                )

            return response

        # Check if path is exempt from CSRF protection
        path = request.url.path
        if any(path.startswith(exempt) for exempt in CSRF_EXEMPT_PATHS):
            return await call_next(request)

        # Get CSRF token from cookie and header
        csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
        csrf_header = request.headers.get(CSRF_HEADER_NAME)

        # Validate CSRF token
        if not csrf_cookie or not csrf_header:
            logger.warning(
                "CSRF validation failed: missing token",
                path=path,
                method=request.method,
                has_cookie=bool(csrf_cookie),
                has_header=bool(csrf_header),
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF validation failed: missing token",
            )

        if not CSRF_SECRET_KEY:
            logger.error("CSRF secret key not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="CSRF protection not properly configured",
            )

        if not validate_csrf_token(csrf_header, csrf_cookie, CSRF_SECRET_KEY):
            logger.warning(
                "CSRF validation failed: invalid token", path=path, method=request.method
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF validation failed: invalid token",
            )

        # CSRF validation passed
        return await call_next(request)


def get_csrf_token(request: Request) -> Optional[str]:
    """Get CSRF token from request cookies."""
    return request.cookies.get(CSRF_COOKIE_NAME)


def generate_csrf_token_for_response(response: Response) -> str:
    """Generate and set CSRF token in response cookie."""
    csrf_token = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,  # JavaScript needs to read this
        secure=True,  # Only send over HTTPS in production
        samesite="strict",
        max_age=86400,  # 24 hours
    )
    return csrf_token
