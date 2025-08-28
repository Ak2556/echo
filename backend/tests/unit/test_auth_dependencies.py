"""
Unit tests for auth dependencies.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from app.auth.dependencies import (
    AuthenticatedUser,
    get_token_from_request,
    get_current_user,
    get_current_user_optional,
    require_verified_email,
    require_2fa,
    get_current_active_user,
    require_scopes,
)
from app.auth.models import User


class TestAuthenticatedUser:
    """Tests for AuthenticatedUser class."""

    def test_authenticated_user_creation(self):
        """Test AuthenticatedUser creation."""
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "test@example.com"
        mock_user.email_verified = True
        mock_user.totp_enabled = False
        
        payload = {"sub": "user123", "email": "test@example.com"}
        
        auth_user = AuthenticatedUser(mock_user, payload)
        
        assert auth_user.user is mock_user
        assert auth_user.payload == payload
        assert auth_user.id == "user123"
        assert auth_user.email == "test@example.com"
        assert auth_user.is_verified is True
        assert auth_user.has_2fa is False

    def test_authenticated_user_has_permission(self):
        """Test has_permission method (placeholder implementation)."""
        mock_user = Mock(spec=User)
        payload = {}
        
        auth_user = AuthenticatedUser(mock_user, payload)
        
        # Currently returns True for all permissions (placeholder)
        assert auth_user.has_permission("read:users") is True
        assert auth_user.has_permission("admin:all") is True

    def test_authenticated_user_require_permission_success(self):
        """Test require_permission method success."""
        mock_user = Mock(spec=User)
        payload = {}
        
        auth_user = AuthenticatedUser(mock_user, payload)
        
        # Should not raise exception (placeholder implementation)
        auth_user.require_permission("read:users")

    def test_authenticated_user_require_permission_failure(self):
        """Test require_permission method failure."""
        mock_user = Mock(spec=User)
        payload = {}
        
        auth_user = AuthenticatedUser(mock_user, payload)
        
        # Mock has_permission to return False
        with patch.object(auth_user, 'has_permission', return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                auth_user.require_permission("admin:all")
            
            assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


class TestGetTokenFromRequest:
    """Tests for get_token_from_request dependency."""

    @pytest.mark.asyncio
    async def test_get_token_from_authorization_header(self):
        """Test token extraction from Authorization header."""
        mock_request = Mock(spec=Request)
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "test_token"
        
        result = await get_token_from_request(mock_request, mock_credentials)
        
        assert result == "test_token"

    @pytest.mark.asyncio
    async def test_get_token_from_cookie(self):
        """Test token extraction from cookie."""
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"access_token": "cookie_token"}
        
        result = await get_token_from_request(mock_request, None)
        
        assert result == "cookie_token"

    @pytest.mark.asyncio
    async def test_get_token_no_token(self):
        """Test token extraction when no token is present."""
        mock_request = Mock(spec=Request)
        mock_request.cookies = {}
        
        result = await get_token_from_request(mock_request, None)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_get_token_header_priority(self):
        """Test that Authorization header takes priority over cookie."""
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"access_token": "cookie_token"}
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "header_token"
        
        result = await get_token_from_request(mock_request, mock_credentials)
        
        assert result == "header_token"


class TestGetCurrentUser:
    """Tests for get_current_user dependency."""

    @pytest.mark.asyncio
    async def test_get_current_user_success(self):
        """Test successful user retrieval from token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "test@example.com"
        mock_user.is_active = True
        mock_user.is_locked = False
        mock_user.token_version = 1
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            # Mock JWT verification
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "user123",
                "email": "test@example.com",
                "ver": 1
            }
            
            # Mock Redis check
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=False)

            # Mock database query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute = AsyncMock(return_value=mock_result)

            result = await get_current_user(mock_request, mock_db, token)
            
            assert isinstance(result, AuthenticatedUser)
            assert result.user is mock_user

    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self):
        """Test user retrieval without token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db, None)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """Test user retrieval with invalid token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "invalid_token"
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager:
            mock_jwt_manager.return_value.verify_token.side_effect = ValueError("Invalid token")
            
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_current_user_blacklisted_token(self):
        """Test user retrieval with blacklisted token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "blacklisted_token"
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "user123",
                "ver": 1
            }
            
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=True)
            
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_current_user_not_found(self):
        """Test user retrieval when user not found in database."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "nonexistent_user",
                "ver": 1
            }
            
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=False)

            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute = AsyncMock(return_value=mock_result)

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_current_user_inactive(self):
        """Test user retrieval with inactive user."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.is_active = False
        mock_user.is_locked = False
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "user123",
                "ver": 1
            }
            
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=False)

            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute = AsyncMock(return_value=mock_result)

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)

            assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_current_user_locked(self):
        """Test user retrieval with locked user."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.is_active = True
        mock_user.is_locked = True
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "user123",
                "ver": 1
            }
            
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=False)

            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute = AsyncMock(return_value=mock_result)

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)

            assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_current_user_token_version_mismatch(self):
        """Test user retrieval with token version mismatch."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.is_active = True
        mock_user.is_locked = False
        mock_user.token_version = 2  # Different from token version
        
        with patch('app.auth.dependencies.get_jwt_manager') as mock_jwt_manager, \
             patch('app.auth.dependencies.get_redis_service') as mock_redis:
            
            mock_jwt_manager.return_value.verify_token.return_value = {
                "sub": "user123",
                "ver": 1  # Different from user token version
            }
            
            mock_redis.return_value.is_user_tokens_blacklisted = AsyncMock(return_value=False)

            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute = AsyncMock(return_value=mock_result)

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_request, mock_db, token)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


class TestGetCurrentUserOptional:
    """Tests for get_current_user_optional dependency."""

    @pytest.mark.asyncio
    async def test_get_current_user_optional_with_valid_token(self):
        """Test optional user retrieval with valid token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "valid_token"
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        
        with patch('app.auth.dependencies.get_current_user', return_value=mock_auth_user):
            result = await get_current_user_optional(mock_request, mock_db, token)
            assert result is mock_auth_user

    @pytest.mark.asyncio
    async def test_get_current_user_optional_no_token(self):
        """Test optional user retrieval without token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        
        result = await get_current_user_optional(mock_request, mock_db, None)
        assert result is None

    @pytest.mark.asyncio
    async def test_get_current_user_optional_invalid_token(self):
        """Test optional user retrieval with invalid token."""
        mock_request = Mock(spec=Request)
        mock_db = AsyncMock()
        token = "invalid_token"
        
        with patch('app.auth.dependencies.get_current_user') as mock_get_user:
            mock_get_user.side_effect = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
            
            result = await get_current_user_optional(mock_request, mock_db, token)
            assert result is None


class TestRequireVerifiedEmail:
    """Tests for require_verified_email dependency."""

    @pytest.mark.asyncio
    async def test_require_verified_email_success(self):
        """Test verified email requirement with verified user."""
        mock_user = Mock(spec=User)
        mock_user.email_verified = True
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.is_verified = True
        
        result = await require_verified_email(mock_auth_user)
        assert result is mock_auth_user

    @pytest.mark.asyncio
    async def test_require_verified_email_unverified(self):
        """Test verified email requirement with unverified user."""
        mock_user = Mock(spec=User)
        mock_user.email_verified = False
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.is_verified = False
        
        with pytest.raises(HTTPException) as exc_info:
            await require_verified_email(mock_auth_user)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


class TestRequire2FA:
    """Tests for require_2fa dependency."""

    @pytest.mark.asyncio
    async def test_require_2fa_success(self):
        """Test 2FA requirement with 2FA enabled and used."""
        mock_user = Mock(spec=User)
        mock_user.totp_enabled = True
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.has_2fa = True
        mock_auth_user.payload = {"amr": ["totp"]}
        
        result = await require_2fa(mock_auth_user)
        assert result is mock_auth_user

    @pytest.mark.asyncio
    async def test_require_2fa_not_enabled(self):
        """Test 2FA requirement with 2FA not enabled."""
        mock_user = Mock(spec=User)
        mock_user.totp_enabled = False
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.has_2fa = False
        
        with pytest.raises(HTTPException) as exc_info:
            await require_2fa(mock_auth_user)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_require_2fa_not_used_in_session(self):
        """Test 2FA requirement when 2FA enabled but not used in current session."""
        mock_user = Mock(spec=User)
        mock_user.totp_enabled = True
        
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.has_2fa = True
        mock_auth_user.payload = {"amr": ["password"]}  # No TOTP in auth methods
        
        with pytest.raises(HTTPException) as exc_info:
            await require_2fa(mock_auth_user)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


class TestRequireScopes:
    """Tests for require_scopes dependency."""

    def test_require_scopes_creation(self):
        """Test require_scopes dependency creation."""
        scopes = ["read:users", "write:users"]
        dependency = require_scopes(scopes)
        
        assert callable(dependency)

    @pytest.mark.asyncio
    async def test_require_scopes_success(self):
        """Test successful scope check."""
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.payload = {"scope": "read:users write:users admin:all"}
        
        dependency = require_scopes(["read:users", "write:users"])
        result = await dependency(mock_auth_user)
        
        assert result is mock_auth_user

    @pytest.mark.asyncio
    async def test_require_scopes_insufficient(self):
        """Test scope check with insufficient scopes."""
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.payload = {"scope": "read:users"}
        
        dependency = require_scopes(["read:users", "write:users"])
        
        with pytest.raises(HTTPException) as exc_info:
            await dependency(mock_auth_user)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_require_scopes_no_scopes(self):
        """Test scope check with no scopes in token."""
        mock_auth_user = Mock(spec=AuthenticatedUser)
        mock_auth_user.payload = {}
        
        dependency = require_scopes(["read:users"])
        
        with pytest.raises(HTTPException) as exc_info:
            await dependency(mock_auth_user)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


class TestGetCurrentActiveUser:
    """Tests for get_current_active_user dependency."""

    @pytest.mark.asyncio
    async def test_get_current_active_user(self):
        """Test get_current_active_user (alias for get_current_user)."""
        mock_auth_user = Mock(spec=AuthenticatedUser)
        
        result = await get_current_active_user(mock_auth_user)
        assert result is mock_auth_user