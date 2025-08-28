"""
API v1 router with all endpoints organized by domain.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    health,
    posts,
    users,
    admin,
    analytics,
    files,
    search,
    shop,
    tuition,
)

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["AI Chat"],
)

api_router.include_router(
    posts.router,
    prefix="/posts",
    tags=["Posts"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    files.router,
    prefix="/files",
    tags=["File Management"],
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Analytics"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administration"],
)

api_router.include_router(
    search.router,
    prefix="/search",
    tags=["Search"],
)

api_router.include_router(
    shop.router,
    prefix="/shop",
    tags=["E-commerce Shop"],
)

api_router.include_router(
    tuition.router,
    prefix="/tuition",
    tags=["Tuition & Education"],
)