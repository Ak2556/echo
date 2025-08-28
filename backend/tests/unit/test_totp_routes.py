"""
Comprehensive unit tests for TOTP (2FA) routes.
Tests setup, verification, login, disable, and backup code functionality.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request

from app.auth.totp_routes import (
    setup_2fa,
    verify_2fa_setup,
    verify_2fa_login,
    disable_2fa,
    regenerate_backup_codes,
    get_2fa_status,
    get_current_user_from_token,
    Setup2FAResponse,
    Verify2FASetupRequest,
    Verify2FALoginRequest,
    Disable2FARequest,
    RegenerateBackupCodesRequest,
)
from app.auth.models import User, Credential, RefreshToken, Session


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
    request.headers = {
        "authorization": "Bearer test_token_123",
        "user-agent": "Mozilla/5.0 (Test Browser)"
    }
    return request


@pytest.fixture
def mock_request_no_auth():
    """Mock FastAPI request without authorization."""
    request = Mock(spec=Request)
    request.client = Mock()
    request.client.host = "127.0.0.1"
    request.headers = {"user-agent": "Mozilla/5.0 (Test Browser)"}
    return request


@pytest.fixture
def mock_redis():
    """Mock Redis service."""
    redis = AsyncMock()
    redis.cache_set = AsyncMock()
    redis.cache_get = AsyncMock()
    redis.cache_delete = AsyncMock()
    return redis


@pytest.fixture
def mock_user():
    """Create a mock user."""
    user = User(
        id="user_123",
        email="test@example.com",
        full_name="Test User",
        avatar_url="https://example.com/avatar.png",
        totp_enabled=False,
        totp_secret=None,
        backup_codes=[],
        token_version=1,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    return user


@pytest.fixture
def mock_user_with_2fa():
    """Create a mock user with 2FA enabled."""
    user = User(
        id="user_123",
        email="test@example.com",
        full_name="Test User",
        avatar_url="https://example.com/avatar.png",
        totp_enabled=True,
        totp_secret="encrypted_secret_abc123",
        backup_codes=["BACKUP1", "BACKUP2", "BACKUP3", "BACKUP4", "BACKUP5"],
        token_version=1,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    return user


@pytest.fixture
def mock_credential():
    """Create a mock credential."""
    credential = Credential(
        id="cred_123",
        user_id="user_123",
        password_hash="$argon2id$v=19$m=65536,t=2,p=2$test_hash",
    )
    return credential


# ==================== Test get_current_user_from_token ====================


class TestGetCurrentUserFromToken:
    """Test the helper function for extracting user from token."""

    @pytest.mark.asyncio
    async def test_missing_authorization_header(self, mock_request_no_auth, mock_db):
        """Test missing authorization header."""
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_from_token(mock_request_no_auth, mock_db)

        assert exc_info.value.status_code == 401
        assert "Missing authorization token" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_invalid_authorization_format(self, mock_db):
        """Test invalid authorization header format."""
        request = Mock(spec=Request)
        request.headers = {"authorization": "InvalidFormat token123"}

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_from_token(request, mock_db)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_invalid_token(self, mock_request, mock_db):
        """Test invalid JWT token."""
        with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt:
            mock_jwt_manager = Mock()
            mock_jwt_manager.verify_token.side_effect = ValueError("Invalid token")
            mock_jwt.return_value = mock_jwt_manager

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user_from_token(mock_request, mock_db)

            assert exc_info.value.status_code == 401
            assert "Invalid token" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_user_not_found(self, mock_request, mock_db):
        """Test when user is not found in database."""
        with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt:
            mock_jwt_manager = Mock()
            mock_jwt_manager.verify_token.return_value = {"sub": "nonexistent_user"}
            mock_jwt.return_value = mock_jwt_manager

            # Mock database query returning None
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute.return_value = mock_result

            with pytest.raises(HTTPException) as exc_info:
                await get_current_user_from_token(mock_request, mock_db)

            assert exc_info.value.status_code == 404
            assert "User not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_success(self, mock_request, mock_db, mock_user):
        """Test successful user extraction from token."""
        with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt:
            mock_jwt_manager = Mock()
            mock_jwt_manager.verify_token.return_value = {"sub": "user_123"}
            mock_jwt.return_value = mock_jwt_manager

            # Mock database query returning user
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute.return_value = mock_result

            user = await get_current_user_from_token(mock_request, mock_db)

            assert user.id == "user_123"
            assert user.email == "test@example.com"


# ==================== Test setup_2fa ====================


class TestSetup2FA:
    """Test 2FA setup endpoint."""

    @pytest.mark.asyncio
    async def test_setup_2fa_already_enabled(self, mock_request, mock_db, mock_user_with_2fa):
        """Test setup fails when 2FA is already enabled."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
                mock_redis = AsyncMock()
                mock_get_redis.return_value = mock_redis

                with pytest.raises(HTTPException) as exc_info:
                    await setup_2fa(mock_request, mock_db)

                assert exc_info.value.status_code == 400
                assert "already enabled" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_setup_2fa_success(self, mock_request, mock_db, mock_user):
        """Test successful 2FA setup."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
                mock_redis = AsyncMock()
                mock_redis.cache_set = AsyncMock()
                mock_get_redis.return_value = mock_redis

                with patch("app.auth.totp_routes.generate_totp_secret") as mock_gen_secret:
                    mock_gen_secret.return_value = "JBSWY3DPEHPK3PXP"

                    with patch("app.auth.totp_routes.get_totp_provisioning_uri") as mock_uri:
                        mock_uri.return_value = "otpauth://totp/Echo:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Echo"

                        with patch("app.auth.totp_routes.generate_qr_code") as mock_qr:
                            mock_qr.return_value = "data:image/png;base64,iVBORw0KGgoAAAANS"

                            with patch("app.auth.totp_routes.generate_backup_codes") as mock_backup:
                                mock_backup.return_value = ["CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10"]

                                response = await setup_2fa(mock_request, mock_db)

                                # Verify response structure
                                assert response.secret == "JBSWY3DPEHPK3PXP"
                                assert response.qr_code.startswith("data:image/png;base64")
                                assert "otpauth://" in response.provisioning_uri
                                assert len(response.backup_codes) == 10
                                assert "Scan QR code" in response.message

                                # Verify Redis cache was set
                                mock_redis.cache_set.assert_called_once()
                                call_args = mock_redis.cache_set.call_args
                                assert call_args[0][0] == f"totp_setup:{mock_user.id}"
                                assert "secret" in call_args[0][1]
                                assert "backup_codes" in call_args[0][1]
                                assert call_args[1]["expires_in_seconds"] == 600


# ==================== Test verify_2fa_setup ====================


class TestVerify2FASetup:
    """Test 2FA setup verification endpoint."""

    @pytest.mark.asyncio
    async def test_verify_setup_no_pending_setup(self, mock_request, mock_db, mock_user):
        """Test verification fails when no pending setup exists."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
                mock_redis = AsyncMock()
                mock_redis.cache_get = AsyncMock(return_value=None)
                mock_get_redis.return_value = mock_redis

                request_data = Verify2FASetupRequest(code="123456")

                with pytest.raises(HTTPException) as exc_info:
                    await verify_2fa_setup(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 400
                assert "No pending 2FA setup" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_verify_setup_invalid_code(self, mock_request, mock_db, mock_user):
        """Test verification fails with invalid TOTP code."""
        setup_data = {
            "secret": "JBSWY3DPEHPK3PXP",
            "backup_codes": ["CODE1", "CODE2", "CODE3"]
        }

        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
                mock_redis = AsyncMock()
                mock_redis.cache_get = AsyncMock(return_value=setup_data)
                mock_get_redis.return_value = mock_redis

                with patch("app.auth.totp_routes.verify_totp") as mock_verify:
                    mock_verify.return_value = False

                    request_data = Verify2FASetupRequest(code="999999")

                    with pytest.raises(HTTPException) as exc_info:
                        await verify_2fa_setup(request_data, mock_request, mock_db)

                    assert exc_info.value.status_code == 400
                    assert "Invalid verification code" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_verify_setup_success(self, mock_request, mock_db, mock_user):
        """Test successful 2FA setup verification."""
        setup_data = {
            "secret": "JBSWY3DPEHPK3PXP",
            "backup_codes": ["CODE1", "CODE2", "CODE3", "CODE4", "CODE5"]
        }

        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
                mock_redis = AsyncMock()
                mock_redis.cache_get = AsyncMock(return_value=setup_data)
                mock_redis.cache_delete = AsyncMock()
                mock_get_redis.return_value = mock_redis

                with patch("app.auth.totp_routes.verify_totp") as mock_verify:
                    mock_verify.return_value = True

                    with patch("app.auth.totp_routes.encrypt_totp_secret") as mock_encrypt:
                        mock_encrypt.return_value = "encrypted_secret"

                        with patch("app.auth.totp_routes.log_audit_event") as mock_audit:
                            mock_audit.return_value = AsyncMock()

                            request_data = Verify2FASetupRequest(code="123456")

                            response = await verify_2fa_setup(request_data, mock_request, mock_db)

                            # Verify user was updated
                            assert mock_user.totp_enabled is True
                            assert mock_user.totp_secret == "encrypted_secret"
                            assert mock_user.backup_codes == setup_data["backup_codes"]

                            # Verify database commit
                            mock_db.commit.assert_called_once()

                            # Verify Redis cache was cleared
                            mock_redis.cache_delete.assert_called_once_with(f"totp_setup:{mock_user.id}")

                            # Verify audit log
                            mock_audit.assert_called_once()

                            # Verify response
                            assert "successfully" in response["message"]
                            assert response["backup_codes"] == setup_data["backup_codes"]


# ==================== Test verify_2fa_login ====================


class TestVerify2FALogin:
    """Test 2FA login verification endpoint."""

    @pytest.mark.asyncio
    async def test_verify_login_invalid_temp_token(self, mock_request, mock_db):
        """Test verification fails with invalid temp token."""
        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=None)
            mock_get_redis.return_value = mock_redis

            request_data = Verify2FALoginRequest(
                temp_token="invalid_token",
                code="123456",
                trust_device=False
            )

            with pytest.raises(HTTPException) as exc_info:
                await verify_2fa_login(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Invalid or expired 2FA session" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_verify_login_user_not_found(self, mock_request, mock_db):
        """Test verification fails when user not found."""
        pending_data = {"user_id": "nonexistent_user"}

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_get_redis.return_value = mock_redis

            # Mock database query returning None
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute.return_value = mock_result

            request_data = Verify2FALoginRequest(
                temp_token="temp_token_123",
                code="123456",
                trust_device=False
            )

            with pytest.raises(HTTPException) as exc_info:
                await verify_2fa_login(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "Invalid 2FA session" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_verify_login_2fa_not_enabled(self, mock_request, mock_db, mock_user):
        """Test verification fails when 2FA is not enabled for user."""
        pending_data = {"user_id": "user_123"}

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_get_redis.return_value = mock_redis

            # Mock database query returning user without 2FA
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user
            mock_db.execute.return_value = mock_result

            request_data = Verify2FALoginRequest(
                temp_token="temp_token_123",
                code="123456",
                trust_device=False
            )

            with pytest.raises(HTTPException) as exc_info:
                await verify_2fa_login(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_verify_login_invalid_code(self, mock_request, mock_db, mock_user_with_2fa):
        """Test verification fails with invalid TOTP code and backup code."""
        pending_data = {"user_id": "user_123"}

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_get_redis.return_value = mock_redis

            # Mock database query returning user with 2FA
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user_with_2fa
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                    mock_verify_totp.return_value = False

                    with patch("app.auth.totp_routes.verify_backup_code") as mock_verify_backup:
                        mock_verify_backup.return_value = (False, mock_user_with_2fa.backup_codes)

                        request_data = Verify2FALoginRequest(
                            temp_token="temp_token_123",
                            code="999999",
                            trust_device=False
                        )

                        with pytest.raises(HTTPException) as exc_info:
                            await verify_2fa_login(request_data, mock_request, mock_db)

                        assert exc_info.value.status_code == 400
                        assert "Invalid 2FA code" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_verify_login_success_with_totp(self, mock_request, mock_db, mock_user_with_2fa):
        """Test successful login verification with TOTP code."""
        pending_data = {"user_id": "user_123"}

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_redis.cache_delete = AsyncMock()
            mock_get_redis.return_value = mock_redis

            # Mock database query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user_with_2fa
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                    mock_verify_totp.return_value = True

                    with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt_mgr:
                        mock_jwt_manager = Mock()
                        mock_jwt_manager.create_access_token.return_value = "access_token_123"
                        mock_jwt_manager.create_refresh_token.return_value = ("refresh_token_123", "jti_123")
                        mock_jwt_mgr.return_value = mock_jwt_manager

                        with patch("app.auth.security.generate_device_fingerprint") as mock_fp:
                            mock_fp.return_value = "device_fp_123"

                            with patch("app.auth.routes.create_session_record", new=AsyncMock()) as mock_session:

                                with patch("app.auth.totp_routes.log_audit_event", new=AsyncMock()) as mock_audit:

                                    request_data = Verify2FALoginRequest(
                                        temp_token="temp_token_123",
                                        code="123456",
                                        trust_device=False
                                    )

                                    response = await verify_2fa_login(request_data, mock_request, mock_db)

                                    # Verify tokens were created
                                    assert response["access_token"] == "access_token_123"
                                    assert response["refresh_token"] == "refresh_token_123"
                                    assert response["token_type"] == "bearer"
                                    assert response["expires_in"] == 900

                                    # Verify user info
                                    assert response["user"]["id"] == mock_user_with_2fa.id
                                    assert response["user"]["email"] == mock_user_with_2fa.email

                                    # Verify Redis cache was cleared
                                    mock_redis.cache_delete.assert_called_once()

                                    # Verify database commit
                                    mock_db.commit.assert_called()

                                    # Verify audit log
                                    mock_audit.assert_called_once()

    @pytest.mark.asyncio
    async def test_verify_login_success_with_backup_code(self, mock_request, mock_db, mock_user_with_2fa):
        """Test successful login verification with backup code."""
        pending_data = {"user_id": "user_123"}
        remaining_codes = ["BACKUP2", "BACKUP3", "BACKUP4", "BACKUP5"]

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_redis.cache_delete = AsyncMock()
            mock_get_redis.return_value = mock_redis

            # Mock database query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user_with_2fa
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                    mock_verify_totp.return_value = False  # TOTP fails

                    with patch("app.auth.totp_routes.verify_backup_code") as mock_verify_backup:
                        mock_verify_backup.return_value = (True, remaining_codes)  # Backup code succeeds

                        with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt_mgr:
                            mock_jwt_manager = Mock()
                            mock_jwt_manager.create_access_token.return_value = "access_token_123"
                            mock_jwt_manager.create_refresh_token.return_value = ("refresh_token_123", "jti_123")
                            mock_jwt_mgr.return_value = mock_jwt_manager

                            with patch("app.auth.security.generate_device_fingerprint") as mock_fp:
                                mock_fp.return_value = "device_fp_123"

                                with patch("app.auth.routes.create_session_record", new=AsyncMock()) as mock_session:

                                    with patch("app.auth.totp_routes.log_audit_event", new=AsyncMock()) as mock_audit:

                                        request_data = Verify2FALoginRequest(
                                            temp_token="temp_token_123",
                                            code="BACKUP1",
                                            trust_device=False
                                        )

                                        response = await verify_2fa_login(request_data, mock_request, mock_db)

                                        # Verify backup codes were updated
                                        assert mock_user_with_2fa.backup_codes == remaining_codes

                                        # Verify tokens were created
                                        assert response["access_token"] == "access_token_123"
                                        assert response["refresh_token"] == "refresh_token_123"

    @pytest.mark.asyncio
    async def test_verify_login_backup_code_low_warning(self, mock_request, mock_db, mock_user_with_2fa):
        """Test warning is logged when backup codes are running low."""
        pending_data = {"user_id": "user_123"}
        remaining_codes = ["BACKUP5"]  # Only 1 code remaining

        with patch("app.auth.totp_routes.get_redis_service") as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.cache_get = AsyncMock(return_value=pending_data)
            mock_redis.cache_delete = AsyncMock()
            mock_get_redis.return_value = mock_redis

            # Mock database query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_user_with_2fa
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                    mock_verify_totp.return_value = False

                    with patch("app.auth.totp_routes.verify_backup_code") as mock_verify_backup:
                        mock_verify_backup.return_value = (True, remaining_codes)

                        with patch("app.auth.jwt_utils.get_jwt_manager") as mock_jwt_mgr:
                            mock_jwt_manager = Mock()
                            mock_jwt_manager.create_access_token.return_value = "access_token"
                            mock_jwt_manager.create_refresh_token.return_value = ("refresh_token", "jti")
                            mock_jwt_mgr.return_value = mock_jwt_manager

                            with patch("app.auth.security.generate_device_fingerprint"):
                                with patch("app.auth.routes.create_session_record", new=AsyncMock()) as mock_session:

                                    with patch("app.auth.totp_routes.log_audit_event", new=AsyncMock()) as mock_audit:

                                        with patch("app.auth.totp_routes.logger") as mock_logger:
                                            request_data = Verify2FALoginRequest(
                                                temp_token="temp_token_123",
                                                code="BACKUP4",
                                                trust_device=False
                                            )

                                            response = await verify_2fa_login(request_data, mock_request, mock_db)

                                            # Verify warning was logged
                                            mock_logger.warning.assert_called()
                                            warning_call = mock_logger.warning.call_args
                                            assert "Low backup codes" in warning_call[0][0]


# ==================== Test disable_2fa ====================


class TestDisable2FA:
    """Test 2FA disable endpoint."""

    @pytest.mark.asyncio
    async def test_disable_2fa_not_enabled(self, mock_request, mock_db, mock_user):
        """Test disable fails when 2FA is not enabled."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            request_data = Disable2FARequest(password="password123")

            with pytest.raises(HTTPException) as exc_info:
                await disable_2fa(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "2FA is not enabled" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_disable_2fa_invalid_password(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test disable fails with invalid password."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify:
                mock_verify.return_value = False

                request_data = Disable2FARequest(password="wrongpassword")

                with pytest.raises(HTTPException) as exc_info:
                    await disable_2fa(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 401
                assert "Invalid password" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_disable_2fa_no_credential(self, mock_request, mock_db, mock_user_with_2fa):
        """Test disable fails when no credential found."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query returning None
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute.return_value = mock_result

            request_data = Disable2FARequest(password="password123")

            with pytest.raises(HTTPException) as exc_info:
                await disable_2fa(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_disable_2fa_with_invalid_totp_code(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test disable fails with invalid TOTP code."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify_pwd:
                mock_verify_pwd.return_value = True

                with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                    mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                    with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                        mock_verify_totp.return_value = False

                        with patch("app.auth.totp_routes.verify_backup_code") as mock_verify_backup:
                            mock_verify_backup.return_value = (False, mock_user_with_2fa.backup_codes)

                            request_data = Disable2FARequest(password="password123", code="999999")

                            with pytest.raises(HTTPException) as exc_info:
                                await disable_2fa(request_data, mock_request, mock_db)

                            assert exc_info.value.status_code == 400
                            assert "Invalid 2FA code" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_disable_2fa_success_with_password_only(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test successful disable with password only (no code)."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify:
                mock_verify.return_value = True

                with patch("app.auth.totp_routes.log_audit_event") as mock_audit:
                    mock_audit.return_value = AsyncMock()

                    request_data = Disable2FARequest(password="password123", code=None)

                    response = await disable_2fa(request_data, mock_request, mock_db)

                    # Verify 2FA was disabled
                    assert mock_user_with_2fa.totp_enabled is False
                    assert mock_user_with_2fa.totp_secret is None
                    assert mock_user_with_2fa.backup_codes == []

                    # Verify database commit
                    mock_db.commit.assert_called_once()

                    # Verify audit log
                    mock_audit.assert_called_once()

                    # Verify response
                    assert "disabled successfully" in response["message"]

    @pytest.mark.asyncio
    async def test_disable_2fa_success_with_totp_code(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test successful disable with password and valid TOTP code."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify_pwd:
                mock_verify_pwd.return_value = True

                with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                    mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                    with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                        mock_verify_totp.return_value = True

                        with patch("app.auth.totp_routes.log_audit_event") as mock_audit:
                            mock_audit.return_value = AsyncMock()

                            request_data = Disable2FARequest(password="password123", code="123456")

                            response = await disable_2fa(request_data, mock_request, mock_db)

                            # Verify 2FA was disabled
                            assert mock_user_with_2fa.totp_enabled is False
                            assert mock_user_with_2fa.totp_secret is None
                            assert mock_user_with_2fa.backup_codes == []

                            # Verify response
                            assert "disabled successfully" in response["message"]

    @pytest.mark.asyncio
    async def test_disable_2fa_success_with_backup_code(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test successful disable with password and valid backup code."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify_pwd:
                mock_verify_pwd.return_value = True

                with patch("app.auth.totp_routes.decrypt_totp_secret") as mock_decrypt:
                    mock_decrypt.return_value = "JBSWY3DPEHPK3PXP"

                    with patch("app.auth.totp_routes.verify_totp") as mock_verify_totp:
                        mock_verify_totp.return_value = False

                        with patch("app.auth.totp_routes.verify_backup_code") as mock_verify_backup:
                            mock_verify_backup.return_value = (True, ["CODE2", "CODE3"])

                            with patch("app.auth.totp_routes.log_audit_event") as mock_audit:
                                mock_audit.return_value = AsyncMock()

                                request_data = Disable2FARequest(password="password123", code="CODE1")

                                response = await disable_2fa(request_data, mock_request, mock_db)

                                # Verify 2FA was disabled
                                assert mock_user_with_2fa.totp_enabled is False

                                # Verify response
                                assert "disabled successfully" in response["message"]


# ==================== Test regenerate_backup_codes ====================


class TestRegenerateBackupCodes:
    """Test backup codes regeneration endpoint."""

    @pytest.mark.asyncio
    async def test_regenerate_2fa_not_enabled(self, mock_request, mock_db, mock_user):
        """Test regenerate fails when 2FA is not enabled."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            request_data = RegenerateBackupCodesRequest(password="password123")

            with pytest.raises(HTTPException) as exc_info:
                await regenerate_backup_codes(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 400
            assert "2FA is not enabled" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_regenerate_invalid_password(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test regenerate fails with invalid password."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify:
                mock_verify.return_value = False

                request_data = RegenerateBackupCodesRequest(password="wrongpassword")

                with pytest.raises(HTTPException) as exc_info:
                    await regenerate_backup_codes(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 401
                assert "Invalid password" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_regenerate_no_credential(self, mock_request, mock_db, mock_user_with_2fa):
        """Test regenerate fails when no credential found."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query returning None
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_db.execute.return_value = mock_result

            request_data = RegenerateBackupCodesRequest(password="password123")

            with pytest.raises(HTTPException) as exc_info:
                await regenerate_backup_codes(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_regenerate_success(self, mock_request, mock_db, mock_user_with_2fa, mock_credential):
        """Test successful backup codes regeneration."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            # Mock credential query
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = mock_credential
            mock_db.execute.return_value = mock_result

            with patch("app.auth.totp_routes.verify_password") as mock_verify:
                mock_verify.return_value = True

                with patch("app.auth.totp_routes.generate_backup_codes") as mock_gen_codes:
                    new_codes = ["NEW1", "NEW2", "NEW3", "NEW4", "NEW5", "NEW6", "NEW7", "NEW8", "NEW9", "NEW10"]
                    mock_gen_codes.return_value = new_codes

                    with patch("app.auth.totp_routes.log_audit_event") as mock_audit:
                        mock_audit.return_value = AsyncMock()

                        request_data = RegenerateBackupCodesRequest(password="password123")

                        response = await regenerate_backup_codes(request_data, mock_request, mock_db)

                        # Verify backup codes were updated
                        assert mock_user_with_2fa.backup_codes == new_codes

                        # Verify database commit
                        mock_db.commit.assert_called_once()

                        # Verify audit log
                        mock_audit.assert_called_once()

                        # Verify response
                        assert "regenerated successfully" in response["message"]
                        assert response["backup_codes"] == new_codes
                        assert len(response["backup_codes"]) == 10


# ==================== Test get_2fa_status ====================


class TestGet2FAStatus:
    """Test 2FA status endpoint."""

    @pytest.mark.asyncio
    async def test_status_2fa_disabled(self, mock_request, mock_db, mock_user):
        """Test status when 2FA is disabled."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user

            response = await get_2fa_status(mock_request, mock_db)

            assert response["enabled"] is False
            assert response["backup_codes_remaining"] == 0

    @pytest.mark.asyncio
    async def test_status_2fa_enabled(self, mock_request, mock_db, mock_user_with_2fa):
        """Test status when 2FA is enabled."""
        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            response = await get_2fa_status(mock_request, mock_db)

            assert response["enabled"] is True
            assert response["backup_codes_remaining"] == 5

    @pytest.mark.asyncio
    async def test_status_2fa_enabled_no_backup_codes(self, mock_request, mock_db, mock_user_with_2fa):
        """Test status when 2FA is enabled but no backup codes remain."""
        mock_user_with_2fa.backup_codes = []

        with patch("app.auth.totp_routes.get_current_user_from_token") as mock_get_user:
            mock_get_user.return_value = mock_user_with_2fa

            response = await get_2fa_status(mock_request, mock_db)

            assert response["enabled"] is True
            assert response["backup_codes_remaining"] == 0
