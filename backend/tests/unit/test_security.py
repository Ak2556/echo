"""
Unit tests for security utilities.
"""

import pytest
from app.core.security import (
    validate_password_strength,
    security_manager,
)


class TestValidatePasswordStrength:
    """Tests for password strength validation."""

    def test_strong_password(self):
        """Test strong password."""
        result = validate_password_strength("Strong123!")
        assert result["valid"] is True
        assert result["score"] >= 3
        assert len(result["issues"]) == 0

    def test_weak_password_too_short(self):
        """Test password too short."""
        result = validate_password_strength("Sh0rt!")
        assert result["valid"] is False
        assert "at least" in str(result["issues"])

    def test_password_no_uppercase(self):
        """Test password without uppercase."""
        result = validate_password_strength("weakpass123!")
        assert result["valid"] is False
        assert "uppercase" in str(result["issues"])

    def test_password_no_lowercase(self):
        """Test password without lowercase."""
        result = validate_password_strength("WEAKPASS123!")
        assert result["valid"] is False
        assert "lowercase" in str(result["issues"])

    def test_password_no_number(self):
        """Test password without number."""
        result = validate_password_strength("WeakPass!")
        assert result["valid"] is False
        assert "number" in str(result["issues"])


class TestSecurityManager:
    """Tests for SecurityManager class."""

    def test_hash_password(self):
        """Test password hashing."""
        password = "testpassword123"
        hashed = security_manager.hash_password(password)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password(self):
        """Test password verification."""
        password = "testpassword123"
        hashed = security_manager.hash_password(password)
        assert security_manager.verify_password(password, hashed) is True
        assert security_manager.verify_password("wrongpassword", hashed) is False

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = security_manager.create_access_token(data)
        assert token is not None
        assert len(token) > 0

    def test_verify_token(self):
        """Test token verification."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = security_manager.create_access_token(data)
        
        # Verify the token
        payload = security_manager.verify_token(token)
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == "access"

    def test_generate_api_key(self):
        """Test API key generation."""
        api_key = security_manager.generate_api_key()
        assert api_key is not None
        assert len(api_key) > 0

        # Generate another and ensure they're different
        api_key2 = security_manager.generate_api_key()
        assert api_key != api_key2

    def test_create_access_token_with_custom_expiry(self):
        """Test access token creation with custom expiry delta."""
        from datetime import timedelta
        data = {"sub": "user123"}
        custom_expiry = timedelta(hours=2)

        token = security_manager.create_access_token(data, expires_delta=custom_expiry)

        assert token is not None
        payload = security_manager.verify_token(token)
        assert payload["sub"] == "user123"

    def test_verify_token_expired(self):
        """Test verifying an expired token."""
        from datetime import timedelta
        from app.core.exceptions import AuthenticationException

        data = {"sub": "user123"}
        # Create token with negative expiry (already expired)
        token = security_manager.create_access_token(data, expires_delta=timedelta(seconds=-10))

        with pytest.raises(AuthenticationException) as exc_info:
            security_manager.verify_token(token)

        # Generic exception message is raised due to exception handling
        assert "Invalid token" in str(exc_info.value)

    def test_verify_token_wrong_type(self):
        """Test verifying token with wrong type."""
        from app.core.exceptions import AuthenticationException

        data = {"sub": "user123"}
        token = security_manager.create_access_token(data)

        # Token was created as "access" type, verify as "refresh" type
        with pytest.raises(AuthenticationException) as exc_info:
            security_manager.verify_token(token, token_type="refresh")

        # Generic exception message is raised due to exception handling
        assert "Invalid token" in str(exc_info.value)

    def test_verify_token_invalid(self):
        """Test verifying an invalid token."""
        from app.core.exceptions import AuthenticationException

        invalid_token = "this_is_not_a_valid_token"

        with pytest.raises(AuthenticationException) as exc_info:
            security_manager.verify_token(invalid_token)

        assert "Invalid token" in str(exc_info.value)

    def test_password_strength_weak(self):
        """Test weak password strength."""
        # Password with very few requirements met
        result = security_manager.validate_password_strength("abc")

        assert result["valid"] is False
        assert result["strength"] == "weak"
        assert result["score"] < 2
        assert len(result["issues"]) > 0


class TestSecurityFunctions:
    """Tests for security utility functions."""

    def test_setup_security(self):
        """Test setup_security function."""
        from app.core.security import setup_security

        # Should not raise any errors
        setup_security()

    def test_get_cors_origins_development(self):
        """Test get_cors_origins in development mode."""
        from app.core.security import get_cors_origins
        from app.core.config import settings
        from unittest.mock import patch

        with patch.object(settings, 'environment', "development"):
            origins = get_cors_origins()
            assert "http://localhost:3000" in origins
            assert "http://localhost:3001" in origins
            assert "http://localhost:3002" in origins
            assert "http://127.0.0.1:3000" in origins

    def test_get_cors_origins_production(self):
        """Test get_cors_origins in production mode."""
        from app.core.security import get_cors_origins
        from app.core.config import settings
        from unittest.mock import patch

        production_origins = ["https://example.com", "https://www.example.com"]
        with patch.object(settings, 'environment', "production"):
            with patch.object(settings, 'cors_origins', production_origins):
                origins = get_cors_origins()
                # Convert Url objects to strings for comparison
                origins_str = [str(origin) for origin in origins]
                # Urls may have trailing slash, normalize both
                expected_str = [url.rstrip('/') + '/' for url in production_origins]
                assert origins_str == expected_str or origins == production_origins

    def test_get_cors_origins_test_environment(self):
        """Test get_cors_origins in test environment."""
        from app.core.security import get_cors_origins
        from app.core.config import settings
        from unittest.mock import patch

        with patch.object(settings, 'environment', "test"):
            origins = get_cors_origins()
            assert origins == ["*"]

    @pytest.mark.asyncio
    async def test_get_current_user_token(self):
        """Test getting current user from token."""
        from app.core.security import get_current_user_token
        from fastapi.security import HTTPAuthorizationCredentials
        from unittest.mock import Mock

        # Create a valid token
        data = {"sub": "user123", "email": "test@example.com"}
        token = security_manager.create_access_token(data)

        # Create credentials mock
        credentials = Mock(spec=HTTPAuthorizationCredentials)
        credentials.credentials = token

        # Get user from token
        payload = await get_current_user_token(credentials)

        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_current_user_token_invalid(self):
        """Test getting current user with invalid token."""
        from app.core.security import get_current_user_token
        from fastapi.security import HTTPAuthorizationCredentials
        from fastapi import HTTPException
        from unittest.mock import Mock

        # Create credentials with invalid token
        credentials = Mock(spec=HTTPAuthorizationCredentials)
        credentials.credentials = "invalid_token"

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_token(credentials)

        assert exc_info.value.status_code == 401