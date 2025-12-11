"""
Production-grade middleware for security, performance, and monitoring.
"""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add comprehensive security headers to all responses.

    SECURITY: Implements defense-in-depth with multiple security headers:
    - CSP: Content Security Policy to prevent XSS
    - HSTS: HTTP Strict Transport Security for HTTPS enforcement
    - X-Frame-Options: Prevent clickjacking
    - X-Content-Type-Options: Prevent MIME sniffing
    - Permissions-Policy: Restrict browser features
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # SECURITY: Content Security Policy (CSP)
        # Prevents XSS attacks by controlling resource loading
        csp_directives = [
            "default-src 'self'",  # Only load resources from same origin by default
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",  # Scripts (unsafe-inline needed for React dev)
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",  # Styles (unsafe-inline needed for styled-components)
            "img-src 'self' data: https: blob:",  # Images from same origin, data URIs, HTTPS
            "font-src 'self' https://fonts.gstatic.com data:",  # Fonts
            "connect-src 'self' https://api.openrouter.ai https://openrouter.ai",  # API connections
            "media-src 'self' blob:",  # Audio/video
            "object-src 'none'",  # No plugins (Flash, etc.)
            "frame-ancestors 'none'",  # Prevent framing (like X-Frame-Options)
            "base-uri 'self'",  # Restrict <base> tag
            "form-action 'self'",  # Only submit forms to same origin
            "upgrade-insecure-requests",  # Upgrade HTTP to HTTPS
        ]

        # Production CSP is stricter
        if not settings.debug:
            csp_directives = [
                "default-src 'self'",
                "script-src 'self'",  # No unsafe-inline in production
                "style-src 'self'",  # No unsafe-inline in production
                "img-src 'self' data: https:",
                "font-src 'self' https://fonts.gstatic.com",
                "connect-src 'self' https://api.openrouter.ai",
                "media-src 'self' blob:",
                "object-src 'none'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "upgrade-insecure-requests",
            ]

        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # SECURITY: Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # SECURITY: Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # SECURITY: XSS Protection (legacy, but still good to have)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # SECURITY: Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # SECURITY: Permissions Policy (formerly Feature Policy)
        # Restrict access to browser features
        permissions = [
            "geolocation=()",  # No geolocation
            "microphone=()",  # No microphone
            "camera=()",  # No camera
            "payment=()",  # No payment API
            "usb=()",  # No USB
            "magnetometer=()",  # No magnetometer
            "gyroscope=()",  # No gyroscope
            "accelerometer=()",  # No accelerometer
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions)

        # SECURITY: HTTP Strict Transport Security (HSTS)
        # Force HTTPS for 1 year, including subdomains
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # SECURITY: Additional headers
        response.headers["X-Download-Options"] = "noopen"  # IE download protection
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"  # Adobe products

        # SECURITY: Cross-Origin policies
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests with structured logging."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Start timing
        start_time = time.time()

        # Get client info
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Log request start
        logger.info(
            "Request started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            client_ip=client_ip,
            user_agent=user_agent,
        )

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            logger.info(
                "Request completed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration=f"{duration:.3f}s",
                response_size=response.headers.get("content-length", "unknown"),
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            duration = time.time() - start_time

            logger.error(
                "Request failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                duration=f"{duration:.3f}s",
                error=str(e),
            )
            raise


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Monitor and optimize request performance."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate metrics
        duration = time.time() - start_time

        # Add performance headers
        response.headers["X-Response-Time"] = f"{duration:.3f}s"

        # Log slow requests
        if duration > 1.0:  # Log requests taking more than 1 second
            logger.warning(
                "Slow request detected",
                path=request.url.path,
                method=request.method,
                duration=f"{duration:.3f}s",
                status_code=response.status_code,
            )

        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Limit request body size to prevent DoS attacks."""

    def __init__(self, app, max_size: int = None):
        super().__init__(app)
        self.max_size = max_size or settings.api_max_request_size

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        content_length = request.headers.get("content-length")

        if content_length and int(content_length) > self.max_size:
            return JSONResponse(
                status_code=413,
                content={
                    "error": {
                        "code": "REQUEST_TOO_LARGE",
                        "message": f"Request body too large. Maximum size: {self.max_size} bytes",
                        "details": {
                            "max_size": self.max_size,
                            "received_size": int(content_length),
                        },
                    },
                    "success": False,
                },
            )

        return await call_next(request)


class HealthCheckMiddleware(BaseHTTPMiddleware):
    """Add health check information to responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Add health indicators
        response.headers["X-Service-Name"] = settings.app_name
        response.headers["X-Service-Version"] = settings.app_version
        response.headers["X-Environment"] = settings.environment

        return response


class CORSMiddleware(BaseHTTPMiddleware):
    """Custom CORS middleware with advanced options."""

    def __init__(
        self,
        app,
        allow_origins: list = None,
        allow_methods: list = None,
        allow_headers: list = None,
        allow_credentials: bool = False,
        expose_headers: list = None,
        max_age: int = 600,
    ):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        self.allow_headers = allow_headers or ["*"]
        self.allow_credentials = allow_credentials
        self.expose_headers = expose_headers or []
        self.max_age = max_age

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        origin = request.headers.get("origin")

        # Handle preflight requests
        if request.method == "OPTIONS":
            response = Response()
            response.status_code = 200
        else:
            response = await call_next(request)

        # Add CORS headers
        if origin and ("*" in self.allow_origins or origin in self.allow_origins):
            response.headers["Access-Control-Allow-Origin"] = origin
        elif "*" in self.allow_origins:
            response.headers["Access-Control-Allow-Origin"] = "*"

        if self.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"

        response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers)

        if self.expose_headers:
            response.headers["Access-Control-Expose-Headers"] = ", ".join(self.expose_headers)

        response.headers["Access-Control-Max-Age"] = str(self.max_age)

        return response
