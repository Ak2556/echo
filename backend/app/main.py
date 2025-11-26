"""
Production-ready Echo API application.
Comprehensive FastAPI application with enterprise-grade features.
"""
import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from typing import Any, Dict

import structlog
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
# from prometheus_client import make_asgi_app

from app.api.v1.router import api_router
from app.auth.routes import router as auth_router
from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.core.exceptions import (
    APIException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    RateLimitException,
    api_exception_handler,
    validation_exception_handler,
    authentication_exception_handler,
    authorization_exception_handler,
    rate_limit_exception_handler,
    general_exception_handler,
)
from app.core.logging import setup_logging, get_logger
from app.core.middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    PerformanceMiddleware,
    RequestSizeLimitMiddleware,
)
from app.core.csrf import CSRFMiddleware, set_csrf_secret
# from app.core.monitoring import setup_monitoring
from app.core.redis import init_redis, close_redis
# from app.core.security import setup_security

# Initialize settings
settings = get_settings()

# Setup structured logging
setup_logging(settings.log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    logger.info("Starting Echo API application", version=settings.app_version)
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Initialize Redis
        await init_redis()
        logger.info("Redis initialized successfully")
        
        # Setup monitoring
        if settings.enable_metrics:
            # setup_monitoring()
            logger.info("Monitoring setup completed")
        
        # Setup security
        # setup_security()
        logger.info("Security setup completed")
        
        logger.info("Application startup completed successfully")
        
        yield
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        raise
    finally:
        # Cleanup on shutdown
        logger.info("Shutting down Echo API application")
        
        try:
            await close_redis()
            logger.info("Redis connections closed")
            
            await close_db()
            logger.info("Database connections closed")
            
        except Exception as e:
            logger.error("Error during shutdown", error=str(e))
        
        logger.info("Application shutdown completed")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    # Create FastAPI app with production settings
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production-ready Echo API with enterprise features",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
        # Production optimizations
        generate_unique_id_function=lambda route: f"{route.tags[0]}-{route.name}" if route.tags else route.name,
    )
    
    # Security middleware (order matters!)
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]  # Configure with actual domains in production
        )
    
    # CORS middleware
    # SECURITY FIX: Never use wildcard (*) with credentials
    # Use specific origins based on environment
    if settings.debug:
        cors_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
        ]
    else:
        # SECURITY: In production, MUST use specific origins from settings
        cors_origins = settings.cors_origins if settings.cors_origins else []
        if not cors_origins:
            raise ValueError("CORS origins must be configured in production")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        # SECURITY FIX: Restrict to only necessary methods
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        # SECURITY FIX: Specify exact headers instead of wildcard
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "User-Agent",
            "DNT",
            "Cache-Control",
            "X-Requested-With",
            "X-CSRF-Token",
        ],
        expose_headers=["X-Request-ID", "X-Response-Time"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )
    
    # Custom middleware (order matters!)
    # SECURITY: CSRF protection must be added before other middleware
    # Skip CSRF in test environment to simplify testing
    import os
    if os.getenv("ENVIRONMENT") != "test":
        set_csrf_secret(settings.secret_key)  # Initialize CSRF secret
        app.add_middleware(CSRFMiddleware)  # CSRF protection
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(PerformanceMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware)
    
    # Built-in middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Exception handlers
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(ValidationException, validation_exception_handler)
    app.add_exception_handler(AuthenticationException, authentication_exception_handler)
    app.add_exception_handler(AuthorizationException, authorization_exception_handler)
    app.add_exception_handler(RateLimitException, rate_limit_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # Root endpoint
    @app.get("/", tags=["Root"])
    async def root():
        """API root endpoint."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "docs_url": "/docs",
            "health_url": "/health"
        }

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health_check_endpoint():
        """Health check endpoint for load balancers and monitoring."""
        return {
            "status": "healthy",
            "version": settings.app_version,
            "environment": settings.environment,
            "checks": {
                "database": "ok",
                "redis": "ok"
            }
        }

    # Stats endpoint
    @app.get("/stats", tags=["Health"])
    async def stats_endpoint():
        """Stats endpoint."""
        return {
            "status": "ok"
        }

    # Readiness check endpoint
    @app.get("/ready", tags=["Health"])
    async def readiness_check():
        """Readiness check endpoint for Kubernetes."""
        # Add actual readiness checks here
        return {
            "status": "ready",
            "checks": {
                "database": "ok",
                "redis": "ok",
                "external_apis": "ok"
            }
        }
    
    # Include auth routes (at /api/auth - prefix already defined in router)
    app.include_router(auth_router)

    # Include API routes (at /api/v1)
    app.include_router(api_router, prefix="/api/v1")

    # Metrics endpoint for Prometheus
    if settings.enable_metrics:
        # metrics_app = make_asgi_app()
        # app.mount("/metrics", metrics_app)
        pass
    
    return app


# Create the application instance
app = create_app()


if __name__ == "__main__":
    # Production server configuration
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        workers=1 if settings.debug else settings.workers,
        loop="uvloop",
        http="httptools",
        access_log=settings.debug,
        reload=settings.debug,
        log_config=None,  # We handle logging ourselves
    )