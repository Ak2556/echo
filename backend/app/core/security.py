"""
Production-grade security utilities including JWT, password hashing,
and security headers.

SECURITY: This module now delegates to secure implementations.
- Password hashing: Uses Argon2id from app.auth.security
- JWT tokens: Uses RS256 from app.auth.jwt_utils
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union

from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import get_settings
from app.core.exceptions import AuthenticationException, AuthorizationException

# Import secure implementations
from app.auth.security import hash_password as secure_hash_password
from app.auth.security import verify_password as secure_verify_password
from app.auth.jwt_utils import get_jwt_manager

settings = get_settings()

# JWT Security
security = HTTPBearer()


class SecurityManager:
    """Centralized security management - delegates to secure implementations."""

    def __init__(self):
        self.secret_key = settings.secret_key
        self.algorithm = settings.algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_days = settings.refresh_token_expire_days

    def hash_password(self, password: str) -> str:
        """Hash a password using Argon2id."""
        # SECURITY FIX: Now uses Argon2id instead of SHA-256
        return secure_hash_password(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its Argon2id hash."""
        # SECURITY FIX: Now uses Argon2id verification
        return secure_verify_password(hashed_password, plain_password)

    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """Create a JWT access token with RS256 signing."""
        # SECURITY FIX: Now uses proper RS256 JWT instead of base64
        jwt_manager = get_jwt_manager()

        return jwt_manager.create_access_token(
            user_id=data.get("sub", ""),
            email=data.get("email", ""),
            token_version=data.get("ver", 1),
            session_id=data.get("sid"),
            auth_methods=data.get("amr"),
            scopes=data.get("scope", "").split() if data.get("scope") else None,
            expires_delta=expires_delta
        )

    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify and decode a JWT token with RS256."""
        # SECURITY FIX: Now uses proper RS256 JWT verification
        jwt_manager = get_jwt_manager()

        try:
            payload = jwt_manager.verify_token(token, token_type=token_type)
            return payload

        except ValueError as e:
            raise AuthenticationException(f"Invalid token: {str(e)}")
        except Exception as e:
            raise AuthenticationException(f"Invalid token: {str(e)}")
    
    def generate_api_key(self, length: int = 32) -> str:
        """Generate a secure API key."""
        return secrets.token_urlsafe(length)
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength."""
        issues = []
        score = 0
        
        # Length check
        if len(password) < settings.password_min_length:
            issues.append(f"Password must be at least {settings.password_min_length} characters long")
        else:
            score += 1
        
        # Character variety checks
        if not any(c.islower() for c in password):
            issues.append("Password must contain at least one lowercase letter")
        else:
            score += 1
        
        if not any(c.isupper() for c in password):
            issues.append("Password must contain at least one uppercase letter")
        else:
            score += 1
        
        if not any(c.isdigit() for c in password):
            issues.append("Password must contain at least one number")
        else:
            score += 1
        
        # Determine strength
        if score >= 4:
            strength = "strong"
        elif score >= 2:
            strength = "medium"
        else:
            strength = "weak"
        
        return {
            "valid": len(issues) == 0,
            "strength": strength,
            "score": max(0, score),
            "issues": issues,
        }


# Global security manager
security_manager = SecurityManager()


# Convenience function
def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength using the global security manager."""
    return security_manager.validate_password_strength(password)


# Dependency functions

async def get_current_user_token(credentials: HTTPAuthorizationCredentials = security) -> Dict[str, Any]:
    """Get current user from JWT token."""
    try:
        payload = security_manager.verify_token(credentials.credentials)
        return payload
    except AuthenticationException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def setup_security():
    """Setup security configurations."""
    # This function can be used to initialize security settings
    pass


def get_cors_origins() -> list:
    """Get allowed CORS origins based on environment."""
    if settings.is_development:
        return [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://localhost:3002",
            "http://127.0.0.1:3000",
        ]
    elif settings.is_production:
        return settings.cors_origins
    else:
        return ["*"]  # Test environment