"""
Authentication dependencies and middleware for protecting routes.
"""
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import structlog

from ..core.database import get_db
from .models import User
from .jwt_utils import get_jwt_manager
from .redis_service import get_redis_service

logger = structlog.get_logger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    """Authenticated user information extracted from JWT."""

    def __init__(self, user: User, payload: dict):
        self.user = user
        self.payload = payload

    @property
    def id(self) -> str:
        return self.user.id

    @property
    def email(self) -> str:
        return self.user.email

    @property
    def is_verified(self) -> bool:
        return self.user.email_verified

    @property
    def has_2fa(self) -> bool:
        return self.user.totp_enabled

    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission (placeholder for future RBAC)."""
        # TODO: Implement role-based access control
        return True

    def require_permission(self, permission: str):
        """Require a specific permission, raise exception if not present."""
        if not self.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission}"
            )


async def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Extract JWT token from Authorization header or cookie.

    Priority:
    1. Authorization: Bearer <token> header
    2. access_token cookie (for browser clients)
    """
    # Try Authorization header first
    if credentials:
        return credentials.credentials

    # Try cookie
    token = request.cookies.get("access_token")
    if token:
        return token

    return None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request)
) -> AuthenticatedUser:
    """
    Get current authenticated user from JWT token.

    This is the main dependency for protecting routes.
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: AuthenticatedUser = Depends(get_current_user)):
            return {"user_id": current_user.id}
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jwt_manager = get_jwt_manager()
    redis = get_redis_service()

    # Verify JWT
    try:
        payload = jwt_manager.verify_token(token, "access")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    token_version = payload.get("ver", 1)

    # Check if token is blacklisted (global logout)
    if await redis.is_user_tokens_blacklisted(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # Check if account is locked
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked",
        )

    # Check token version (for password changes / global logout)
    if token_version != user.token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is no longer valid. Please login again.",
        )

    return AuthenticatedUser(user=user, payload=payload)


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request)
) -> Optional[AuthenticatedUser]:
    """
    Get current user if token is provided, otherwise return None.

    Useful for routes that are public but behave differently when authenticated.

    Usage:
        @router.get("/public-but-personalized")
        async def route(current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)):
            if current_user:
                return {"message": f"Hello {current_user.email}"}
            return {"message": "Hello guest"}
    """
    if not token:
        return None

    try:
        return await get_current_user(request, db, token)
    except HTTPException:
        return None


async def require_verified_email(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Require that the user has verified their email.

    Usage:
        @router.post("/sensitive-action")
        async def route(current_user: AuthenticatedUser = Depends(require_verified_email)):
            # User is authenticated AND email is verified
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )

    return current_user


async def require_2fa(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Require that the user has 2FA enabled.

    Usage:
        @router.post("/admin-action")
        async def route(current_user: AuthenticatedUser = Depends(require_2fa)):
            # User has 2FA enabled
    """
    if not current_user.has_2fa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Two-factor authentication required"
        )

    # Check if current session used 2FA
    auth_methods = current_user.payload.get("amr", [])
    if "totp" not in auth_methods:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Two-factor authentication required for this action"
        )

    return current_user


def require_scopes(required_scopes: List[str]):
    """
    Require specific OAuth scopes (for future scope-based permissions).

    Usage:
        @router.get("/admin/users")
        async def route(current_user: AuthenticatedUser = Depends(require_scopes(["admin:read"]))):
            # User has admin:read scope
    """
    async def _require_scopes(
        current_user: AuthenticatedUser = Depends(get_current_user)
    ) -> AuthenticatedUser:
        token_scopes = current_user.payload.get("scope", "").split()

        for required_scope in required_scopes:
            if required_scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required scope: {required_scope}"
                )

        return current_user

    return _require_scopes


async def get_current_active_user(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Get current active user (alias for get_current_user for compatibility).
    """
    return current_user


# Convenience dependencies
RequireAuth = Depends(get_current_user)
RequireVerified = Depends(require_verified_email)
Require2FA = Depends(require_2fa)
OptionalAuth = Depends(get_current_user_optional)
