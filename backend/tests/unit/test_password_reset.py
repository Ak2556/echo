"""
Unit tests for Password Reset functionality.
"""
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    forgot_password,
    reset_password,
    change_password,
    verify_reset_token
)
from app.auth.models import User, Credential, VerificationCode


@pytest.fixture
def mock_db():
    """Mock database session"""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def mock_redis():
    """Mock Redis service"""
    redis = AsyncMock()
    redis.check_rate_limit = AsyncMock(return_value=(True, 2))
    redis.cache_set = AsyncMock()
    redis.cache_get = AsyncMock(return_value=None)
    redis.cache_delete = AsyncMock()
    redis.blacklist_user_tokens = AsyncMock()
    return redis


@pytest.fixture
def mock_request():
    """Mock FastAPI request"""
    request = MagicMock(spec=Request)
    request.client.host = "127.0.0.1"
    request.base_url = "http://test.com/"
    return request


@pytest.fixture
def sample_user():
    """Sample user for testing"""
    return User(
        id=1,
        email="user@test.com",
        full_name="Test User",
        is_locked=False,
        token_version=1
    )


@pytest.fixture
def sample_credential():
    """Sample credential for testing"""
    return Credential(
        id=1,
        user_id=1,
        password_hash="hashed_password",
        password_changed_at=datetime.now(timezone.utc)
    )


class TestForgotPassword:
    """Tests for forgot password endpoint"""

    @pytest.mark.asyncio
    async def test_forgot_password_success(self, mock_db, mock_redis, mock_request, sample_user):
        """Test forgot password with valid email"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                # Mock database query
                mock_result = MagicMock()
                mock_result.scalar_one_or_none.return_value = sample_user
                mock_db.execute.return_value = mock_result
                mock_db.commit = AsyncMock()

                request_data = ForgotPasswordRequest(email="user@test.com")
                result = await forgot_password(request_data, mock_request, mock_db)

                assert "message" in result
                assert "password reset instructions" in result["message"].lower()
                assert mock_db.add.called
                assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_forgot_password_user_not_found(self, mock_db, mock_redis, mock_request):
        """Test forgot password with non-existent email (should still return success)"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                # Mock database query - no user found
                mock_result = MagicMock()
                mock_result.scalar_one_or_none.return_value = None
                mock_db.execute.return_value = mock_result

                request_data = ForgotPasswordRequest(email="nonexistent@test.com")
                result = await forgot_password(request_data, mock_request, mock_db)

                # Should still return success (prevent email enumeration)
                assert "message" in result
                assert "password reset instructions" in result["message"].lower()
                assert not mock_db.add.called

    @pytest.mark.asyncio
    async def test_forgot_password_locked_account(self, mock_db, mock_redis, mock_request):
        """Test forgot password with locked account"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                locked_user = User(
                    id=1,
                    email="locked@test.com",
                    is_locked=True
                )

                mock_result = MagicMock()
                mock_result.scalar_one_or_none.return_value = locked_user
                mock_db.execute.return_value = mock_result

                request_data = ForgotPasswordRequest(email="locked@test.com")
                result = await forgot_password(request_data, mock_request, mock_db)

                # Should still return success (prevent account enumeration)
                assert "message" in result
                assert not mock_db.add.called

    @pytest.mark.asyncio
    async def test_forgot_password_rate_limit(self, mock_db, mock_request):
        """Test forgot password rate limiting"""
        mock_redis = AsyncMock()
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            request_data = ForgotPasswordRequest(email="user@test.com")

            with pytest.raises(HTTPException) as exc_info:
                await forgot_password(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 429
            assert "too many" in exc_info.value.detail.lower()


class TestResetPassword:
    """Tests for reset password endpoint"""

    @pytest.mark.asyncio
    async def test_reset_password_success(self, mock_db, mock_redis, mock_request, sample_user, sample_credential):
        """Test password reset with valid token"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                with patch('app.auth.password_reset.calculate_password_strength', return_value={"score": 80}):
                    with patch('app.auth.password_reset.check_password_breach', new_callable=AsyncMock, return_value=(False, 0)):
                        with patch('app.auth.password_reset.hash_password', return_value="new_hashed_password"):
                            # Mock verification code
                            verification_code = VerificationCode(
                                id=1,
                                user_id=1,
                                code_hash="token_hash",
                                purpose="password_reset",
                                is_used=False,
                                expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
                            )

                            # Mock database queries
                            mock_code_result = MagicMock()
                            mock_code_result.scalar_one_or_none.return_value = verification_code

                            mock_user_result = MagicMock()
                            mock_user_result.scalar_one_or_none.return_value = sample_user

                            mock_cred_result = MagicMock()
                            mock_cred_result.scalar_one_or_none.return_value = sample_credential

                            mock_db.execute.side_effect = [mock_code_result, mock_user_result, mock_cred_result]
                            mock_db.commit = AsyncMock()

                            request_data = ResetPasswordRequest(
                                token="valid_token",
                                new_password="NewSecurePassword123!"
                            )

                            result = await reset_password(request_data, mock_request, mock_db)

                            assert "message" in result
                            assert "successful" in result["message"].lower()
                            assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_reset_password_invalid_token(self, mock_db, mock_redis, mock_request):
        """Test password reset with invalid token"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                # Mock database query - no token found
                mock_result = MagicMock()
                mock_result.scalar_one_or_none.return_value = None
                mock_db.execute.return_value = mock_result

                request_data = ResetPasswordRequest(
                    token="invalid_token",
                    new_password="NewPassword123!"
                )

                with pytest.raises(HTTPException) as exc_info:
                    await reset_password(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 400
                assert "invalid" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_reset_password_weak_password(self, mock_db, mock_redis, mock_request):
        """Test password reset with weak password"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.calculate_password_strength', return_value={"score": 20}):
                # Mock valid token
                verification_code = VerificationCode(
                    id=1,
                    user_id=1,
                    code_hash="token_hash",
                    purpose="password_reset",
                    is_used=False,
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
                )

                mock_result = MagicMock()
                mock_result.scalar_one_or_none.return_value = verification_code
                mock_db.execute.return_value = mock_result

                request_data = ResetPasswordRequest(
                    token="valid_token",
                    new_password="weak"
                )

                with pytest.raises(HTTPException) as exc_info:
                    await reset_password(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 400
                assert "weak" in str(exc_info.value.detail).lower()

    @pytest.mark.asyncio
    async def test_reset_password_breached_password(self, mock_db, mock_redis, mock_request):
        """Test password reset with breached password"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.password_reset.calculate_password_strength', return_value={"score": 80}):
                with patch('app.auth.password_reset.check_password_breach', new_callable=AsyncMock, return_value=(True, 500)):
                    # Mock valid token
                    verification_code = VerificationCode(
                        id=1,
                        user_id=1,
                        code_hash="token_hash",
                        purpose="password_reset",
                        is_used=False,
                        expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
                    )

                    mock_result = MagicMock()
                    mock_result.scalar_one_or_none.return_value = verification_code
                    mock_db.execute.return_value = mock_result

                    request_data = ResetPasswordRequest(
                        token="valid_token",
                        new_password="BreachedPassword123!"
                    )

                    with pytest.raises(HTTPException) as exc_info:
                        await reset_password(request_data, mock_request, mock_db)

                    assert exc_info.value.status_code == 400
                    assert "breach" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_reset_password_rate_limit(self, mock_db, mock_request):
        """Test password reset rate limiting"""
        mock_redis = AsyncMock()
        mock_redis.cache_get = AsyncMock(return_value=None)

        verification_code = VerificationCode(
            id=1,
            user_id=1,
            code_hash="token_hash",
            purpose="password_reset",
            is_used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = verification_code
        mock_db.execute.return_value = mock_result

        # Rate limit exceeded
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            request_data = ResetPasswordRequest(
                token="valid_token",
                new_password="NewPassword123!"
            )

            with pytest.raises(HTTPException) as exc_info:
                await reset_password(request_data, mock_request, mock_db)

            assert exc_info.value.status_code == 429


class TestChangePassword:
    """Tests for change password endpoint"""

    @pytest.mark.asyncio
    async def test_change_password_success(self, mock_db, mock_redis, mock_request, sample_user, sample_credential):
        """Test changing password successfully"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.totp_routes.get_current_user_from_token', new_callable=AsyncMock, return_value=sample_user):
                with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                    with patch('app.auth.password_reset.verify_password', return_value=True):
                        with patch('app.auth.password_reset.calculate_password_strength', return_value={"score": 80}):
                            with patch('app.auth.password_reset.check_password_breach', new_callable=AsyncMock, return_value=(False, 0)):
                                with patch('app.auth.password_reset.hash_password', return_value="new_hashed_password"):
                                    mock_cred_result = MagicMock()
                                    mock_cred_result.scalar_one_or_none.return_value = sample_credential
                                    mock_db.execute.return_value = mock_cred_result
                                    mock_db.commit = AsyncMock()

                                    request_data = ChangePasswordRequest(
                                        current_password="CurrentPassword123!",
                                        new_password="NewPassword456!"
                                    )

                                    result = await change_password(request_data, mock_request, mock_db)

                                    assert "message" in result
                                    assert "successful" in result["message"].lower()
                                    assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_change_password_invalid_current(self, mock_db, mock_redis, mock_request, sample_user, sample_credential):
        """Test changing password with invalid current password"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.totp_routes.get_current_user_from_token', new_callable=AsyncMock, return_value=sample_user):
                with patch('app.auth.password_reset.log_audit_event', new_callable=AsyncMock):
                    with patch('app.auth.password_reset.verify_password', return_value=False):
                        mock_cred_result = MagicMock()
                        mock_cred_result.scalar_one_or_none.return_value = sample_credential
                        mock_db.execute.return_value = mock_cred_result

                        request_data = ChangePasswordRequest(
                            current_password="WrongPassword",
                            new_password="NewPassword456!"
                        )

                        with pytest.raises(HTTPException) as exc_info:
                            await change_password(request_data, mock_request, mock_db)

                        assert exc_info.value.status_code == 401
                        assert "invalid" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_change_password_same_as_current(self, mock_db, mock_redis, mock_request, sample_user, sample_credential):
        """Test changing password to same password"""
        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.totp_routes.get_current_user_from_token', new_callable=AsyncMock, return_value=sample_user):
                with patch('app.auth.password_reset.verify_password', return_value=True):
                    mock_cred_result = MagicMock()
                    mock_cred_result.scalar_one_or_none.return_value = sample_credential
                    mock_db.execute.return_value = mock_cred_result

                    request_data = ChangePasswordRequest(
                        current_password="SamePassword123!",
                        new_password="SamePassword123!"
                    )

                    with pytest.raises(HTTPException) as exc_info:
                        await change_password(request_data, mock_request, mock_db)

                    assert exc_info.value.status_code == 400
                    assert "different" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_change_password_rate_limit(self, mock_db, mock_request, sample_user):
        """Test change password rate limiting"""
        mock_redis = AsyncMock()
        mock_redis.check_rate_limit = AsyncMock(return_value=(False, 0))

        with patch('app.auth.password_reset.get_redis_service', return_value=mock_redis):
            with patch('app.auth.totp_routes.get_current_user_from_token', new_callable=AsyncMock, return_value=sample_user):
                request_data = ChangePasswordRequest(
                    current_password="CurrentPassword123!",
                    new_password="NewPassword456!"
                )

                with pytest.raises(HTTPException) as exc_info:
                    await change_password(request_data, mock_request, mock_db)

                assert exc_info.value.status_code == 429


class TestVerifyResetToken:
    """Tests for verify reset token endpoint"""

    @pytest.mark.asyncio
    async def test_verify_reset_token_valid(self, mock_db):
        """Test verifying a valid reset token"""
        verification_code = VerificationCode(
            id=1,
            email="user@test.com",
            code_hash="token_hash",
            purpose="password_reset",
            is_used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = verification_code
        mock_db.execute.return_value = mock_result

        with patch('app.auth.password_reset.hash_token', return_value="token_hash"):
            result = await verify_reset_token("valid_token", mock_db)

            assert result["valid"] is True
            assert result["email"] == "user@test.com"
            assert "expires_in" in result
            assert result["expires_in"] > 0

    @pytest.mark.asyncio
    async def test_verify_reset_token_invalid(self, mock_db):
        """Test verifying an invalid reset token"""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with patch('app.auth.password_reset.hash_token', return_value="invalid_hash"):
            result = await verify_reset_token("invalid_token", mock_db)

            assert result["valid"] is False
            assert "message" in result

    @pytest.mark.asyncio
    async def test_verify_reset_token_expired(self, mock_db):
        """Test verifying an expired reset token"""
        # Token expired 1 hour ago
        verification_code = VerificationCode(
            id=1,
            email="user@test.com",
            code_hash="token_hash",
            purpose="password_reset",
            is_used=False,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1)
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None  # Query filters out expired
        mock_db.execute.return_value = mock_result

        with patch('app.auth.password_reset.hash_token', return_value="token_hash"):
            result = await verify_reset_token("expired_token", mock_db)

            assert result["valid"] is False
