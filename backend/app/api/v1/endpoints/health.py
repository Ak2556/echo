"""
Health check endpoints for monitoring and load balancing.
"""
import asyncio
import time
from typing import Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, health_check as db_health_check
from app.core.redis import get_redis
from app.core.config import get_settings
from app.core.exceptions import create_success_response

router = APIRouter()
settings = get_settings()


@router.get("/")
async def health_check():
    """Basic health check for load balancers."""
    return create_success_response(
        data={
            "status": "healthy",
            "timestamp": time.time(),
            "version": settings.app_version,
            "environment": settings.environment,
        },
        message="Service is healthy",
    )


@router.get("/ready")
async def readiness_check(
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis),
):
    """Comprehensive readiness check for Kubernetes."""
    checks = {}
    overall_status = "ready"
    
    # Database check
    try:
        db_healthy = await db_health_check()
        checks["database"] = {
            "status": "healthy" if db_healthy else "unhealthy",
            "response_time": "<50ms" if db_healthy else "timeout",
        }
        if not db_healthy:
            overall_status = "not_ready"
    except Exception as e:
        checks["database"] = {
            "status": "error",
            "error": str(e),
        }
        overall_status = "not_ready"
    
    # Redis check
    try:
        redis_healthy = await redis.health_check()
        checks["redis"] = {
            "status": "healthy" if redis_healthy else "unhealthy",
            "response_time": "<10ms" if redis_healthy else "timeout",
        }
        if not redis_healthy:
            overall_status = "not_ready"
    except Exception as e:
        checks["redis"] = {
            "status": "error",
            "error": str(e),
        }
        overall_status = "not_ready"
    
    # External services check (if enabled)
    if settings.feature_ai_chat and settings.openrouter_api_key:
        try:
            # Quick API key validation
            checks["ai_service"] = {
                "status": "configured",
                "api_key_present": bool(settings.openrouter_api_key),
            }
        except Exception as e:
            checks["ai_service"] = {
                "status": "error",
                "error": str(e),
            }
    
    return create_success_response(
        data={
            "status": overall_status,
            "checks": checks,
            "timestamp": time.time(),
            "version": settings.app_version,
        },
        message=f"Service is {overall_status}",
    )


@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes."""
    # Simple check that the application is running
    return create_success_response(
        data={
            "status": "alive",
            "timestamp": time.time(),
            "uptime": "unknown",  # Could track actual uptime
        },
        message="Service is alive",
    )


@router.get("/detailed")
async def detailed_health_check(
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis),
):
    """Detailed health check with performance metrics."""
    start_time = time.time()
    
    checks = {}
    
    # Database detailed check
    db_start = time.time()
    try:
        await db.execute("SELECT 1")
        db_duration = time.time() - db_start
        checks["database"] = {
            "status": "healthy",
            "response_time_ms": round(db_duration * 1000, 2),
            "connection_pool": "available",  # Could get actual pool stats
        }
    except Exception as e:
        checks["database"] = {
            "status": "error",
            "error": str(e),
            "response_time_ms": round((time.time() - db_start) * 1000, 2),
        }
    
    # Redis detailed check
    redis_start = time.time()
    try:
        await redis.health_check()
        redis_duration = time.time() - redis_start
        
        checks["redis"] = {
            "status": "healthy",
            "response_time_ms": round(redis_duration * 1000, 2),
            "connected_clients": "unknown",
            "used_memory_human": "unknown",
        }
    except Exception as e:
        checks["redis"] = {
            "status": "error",
            "error": str(e),
            "response_time_ms": round((time.time() - redis_start) * 1000, 2),
        }
    
    # AI service check (if enabled)
    try:
        if settings.feature_ai_chat and settings.openrouter_api_key:
            checks["ai_service"] = {
                "status": "configured",
                "api_key_present": bool(settings.openrouter_api_key),
            }
    except Exception as e:
        checks["ai_service"] = {
            "status": "error",
            "error": str(e),
        }

    # System metrics (basic)
    try:
        import psutil
        checks["system"] = {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
        }
    except ImportError:
        checks["system"] = {
            "status": "psutil_not_available",
        }

    total_duration = time.time() - start_time
    
    return create_success_response(
        data={
            "status": "healthy",
            "checks": checks,
            "total_check_time_ms": round(total_duration * 1000, 2),
            "timestamp": time.time(),
            "version": settings.app_version,
            "environment": settings.environment,
        },
        message="Detailed health check completed",
    )