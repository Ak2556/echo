"""
Comprehensive unit tests for authentication routes.
Covers registration, login, logout, token refresh, password reset, email verification, and 2FA.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse

from app.auth.models import Credential, RefreshToken, Session, User, VerificationCode
from app.auth.routes import (
    LoginRequest,
    LogoutRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    TokenRefreshRequest,
    VerifyEmailRequest,
    confirm_password_reset,
    disable_2fa,
    enable_2fa,
)
from app.auth.routes import get_current_user as get_me
from app.auth.routes import (
    list_sessions,
    login,
    logout,
    refresh_token,
    register,
    request_email_verification,
    request_password_reset,
    verify_email,
)

# ==================== Test Fixtures ====================


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = AsyncMock()
    db.add = Mock()
    db.commit = AsyncMock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    db.execute = AsyncMock()
    return db


@pytest.fixture
def mock_request():
    """Mock FastAPI request."""
    request = Mock(spec=Request)
    request.client = Mock()
    request.client.host = "127.0.0.1"
    request.headers = {"user-agent": "Mozilla/5.0 (Test Browser)"}
    request.cookies = {}
    return request


@pytest.fixture
def mock_response():
    """Mock FastAPI response."""
    response = Mock(spec=Response)
    response.set_cookie = Mock()
    return response


@pytest.fixture
def mock_redis():
    """Mock Redis service."""
    redis = AsyncMock()
    redis.client = True
    redis.check_rate_limit = AsyncMock(return_value=(True, 5))
    redis.store_verification_code = AsyncMock()
    redis.verify_code = AsyncMock(return_value=(True, 2))
    redis.increment_failed_login = AsyncMock()
    redis.reset_failed_login = AsyncMock()
    redis.blacklist_token = AsyncMock()
    redis.is_token_blacklisted = AsyncMock(return_value=False)
    redis.is_user_tokens_blacklisted = AsyncMock(return_value=False)
    redis.blacklist_user_tokens = AsyncMock()
    redis.invalidate_token_family = AsyncMock()
    redis.cache_set = AsyncMock()
    return redis


@pytest.fixture
def mock_jwt_manager():
    """Mock JWT manager."""
    jwt_manager = Mock()
    jwt_manager.create_access_token = Mock(return_value="access_token_123")
    jwt_manager.create_refresh_token = Mock(return_value=("refresh_token_123", "jti_123"))
    jwt_manager.verify_token = Mock(
        return_value={
            "sub": "user_123",
            "email": "test@example.com",
            "jti": "jti_123",
            "family_id": "family_123",
            "rot": 0,
            "ver": 1,
        }
    )
    return jwt_manager


@pytest.fixture
def mock_user():
    """Mock user object."""
    user = Mock(spec=User)
    user.id = "user_123"
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.avatar_url = None
    user.email_verified = True
    user.is_active = True
    user.is_locked = False
    user.failed_login_attempts = 0
    user.totp_enabled = False
    user.token_version = 1
    user.last_login_at = None
    user.email_verified_at = None
    user.locked_until = None
    return user


@pytest.fixture
def mock_credential():
    """Mock credential object."""
    credential = Mock(spec=Credential)
    credential.id = "cred_123"
    credential.user_id = "user_123"
    credential.password_hash = "$argon2id$v=19$m=65536,t=3,p=4$test"
    credential.password_changed_at = datetime.now(timezone.utc)
    return credential


# ==================== Registration Tests ====================


class TestRegister:
    """Tests for user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_success(self, mock_db, mock_request, mock_redis):
        """Test successful user registration."""
        # Mock user doesn't exist
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        data = RegisterRequest(
            email="new@example.com", password="StrongPassword123!", full_name="New User"
        )

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 80, "feedback": []},
            ),
            patch("app.auth.routes.check_password_breach", return_value=(False, 0)),
            patch("app.auth.routes.hash_password", return_value="hashed_password"),
            patch("app.auth.routes.generate_otp", return_value="123456"),
            patch("app.auth.routes.hash_token", return_value="hashed_otp"),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            result = await register(data, mock_request, mock_db)

            assert result.email == "new@example.com"
            assert result.message == "Verification code sent to your email"
            assert result.requires_verification is True
            assert mock_db.add.call_count >= 2  # User and Credential
            assert mock_db.commit.call_count >= 2

    @pytest.mark.asyncio
    async def test_register_user_already_exists(self, mock_db, mock_request, mock_redis, mock_user):
        """Test registration when user already exists."""
        # Mock user exists
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        data = RegisterRequest(email="existing@example.com", password="StrongPassword123!")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await register(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "already registered" in str(exc_info.value.detail).lower()

    @pytest.mark.asyncio
    async def test_register_weak_password(self, mock_db, mock_request, mock_redis):
        """Test registration with weak password."""
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        data = RegisterRequest(
            email="new@example.com",
            password="weakpass",  # 8 chars but weak (no uppercase, numbers, special chars)
        )

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 20, "feedback": ["Too short"]},
            ),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await register(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Password too weak" in str(exc_info.value.detail["message"])

    @pytest.mark.asyncio
    async def test_register_breached_password(self, mock_db, mock_request, mock_redis):
        """Test registration with breached password."""
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        data = RegisterRequest(email="new@example.com", password="password123")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 50, "feedback": []},
            ),
            patch("app.auth.routes.check_password_breach", return_value=(True, 1000)),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await register(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "exposed in data breaches" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_register_rate_limited(self, mock_db, mock_request):
        """Test registration rate limiting."""
        mock_redis = AsyncMock()
        mock_redis.client = True
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        data = RegisterRequest(email="new@example.com", password="StrongPassword123!")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "production"

            with pytest.raises(HTTPException) as exc_info:
                await register(data, mock_request, mock_db)

            assert exc_info.value.status_code == 429
            assert "Too many registration attempts" in str(exc_info.value.detail)


# ==================== Email Verification Tests ====================


class TestVerifyEmail:
    """Tests for email verification endpoint."""

    @pytest.mark.asyncio
    async def test_verify_email_success(self, mock_db, mock_request, mock_redis, mock_user):
        """Test successful email verification."""
        data = VerifyEmailRequest(email="test@example.com", code="123456")

        # Mock verification code check
        mock_code = Mock(spec=VerificationCode)
        mock_code.id = "code_123"
        mock_code.user_id = "user_123"

        mock_result_code = Mock()
        mock_result_code.scalar_one_or_none.return_value = mock_code

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_db.execute.side_effect = [mock_result_code, mock_result_user]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_code"),
        ):

            result = await verify_email(data, mock_request, mock_db)

            assert result["message"] == "Email verified successfully"
            assert mock_user.email_verified is True
            assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_verify_email_invalid_code_redis(self, mock_db, mock_request):
        """Test email verification with invalid code from Redis."""
        data = VerifyEmailRequest(email="test@example.com", code="wrong_code")

        mock_redis = AsyncMock()
        mock_redis.client = True
        mock_redis.verify_code = AsyncMock(return_value=(False, 2))

        with patch("app.auth.routes.get_redis_service", return_value=mock_redis):

            with pytest.raises(HTTPException) as exc_info:
                await verify_email(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Invalid or expired code" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_verify_email_invalid_code_database(self, mock_db, mock_request):
        """Test email verification with invalid code from database."""
        data = VerifyEmailRequest(email="test@example.com", code="wrong_code")

        # No Redis available
        mock_redis = None

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_code"),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await verify_email(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Invalid or expired code" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_verify_email_user_not_found(self, mock_db, mock_request, mock_redis):
        """Test email verification when user not found."""
        data = VerifyEmailRequest(email="test@example.com", code="123456")

        # Configure mock_redis to return valid code verification
        mock_redis.verify_code = AsyncMock(return_value=(True, 3))

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = None  # User not found

        mock_db.execute.return_value = mock_result_user

        with patch("app.auth.routes.get_redis_service", return_value=mock_redis):

            with pytest.raises(HTTPException) as exc_info:
                await verify_email(data, mock_request, mock_db)

            assert exc_info.value.status_code == 404
            assert "User not found" in str(exc_info.value.detail)


# ==================== Login Tests ====================


class TestLogin:
    """Tests for login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(
        self,
        mock_db,
        mock_request,
        mock_response,
        mock_redis,
        mock_jwt_manager,
        mock_user,
        mock_credential,
    ):
        """Test successful login."""
        data = LoginRequest(
            email="test@example.com", password="CorrectPassword123!", remember_me=False
        )

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
            patch("app.auth.routes.verify_password", return_value=True),
            patch("app.auth.routes.generate_device_fingerprint", return_value="device_fp_123"),
            patch("app.auth.routes.create_session_record", return_value=Mock()),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            result = await login(data, mock_request, mock_response, mock_db)

            assert result.access_token == "access_token_123"
            assert result.refresh_token == "refresh_token_123"
            assert result.token_type == "bearer"
            assert result.user["email"] == "test@example.com"
            assert result.requires_2fa is False
            assert mock_response.set_cookie.called

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(
        self, mock_db, mock_request, mock_response, mock_redis, mock_user, mock_credential
    ):
        """Test login with invalid credentials."""
        data = LoginRequest(email="test@example.com", password="WrongPassword")

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.verify_password", return_value=False),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "Invalid credentials" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_login_user_not_found(self, mock_db, mock_request, mock_response, mock_redis):
        """Test login when user not found."""
        data = LoginRequest(email="nonexistent@example.com", password="Password123!")

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "Invalid credentials" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_login_account_locked(
        self, mock_db, mock_request, mock_response, mock_redis, mock_user
    ):
        """Test login with locked account."""
        data = LoginRequest(email="test@example.com", password="Password123!")

        mock_user.is_locked = True
        mock_user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 403
            assert "Account is locked" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_login_email_not_verified(
        self, mock_db, mock_request, mock_response, mock_redis, mock_user, mock_credential
    ):
        """Test login with unverified email."""
        data = LoginRequest(email="test@example.com", password="CorrectPassword123!")

        mock_user.email_verified = False

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.verify_password", return_value=True),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 403
            assert "verify your email" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_login_requires_2fa(
        self, mock_db, mock_request, mock_response, mock_redis, mock_user, mock_credential
    ):
        """Test login when 2FA is required."""
        data = LoginRequest(email="test@example.com", password="CorrectPassword123!")

        mock_user.totp_enabled = True

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.verify_password", return_value=True),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            result = await login(data, mock_request, mock_response, mock_db)

            # Should return JSONResponse for 2FA
            assert isinstance(result, JSONResponse)

    @pytest.mark.asyncio
    async def test_login_failed_attempts_lockout(
        self, mock_db, mock_request, mock_response, mock_redis, mock_user, mock_credential
    ):
        """Test account lockout after failed login attempts."""
        data = LoginRequest(email="test@example.com", password="WrongPassword")

        mock_user.failed_login_attempts = 4  # Will be 5 after this attempt

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.verify_password", return_value=False),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert mock_user.is_locked is True
            assert mock_user.locked_until is not None

    @pytest.mark.asyncio
    async def test_login_rate_limited(self, mock_db, mock_request, mock_response):
        """Test login rate limiting."""
        data = LoginRequest(email="test@example.com", password="Password123!")

        mock_redis = AsyncMock()
        mock_redis.client = True
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "production"

            with pytest.raises(HTTPException) as exc_info:
                await login(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 429
            assert "Too many login attempts" in str(exc_info.value.detail)


# ==================== Logout Tests ====================


class TestLogout:
    """Tests for logout endpoint."""

    @pytest.mark.asyncio
    async def test_logout_success(self, mock_db, mock_request, mock_redis, mock_jwt_manager):
        """Test successful logout."""
        data = LogoutRequest(everywhere=False)
        mock_request.cookies = {"refresh_token": "refresh_token_123"}

        mock_session = Mock(spec=Session)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_session
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            result = await logout(mock_request, data, mock_db)

            assert result["message"] == "Logged out successfully"
            assert mock_session.is_current is False
            assert mock_redis.blacklist_token.called

    @pytest.mark.asyncio
    async def test_logout_everywhere(self, mock_db, mock_request, mock_redis, mock_jwt_manager):
        """Test logout from all devices."""
        data = LogoutRequest(everywhere=True)
        mock_request.cookies = {"refresh_token": "refresh_token_123"}

        mock_session = Mock(spec=Session)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_session
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            result = await logout(mock_request, data, mock_db)

            assert result["message"] == "Logged out successfully"
            assert mock_redis.blacklist_user_tokens.called

    @pytest.mark.asyncio
    async def test_logout_no_token(self, mock_db, mock_request, mock_redis):
        """Test logout without refresh token."""
        data = LogoutRequest(everywhere=False)
        mock_request.cookies = {}

        with patch("app.auth.routes.get_redis_service", return_value=mock_redis):

            result = await logout(mock_request, data, mock_db)

            assert result["message"] == "Logged out successfully"

    @pytest.mark.asyncio
    async def test_logout_invalid_token(self, mock_db, mock_request, mock_redis):
        """Test logout with invalid token."""
        data = LogoutRequest(everywhere=False)
        mock_request.cookies = {"refresh_token": "invalid_token"}

        mock_jwt_manager = Mock()
        mock_jwt_manager.verify_token.side_effect = Exception("Invalid token")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            result = await logout(mock_request, data, mock_db)

            # Should still return success
            assert result["message"] == "Logged out successfully"


# ==================== Token Refresh Tests ====================


class TestRefreshToken:
    """Tests for token refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_token_success(
        self, mock_db, mock_request, mock_response, mock_redis, mock_jwt_manager, mock_user
    ):
        """Test successful token refresh."""
        data = TokenRefreshRequest(refresh_token="refresh_token_123")

        mock_token_record = Mock(spec=RefreshToken)
        mock_token_record.is_revoked = False
        mock_token_record.device_fingerprint = "device_fp_123"
        mock_token_record.user_agent = "Test Browser"

        mock_result_token = Mock()
        mock_result_token.scalar_one_or_none.return_value = mock_token_record

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_session = Mock(spec=Session)
        mock_result_session = Mock()
        mock_result_session.scalar_one_or_none.return_value = mock_session

        mock_db.execute.side_effect = [mock_result_token, mock_result_user, mock_result_session]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            result = await refresh_token(data, mock_request, mock_response, mock_db)

            assert result.access_token == "access_token_123"
            assert result.refresh_token == "refresh_token_123"
            assert mock_token_record.is_revoked is True
            assert mock_response.set_cookie.called

    @pytest.mark.asyncio
    async def test_refresh_token_from_cookie(
        self, mock_db, mock_request, mock_response, mock_redis, mock_jwt_manager, mock_user
    ):
        """Test token refresh from cookie."""
        data = TokenRefreshRequest(refresh_token="")
        mock_request.cookies = {"refresh_token": "cookie_refresh_token"}

        mock_token_record = Mock(spec=RefreshToken)
        mock_token_record.is_revoked = False
        mock_token_record.device_fingerprint = "device_fp_123"
        mock_token_record.user_agent = "Test Browser"

        mock_result_token = Mock()
        mock_result_token.scalar_one_or_none.return_value = mock_token_record

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_session = Mock(spec=Session)
        mock_result_session = Mock()
        mock_result_session.scalar_one_or_none.return_value = mock_session

        mock_db.execute.side_effect = [mock_result_token, mock_result_user, mock_result_session]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            result = await refresh_token(data, mock_request, mock_response, mock_db)

            assert result.access_token == "access_token_123"

    @pytest.mark.asyncio
    async def test_refresh_token_no_token(self, mock_db, mock_request, mock_response, mock_redis):
        """Test token refresh without token."""
        data = TokenRefreshRequest(refresh_token="")
        mock_request.cookies = {}

        with patch("app.auth.routes.get_redis_service", return_value=mock_redis):

            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "No refresh token provided" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, mock_db, mock_request, mock_response, mock_redis):
        """Test token refresh with invalid token."""
        data = TokenRefreshRequest(refresh_token="invalid_token")

        mock_jwt_manager = Mock()
        mock_jwt_manager.verify_token.side_effect = ValueError("Invalid token")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "Invalid or expired refresh token" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_refresh_token_blacklisted(
        self, mock_db, mock_request, mock_response, mock_jwt_manager
    ):
        """Test token refresh with blacklisted token."""
        data = TokenRefreshRequest(refresh_token="blacklisted_token")

        mock_redis = AsyncMock()
        mock_redis.client = True
        mock_redis.is_token_blacklisted = AsyncMock(return_value=True)

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "Token has been revoked" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_refresh_token_reuse_detection(
        self, mock_db, mock_request, mock_response, mock_redis, mock_jwt_manager
    ):
        """Test token reuse detection (revoked token)."""
        data = TokenRefreshRequest(refresh_token="reused_token")

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None  # Token not found
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "Invalid refresh token" in str(exc_info.value.detail)
            assert mock_redis.invalidate_token_family.called

    @pytest.mark.asyncio
    async def test_refresh_token_inactive_user(
        self, mock_db, mock_request, mock_response, mock_redis, mock_jwt_manager, mock_user
    ):
        """Test token refresh with inactive user."""
        data = TokenRefreshRequest(refresh_token="refresh_token_123")

        mock_token_record = Mock(spec=RefreshToken)
        mock_token_record.is_revoked = False

        mock_result_token = Mock()
        mock_result_token.scalar_one_or_none.return_value = mock_token_record

        mock_user.is_active = False
        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_db.execute.side_effect = [mock_result_token, mock_result_user]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await refresh_token(data, mock_request, mock_response, mock_db)

            assert exc_info.value.status_code == 401
            assert "User not found or inactive" in str(exc_info.value.detail)


# ==================== Get Current User Tests ====================


class TestGetCurrentUser:
    """Tests for get current user endpoint."""

    @pytest.mark.asyncio
    async def test_get_me_success(self, mock_db, mock_request, mock_jwt_manager, mock_user):
        """Test successful get current user."""
        mock_request.headers = {"authorization": "Bearer valid_token"}

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager):

            result = await get_me(mock_request, mock_db)

            assert result["id"] == "user_123"
            assert result["email"] == "test@example.com"
            assert result["full_name"] == "Test User"
            assert "email_verified" in result

    @pytest.mark.asyncio
    async def test_get_me_no_token(self, mock_db, mock_request):
        """Test get current user without token."""
        mock_request.headers = {}

        with pytest.raises(HTTPException) as exc_info:
            await get_me(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "Missing authorization token" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_me_invalid_token(self, mock_db, mock_request):
        """Test get current user with invalid token."""
        mock_request.headers = {"authorization": "Bearer invalid_token"}

        mock_jwt_manager = Mock()
        mock_jwt_manager.verify_token.side_effect = ValueError("Invalid token")

        with patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager):

            with pytest.raises(HTTPException) as exc_info:
                await get_me(mock_request, mock_db)

            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_user_not_found(self, mock_db, mock_request, mock_jwt_manager):
        """Test get current user when user not found."""
        mock_request.headers = {"authorization": "Bearer valid_token"}

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with patch("app.auth.routes.get_jwt_manager", return_value=mock_jwt_manager):

            with pytest.raises(HTTPException) as exc_info:
                await get_me(mock_request, mock_db)

            assert exc_info.value.status_code == 404
            assert "User not found" in str(exc_info.value.detail)


# ==================== Password Reset Tests ====================


class TestPasswordReset:
    """Tests for password reset endpoints."""

    @pytest.mark.asyncio
    async def test_request_password_reset_success(
        self, mock_db, mock_request, mock_redis, mock_user
    ):
        """Test successful password reset request."""
        data = PasswordResetRequest(email="test@example.com")

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            result = await request_password_reset(data, mock_request, mock_db)

            assert "password reset link has been sent" in result["message"]
            assert mock_db.add.called
            assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_request_password_reset_user_not_found(self, mock_db, mock_request, mock_redis):
        """Test password reset request for non-existent user."""
        data = PasswordResetRequest(email="nonexistent@example.com")

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            result = await request_password_reset(data, mock_request, mock_db)

            # Should return success for security (don't reveal user existence)
            assert "password reset link has been sent" in result["message"]

    @pytest.mark.asyncio
    async def test_request_password_reset_rate_limited(self, mock_db, mock_request):
        """Test password reset rate limiting."""
        data = PasswordResetRequest(email="test@example.com")

        mock_redis = AsyncMock()
        mock_redis.client = True
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "production"

            with pytest.raises(HTTPException) as exc_info:
                await request_password_reset(data, mock_request, mock_db)

            assert exc_info.value.status_code == 429
            assert "Too many password reset attempts" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_confirm_password_reset_success(
        self, mock_db, mock_request, mock_redis, mock_user, mock_credential
    ):
        """Test successful password reset confirmation."""
        data = PasswordResetConfirm(token="reset_token_123", new_password="NewStrongPassword123!")

        mock_code = Mock(spec=VerificationCode)
        mock_code.user_id = "user_123"
        mock_code.is_used = False

        mock_result_code = Mock()
        mock_result_code.scalar_one_or_none.return_value = mock_code

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_code, mock_result_user, mock_result_cred]

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 80, "feedback": []},
            ),
            patch("app.auth.routes.hash_password", return_value="new_hashed_password"),
        ):

            result = await confirm_password_reset(data, mock_request, mock_db)

            assert "Password has been reset successfully" in result["message"]
            assert mock_code.is_used is True
            assert mock_user.token_version == 2  # Incremented

    @pytest.mark.asyncio
    async def test_confirm_password_reset_invalid_token(self, mock_db, mock_request, mock_redis):
        """Test password reset confirmation with invalid token."""
        data = PasswordResetConfirm(token="invalid_token", new_password="NewStrongPassword123!")

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await confirm_password_reset(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Invalid or expired reset token" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_confirm_password_reset_weak_password(self, mock_db, mock_request, mock_redis):
        """Test password reset confirmation with weak password."""
        data = PasswordResetConfirm(
            token="reset_token_123", new_password="weakpass"  # 8 chars but weak
        )

        mock_code = Mock(spec=VerificationCode)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_code
        mock_db.execute.return_value = mock_result

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 20, "feedback": ["Too short"]},
            ),
        ):

            with pytest.raises(HTTPException) as exc_info:
                await confirm_password_reset(data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Password too weak" in str(exc_info.value.detail["message"])


# ==================== Session Management Tests ====================


class TestSessions:
    """Tests for session management endpoints."""

    @pytest.mark.asyncio
    async def test_list_sessions(self, mock_db, mock_request):
        """Test listing user sessions."""
        mock_session1 = Mock(spec=Session)
        mock_session1.id = "session_1"
        mock_session1.device_name = "Chrome"
        mock_session1.device_type = "desktop"
        mock_session1.ip_address = "127.0.0.1"
        mock_session1.location = None
        mock_session1.last_activity_at = datetime.now(timezone.utc)

        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [mock_session1]
        mock_db.execute.return_value = mock_result

        result = await list_sessions(mock_request, mock_db)

        assert len(result) == 1
        assert result[0].device_name == "Chrome"


# ==================== 2FA Tests ====================


class TestTwoFactorAuth:
    """Tests for 2FA endpoints."""

    @pytest.mark.asyncio
    async def test_request_email_verification(self, mock_db, mock_request):
        """Test email verification request."""
        result = await request_email_verification(mock_request, mock_db)

        assert "Verification email sent" in result["message"]

    @pytest.mark.asyncio
    async def test_enable_2fa(self, mock_db, mock_request):
        """Test enabling 2FA."""
        result = await enable_2fa(mock_request, mock_db)

        assert "secret" in result
        assert "qr_code" in result
        assert "backup_codes" in result

    @pytest.mark.asyncio
    async def test_disable_2fa(self, mock_db, mock_request):
        """Test disabling 2FA."""
        result = await disable_2fa(mock_request, mock_db)

        assert "2FA has been disabled" in result["message"]


# ==================== Helper Function Tests ====================


class TestHelperFunctions:
    """Tests for helper functions."""

    @pytest.mark.asyncio
    async def test_log_audit_event(self, mock_db, mock_request):
        """Test audit logging."""
        from app.auth.routes import log_audit_event

        await log_audit_event(
            mock_db,
            "user_123",
            "test@example.com",
            "login",
            "success",
            mock_request,
            "password",
            {"test": "metadata"},
        )

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_create_session_record(self, mock_db, mock_request):
        """Test session record creation."""
        from app.auth.routes import create_session_record

        with patch(
            "app.auth.routes.parse_user_agent",
            return_value={"device_name": "Chrome", "device_type": "desktop"},
        ):

            session = await create_session_record(
                mock_db,
                "user_123",
                "jti_123",
                mock_request,
                datetime.now(timezone.utc) + timedelta(days=7),
            )

            assert mock_db.add.called
            assert mock_db.commit.called
            assert mock_db.refresh.called


# ==================== Schema Validation Tests ====================


class TestSchemas:
    """Tests for request/response schemas."""

    def test_register_request_validation(self):
        """Test RegisterRequest validation."""
        # Valid request
        data = RegisterRequest(
            email="test@example.com", password="StrongPassword123!", full_name="Test User"
        )
        assert data.email == "test@example.com"

        # Invalid email should raise validation error
        with pytest.raises(Exception):
            RegisterRequest(email="invalid-email", password="StrongPassword123!")

    def test_login_request_validation(self):
        """Test LoginRequest validation."""
        data = LoginRequest(email="test@example.com", password="password123", remember_me=True)
        assert data.remember_me is True

    def test_password_reset_request_validation(self):
        """Test PasswordResetRequest validation."""
        data = PasswordResetRequest(email="test@example.com")
        assert data.email == "test@example.com"

    def test_logout_request_defaults(self):
        """Test LogoutRequest defaults."""
        data = LogoutRequest()
        assert data.everywhere is False

        data = LogoutRequest(everywhere=True)
        assert data.everywhere is True


# ==================== Integration-like Tests ====================


class TestAuthFlows:
    """Integration-like tests for complete auth flows."""

    @pytest.mark.asyncio
    async def test_complete_registration_flow(self, mock_db, mock_request, mock_redis):
        """Test complete registration and verification flow."""
        # Step 1: Register
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        register_data = RegisterRequest(
            email="newuser@example.com", password="StrongPassword123!", full_name="New User"
        )

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 80, "feedback": []},
            ),
            patch("app.auth.routes.check_password_breach", return_value=(False, 0)),
            patch("app.auth.routes.hash_password", return_value="hashed"),
            patch("app.auth.routes.generate_otp", return_value="123456"),
            patch("app.auth.routes.hash_token", return_value="hashed_otp"),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            register_result = await register(register_data, mock_request, mock_db)
            assert register_result.requires_verification is True

        # Step 2: Verify email
        mock_user = Mock(spec=User)
        mock_user.email_verified = False

        mock_code = Mock(spec=VerificationCode)
        mock_result_code = Mock()
        mock_result_code.scalar_one_or_none.return_value = mock_code

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_db.execute.side_effect = [mock_result_code, mock_result_user]

        verify_data = VerifyEmailRequest(email="newuser@example.com", code="123456")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_code"),
        ):

            verify_result = await verify_email(verify_data, mock_request, mock_db)
            assert "Email verified successfully" in verify_result["message"]

    @pytest.mark.asyncio
    async def test_complete_password_reset_flow(
        self, mock_db, mock_request, mock_redis, mock_user, mock_credential
    ):
        """Test complete password reset flow."""
        # Step 1: Request reset
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        request_data = PasswordResetRequest(email="test@example.com")

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
            patch("app.auth.routes.settings") as mock_settings,
        ):

            mock_settings.environment = "test"

            request_result = await request_password_reset(request_data, mock_request, mock_db)
            assert "password reset link" in request_result["message"]

        # Step 2: Confirm reset
        mock_code = Mock(spec=VerificationCode)
        mock_code.user_id = "user_123"
        mock_code.is_used = False

        mock_result_code = Mock()
        mock_result_code.scalar_one_or_none.return_value = mock_code

        mock_result_user = Mock()
        mock_result_user.scalar_one_or_none.return_value = mock_user

        mock_result_cred = Mock()
        mock_result_cred.scalar_one_or_none.return_value = mock_credential

        mock_db.execute.side_effect = [mock_result_code, mock_result_user, mock_result_cred]

        confirm_data = PasswordResetConfirm(
            token="reset_token_123", new_password="NewStrongPassword123!"
        )

        with (
            patch("app.auth.routes.get_redis_service", return_value=mock_redis),
            patch("app.auth.routes.hash_token", return_value="hashed_token"),
            patch(
                "app.auth.routes.calculate_password_strength",
                return_value={"score": 80, "feedback": []},
            ),
            patch("app.auth.routes.hash_password", return_value="new_hashed_password"),
        ):

            confirm_result = await confirm_password_reset(confirm_data, mock_request, mock_db)
            assert "Password has been reset successfully" in confirm_result["message"]
