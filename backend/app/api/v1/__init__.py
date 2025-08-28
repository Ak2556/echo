"""
API v1 router with all endpoints.
"""
from fastapi import APIRouter

# Import existing endpoints
try:
    from .endpoints import auth
except ImportError:
    auth = None

try:
    from .endpoints import users
except ImportError:
    users = None

try:
    from .endpoints import posts
except ImportError:
    posts = None

try:
    from .endpoints import chat
except ImportError:
    chat = None

try:
    from .endpoints import admin
except ImportError:
    admin = None

try:
    from .endpoints import shop
except ImportError:
    shop = None

try:
    from .endpoints import tuition
except ImportError:
    tuition = None

try:
    from .endpoints import files
except ImportError:
    files = None

try:
    from .endpoints import search
except ImportError:
    search = None

try:
    from .endpoints import analytics
except ImportError:
    analytics = None

api_router = APIRouter()

# Include all endpoint routers that are available
if auth:
    api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
if users:
    api_router.include_router(users.router, prefix="/users", tags=["Users"])
if posts:
    api_router.include_router(posts.router, prefix="/posts", tags=["Posts"])
if chat:
    api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
if admin:
    api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
if shop:
    api_router.include_router(shop.router, prefix="/shop", tags=["E-commerce Shop"])
if tuition:
    api_router.include_router(tuition.router, prefix="/tuition", tags=["Tuition & Education"])
if files:
    api_router.include_router(files.router, prefix="/files", tags=["File Management"])
if search:
    api_router.include_router(search.router, prefix="/search", tags=["Search"])
if analytics:
    api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@api_router.get("/")
async def api_info():
    """API version information."""
    return {
        "version": "1.0",
        "description": "Echo API v1 - Production-grade social media API with AI integration, tuition management, and e-commerce",
        "endpoints": {
            "auth": "/auth - Authentication and authorization",
            "users": "/users - User management and profiles",
            "posts": "/posts - Content creation and management",
            "chat": "/chat - AI-powered chat functionality",
            "files": "/files - File upload and management",
            "search": "/search - Search functionality",
            "analytics": "/analytics - Analytics and metrics",
            "admin": "/admin - Administrative functions"
        }
    }