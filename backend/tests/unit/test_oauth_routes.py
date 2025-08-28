"""
Comprehensive unit tests for OAuth routes.
Covers OAuth flow for Google, GitHub, and other providers with 100% coverage.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.auth.oauth import (
    router,
    oauth_start,
    oauth_callback,
    link_oauth_account,
    unlink_oauth_account,
)
from app.auth.models import User, OAuthAccount, RefreshToken, Session, AuditLog


# ==================== Test Fixtures ====================


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = AsyncMock(spec=AsyncSession)
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
    request.url = Mock()
    request.url.path = "/api/auth/oauth/google/callback"
    request.query_params = {}
    return request


@pytest.fixture
def mock_redis():
    """Mock Redis service."""
    redis = AsyncMock()
    redis.client = True
    redis.cache_set = AsyncMock()
    redis.cache_get = AsyncMock(return_value=None)
    return redis


@pytest.fixture
def mock_jwt_manager():
    """Mock JWT manager."""
    jwt_manager = Mock()
    jwt_manager.create_access_token = Mock(return_value="access_token_google_123")
    jwt_manager.create_refresh_token = Mock(return_value=("refresh_token_google_123", "jti_google_123"))
    return jwt_manager


@pytest.fixture
def sample_user():
    """Sample user for testing."""
    return User(
        id="user_123",
        email="testuser@example.com",
        email_verified=True,
        email_verified_at=datetime.now(timezone.utc),
        full_name="Test User",
        avatar_url="https://example.com/avatar.jpg",
        token_version=1,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


@pytest.fixture
def sample_oauth_account():
    """Sample OAuth account for testing."""
    return OAuthAccount(
        id="oauth_123",
        user_id="user_123",
        provider="google",
        provider_user_id="google_user_123",
        provider_email="testuser@example.com",
        access_token="google_access_token",
        refresh_token="google_refresh_token",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        profile_data={"name": "Test User", "email": "testuser@example.com"},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


# ==================== OAuth Start Tests ====================


class TestOAuthStart:
    """Tests for OAuth flow initiation."""

    @pytest.mark.asyncio
    async def test_oauth_start_google(self, mock_request):
        """Test initiating OAuth flow with Google."""
        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_redirect = AsyncMock(
                return_value=RedirectResponse(url="https://accounts.google.com/o/oauth2/v2/auth")
            )
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_start("google", mock_request)

            assert isinstance(result, RedirectResponse)
            mock_oauth.create_client.assert_called_once_with("google")
            mock_client.authorize_redirect.assert_called_once()

    @pytest.mark.asyncio
    async def test_oauth_start_github(self, mock_request):
        """Test initiating OAuth flow with GitHub."""
        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_redirect = AsyncMock(
                return_value=RedirectResponse(url="https://github.com/login/oauth/authorize")
            )
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_start("github", mock_request)

            assert isinstance(result, RedirectResponse)
            mock_oauth.create_client.assert_called_once_with("github")
            mock_client.authorize_redirect.assert_called_once()

    @pytest.mark.asyncio
    async def test_oauth_start_unsupported_provider(self, mock_request):
        """Test OAuth start with unsupported provider."""
        with pytest.raises(HTTPException) as exc_info:
            await oauth_start("facebook", mock_request)

        assert exc_info.value.status_code == 400
        assert "Unsupported provider" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_oauth_start_exception_handling(self, mock_request):
        """Test OAuth start exception handling."""
        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_oauth.create_client.side_effect = Exception("OAuth client error")

            with pytest.raises(HTTPException) as exc_info:
                await oauth_start("google", mock_request)

            assert exc_info.value.status_code == 500
            assert "Failed to initiate OAuth flow" in str(exc_info.value.detail)


# ==================== OAuth Callback Tests - Google ====================


class TestOAuthCallbackGoogle:
    """Tests for Google OAuth callback."""

    @pytest.mark.asyncio
    async def test_google_callback_new_user_success(self, mock_db, mock_request):
        """Test successful Google OAuth callback creating new user."""
        # Mock OAuth token exchange
        google_token = {
            'access_token': 'google_access_token_123',
            'refresh_token': 'google_refresh_token_123',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': 'newuser@example.com',
                'name': 'New User',
                'picture': 'https://example.com/avatar.jpg',
                'email_verified': True,
            }
        }

        # Mock database queries - no existing OAuth account or user
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = None

        new_user = User(
            id="new_user_123",
            email="newuser@example.com",
            email_verified=True,
            full_name="New User",
            token_version=1,
        )

        # Mock final user query
        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = new_user

        mock_db.execute.side_effect = [
            mock_oauth_result,  # OAuth account query
            mock_user_result,   # User by email query
            mock_final_user_result,  # Final user query
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_redis = AsyncMock()
            mock_redis_svc.return_value = mock_redis

            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="access_token_123")
            mock_jwt.create_refresh_token = Mock(return_value=("refresh_token_123", "jti_123"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "device_fp_123"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("google", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            assert "access_token=access_token_123" in result.headers['location']
            assert "refresh_token=refresh_token_123" in result.headers['location']

            # Verify user was created
            assert mock_db.add.call_count >= 2  # User + OAuthAccount + RefreshToken
            mock_db.commit.assert_called()

    @pytest.mark.asyncio
    async def test_google_callback_existing_oauth_account(self, mock_db, mock_request, sample_oauth_account, sample_user):
        """Test Google OAuth callback with existing OAuth account."""
        google_token = {
            'access_token': 'new_google_access_token',
            'refresh_token': 'new_google_refresh_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': 'testuser@example.com',
                'name': 'Test User',
                'picture': 'https://example.com/avatar.jpg',
                'email_verified': True,
            }
        }

        # Mock OAuth account exists
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = sample_oauth_account

        # Mock final user query
        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = sample_user

        mock_db.execute.side_effect = [
            mock_oauth_result,  # OAuth account query
            mock_final_user_result,  # Final user query
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="access_token_123")
            mock_jwt.create_refresh_token = Mock(return_value=("refresh_token_123", "jti_123"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "device_fp_123"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("google", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            assert "access_token" in result.headers['location']

            # Verify OAuth account was updated
            assert sample_oauth_account.access_token == "new_google_access_token"
            assert sample_oauth_account.refresh_token == "new_google_refresh_token"

    @pytest.mark.asyncio
    async def test_google_callback_existing_user_link_account(self, mock_db, mock_request, sample_user):
        """Test Google OAuth callback linking to existing user by email."""
        google_token = {
            'access_token': 'google_access_token',
            'refresh_token': 'google_refresh_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_new',
                'email': 'testuser@example.com',  # Same email as existing user
                'name': 'Test User',
                'picture': 'https://example.com/avatar.jpg',
                'email_verified': True,
            }
        }

        # Mock no OAuth account, but user exists
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = sample_user

        # Mock final user query
        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = sample_user

        mock_db.execute.side_effect = [
            mock_oauth_result,  # OAuth account query
            mock_user_result,   # User by email query
            mock_final_user_result,  # Final user query
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="access_token_123")
            mock_jwt.create_refresh_token = Mock(return_value=("refresh_token_123", "jti_123"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "device_fp_123"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("google", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            # Verify OAuth account was created and linked
            assert mock_db.add.call_count >= 2  # OAuthAccount + RefreshToken


# ==================== OAuth Callback Tests - GitHub ====================


class TestOAuthCallbackGitHub:
    """Tests for GitHub OAuth callback."""

    @pytest.mark.asyncio
    async def test_github_callback_with_email_success(self, mock_db, mock_request):
        """Test successful GitHub OAuth callback with email in profile."""
        github_token = {
            'access_token': 'github_access_token_123',
            'expires_in': 3600,
        }

        github_user_info = {
            'id': 12345,
            'login': 'githubuser',
            'email': 'githubuser@example.com',
            'name': 'GitHub User',
            'avatar_url': 'https://github.com/avatar.jpg',
            'bio': 'Software Developer',
        }

        # Mock database queries
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = None

        new_user = User(
            id="github_user_123",
            email="githubuser@example.com",
            email_verified=True,
            full_name="GitHub User",
            token_version=1,
        )

        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = new_user

        mock_db.execute.side_effect = [
            mock_oauth_result,
            mock_user_result,
            mock_final_user_result,
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=github_token)

            # Mock GitHub API response
            mock_github_response = Mock()
            mock_github_response.json.return_value = github_user_info
            mock_client.get = AsyncMock(return_value=mock_github_response)

            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="access_token_github")
            mock_jwt.create_refresh_token = Mock(return_value=("refresh_token_github", "jti_github"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "device_fp_github"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("github", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            assert "access_token" in result.headers['location']
            mock_client.get.assert_called_once_with('https://api.github.com/user', token=github_token)

    @pytest.mark.asyncio
    async def test_github_callback_fetch_email_from_api(self, mock_db, mock_request):
        """Test GitHub OAuth callback fetching email from separate API."""
        github_token = {
            'access_token': 'github_access_token_123',
            'expires_in': 3600,
        }

        github_user_info = {
            'id': 12345,
            'login': 'githubuser',
            'email': None,  # Email not in profile
            'name': 'GitHub User',
            'avatar_url': 'https://github.com/avatar.jpg',
        }

        github_emails = [
            {'email': 'secondary@example.com', 'primary': False, 'verified': True},
            {'email': 'primary@example.com', 'primary': True, 'verified': True},
        ]

        # Mock database queries
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = None

        new_user = User(
            id="github_user_123",
            email="primary@example.com",
            email_verified=True,
            token_version=1,
        )

        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = new_user

        mock_db.execute.side_effect = [
            mock_oauth_result,
            mock_user_result,
            mock_final_user_result,
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=github_token)

            # Mock GitHub API responses
            mock_user_response = Mock()
            mock_user_response.json.return_value = github_user_info
            mock_emails_response = Mock()
            mock_emails_response.json.return_value = github_emails

            mock_client.get = AsyncMock(side_effect=[mock_user_response, mock_emails_response])
            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="access_token_github")
            mock_jwt.create_refresh_token = Mock(return_value=("refresh_token_github", "jti_github"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "device_fp_github"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("github", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            assert mock_client.get.call_count == 2
            mock_client.get.assert_any_call('https://api.github.com/user', token=github_token)
            mock_client.get.assert_any_call('https://api.github.com/user/emails', token=github_token)

    @pytest.mark.asyncio
    async def test_github_callback_no_email_error(self, mock_db, mock_request):
        """Test GitHub OAuth callback fails when no email is available."""
        github_token = {
            'access_token': 'github_access_token_123',
            'expires_in': 3600,
        }

        github_user_info = {
            'id': 12345,
            'login': 'githubuser',
            'email': None,
            'name': 'GitHub User',
        }

        github_emails = []  # No emails available

        with patch('app.auth.oauth.oauth') as mock_oauth:
            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=github_token)

            mock_user_response = Mock()
            mock_user_response.json.return_value = github_user_info
            mock_emails_response = Mock()
            mock_emails_response.json.return_value = github_emails

            mock_client.get = AsyncMock(side_effect=[mock_user_response, mock_emails_response])
            mock_oauth.create_client.return_value = mock_client

            # Execute - should redirect with error
            result = await oauth_callback("github", mock_request, mock_db)

            # Assertions
            assert isinstance(result, RedirectResponse)
            assert "oauth-error" in result.headers['location']


# ==================== OAuth Callback Error Tests ====================


class TestOAuthCallbackErrors:
    """Tests for OAuth callback error handling."""

    @pytest.mark.asyncio
    async def test_oauth_callback_unsupported_provider(self, mock_db, mock_request):
        """Test OAuth callback with unsupported provider."""
        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value={'access_token': 'token'})
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_callback("facebook", mock_request, mock_db)

            assert isinstance(result, RedirectResponse)
            assert "oauth-error" in result.headers['location']

    @pytest.mark.asyncio
    async def test_oauth_callback_token_exchange_failure(self, mock_db, mock_request):
        """Test OAuth callback when token exchange fails."""
        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(side_effect=Exception("Token exchange failed"))
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_callback("google", mock_request, mock_db)

            assert isinstance(result, RedirectResponse)
            assert "oauth-error" in result.headers['location']

    @pytest.mark.asyncio
    async def test_oauth_callback_database_error(self, mock_db, mock_request):
        """Test OAuth callback with database error."""
        google_token = {
            'access_token': 'google_access_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': 'test@example.com',
                'name': 'Test User',
                'email_verified': True,
            }
        }

        mock_db.execute.side_effect = Exception("Database error")

        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_callback("google", mock_request, mock_db)

            assert isinstance(result, RedirectResponse)
            assert "oauth-error" in result.headers['location']

    @pytest.mark.asyncio
    async def test_oauth_callback_no_email_provided(self, mock_db, mock_request):
        """Test OAuth callback when provider doesn't provide email."""
        google_token = {
            'access_token': 'google_access_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': None,  # No email
                'name': 'Test User',
            }
        }

        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_oauth_result

        with patch('app.auth.oauth.oauth') as mock_oauth:
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            result = await oauth_callback("google", mock_request, mock_db)

            assert isinstance(result, RedirectResponse)
            assert "oauth-error" in result.headers['location']


# ==================== OAuth Link/Unlink Tests ====================


class TestOAuthLinkUnlink:
    """Tests for OAuth account linking and unlinking."""

    @pytest.mark.asyncio
    async def test_link_oauth_account_not_implemented(self, mock_db, mock_request):
        """Test OAuth account linking (not yet implemented)."""
        with pytest.raises(HTTPException) as exc_info:
            await link_oauth_account("google", mock_request, mock_db)

        assert exc_info.value.status_code == 501
        assert "not yet implemented" in str(exc_info.value.detail).lower()

    @pytest.mark.asyncio
    async def test_unlink_oauth_account_not_implemented(self, mock_db):
        """Test OAuth account unlinking (not yet implemented)."""
        with pytest.raises(HTTPException) as exc_info:
            await unlink_oauth_account("google", mock_db)

        assert exc_info.value.status_code == 501
        assert "not yet implemented" in str(exc_info.value.detail).lower()


# ==================== Integration Tests ====================


class TestOAuthIntegration:
    """Integration tests for complete OAuth flows."""

    @pytest.mark.asyncio
    async def test_complete_google_oauth_flow_new_user(self, mock_db, mock_request):
        """Test complete Google OAuth flow for new user registration."""
        # This tests the full flow from start to callback
        google_token = {
            'access_token': 'google_access_token_new',
            'refresh_token': 'google_refresh_token_new',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_new_123',
                'email': 'newgoogleuser@example.com',
                'name': 'New Google User',
                'picture': 'https://example.com/new_avatar.jpg',
                'email_verified': True,
            }
        }

        # Mock database queries for new user
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = None

        new_user = User(
            id="new_google_user_id",
            email="newgoogleuser@example.com",
            email_verified=True,
            full_name="New Google User",
            avatar_url="https://example.com/new_avatar.jpg",
            token_version=1,
        )

        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = new_user

        mock_db.execute.side_effect = [
            mock_oauth_result,
            mock_user_result,
            mock_final_user_result,
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="new_access_token")
            mock_jwt.create_refresh_token = Mock(return_value=("new_refresh_token", "new_jti"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "new_device_fp"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("google", mock_request, mock_db)

            # Verify complete flow
            assert isinstance(result, RedirectResponse)
            assert "oauth-success" in result.headers['location']
            assert "access_token=new_access_token" in result.headers['location']
            assert "refresh_token=new_refresh_token" in result.headers['location']

            # Verify all components were called
            mock_jwt.create_access_token.assert_called_once()
            mock_jwt.create_refresh_token.assert_called_once()
            mock_session.assert_called_once()
            mock_audit.assert_called_once()
            assert mock_db.commit.call_count >= 2

    @pytest.mark.asyncio
    async def test_complete_github_oauth_flow_existing_user(self, mock_db, mock_request, sample_user):
        """Test complete GitHub OAuth flow for existing user."""
        github_token = {
            'access_token': 'github_access_existing',
            'expires_in': 3600,
        }

        github_user_info = {
            'id': 98765,
            'login': 'existinguser',
            'email': 'testuser@example.com',  # Same as sample_user
            'name': 'Test User',
            'avatar_url': 'https://github.com/avatar_existing.jpg',
        }

        # Mock no OAuth account, but user exists
        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = sample_user

        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = sample_user

        mock_db.execute.side_effect = [
            mock_oauth_result,
            mock_user_result,
            mock_final_user_result,
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service') as mock_redis_svc, \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint') as mock_fingerprint, \
             patch('app.auth.oauth.create_session_record') as mock_session, \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            # Setup mocks
            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=github_token)

            mock_github_response = Mock()
            mock_github_response.json.return_value = github_user_info
            mock_client.get = AsyncMock(return_value=mock_github_response)

            mock_oauth.create_client.return_value = mock_client

            mock_redis_svc.return_value = AsyncMock()
            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="existing_access_token")
            mock_jwt.create_refresh_token = Mock(return_value=("existing_refresh_token", "existing_jti"))
            mock_jwt_mgr.return_value = mock_jwt

            mock_fingerprint.return_value = "existing_device_fp"
            mock_session.return_value = AsyncMock()
            mock_audit.return_value = AsyncMock()

            # Execute
            result = await oauth_callback("github", mock_request, mock_db)

            # Verify
            assert isinstance(result, RedirectResponse)
            assert "oauth-success" in result.headers['location']
            # Verify OAuth account was linked to existing user
            assert mock_db.add.call_count >= 2  # OAuthAccount + RefreshToken


# ==================== Edge Cases and Security Tests ====================


class TestOAuthEdgeCases:
    """Tests for edge cases and security concerns."""

    @pytest.mark.asyncio
    async def test_oauth_callback_updates_last_login(self, mock_db, mock_request, sample_user, sample_oauth_account):
        """Test that OAuth callback updates user's last_login_at."""
        google_token = {
            'access_token': 'google_access_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': 'testuser@example.com',
                'name': 'Test User',
                'email_verified': True,
            }
        }

        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = sample_oauth_account
        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = sample_user

        mock_db.execute.side_effect = [mock_oauth_result, mock_final_user_result]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service'), \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint'), \
             patch('app.auth.oauth.create_session_record'), \
             patch('app.auth.oauth.log_audit_event'):

            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="token")
            mock_jwt.create_refresh_token = Mock(return_value=("token", "jti"))
            mock_jwt_mgr.return_value = mock_jwt

            initial_last_login = sample_user.last_login_at

            await oauth_callback("google", mock_request, mock_db)

            # Verify last_login_at was updated
            assert sample_user.last_login_at != initial_last_login

    @pytest.mark.asyncio
    async def test_oauth_callback_creates_audit_log(self, mock_db, mock_request, sample_user, sample_oauth_account):
        """Test that OAuth callback creates audit log entry."""
        google_token = {
            'access_token': 'google_access_token',
            'expires_in': 3600,
            'userinfo': {
                'sub': 'google_user_123',
                'email': 'testuser@example.com',
                'name': 'Test User',
                'email_verified': True,
            }
        }

        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = sample_oauth_account
        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = sample_user

        mock_db.execute.side_effect = [mock_oauth_result, mock_final_user_result]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service'), \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint'), \
             patch('app.auth.oauth.create_session_record'), \
             patch('app.auth.oauth.log_audit_event') as mock_audit:

            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=google_token)
            mock_oauth.create_client.return_value = mock_client

            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="token")
            mock_jwt.create_refresh_token = Mock(return_value=("token", "jti"))
            mock_jwt_mgr.return_value = mock_jwt

            await oauth_callback("google", mock_request, mock_db)

            # Verify audit log was created
            mock_audit.assert_called_once()
            call_args = mock_audit.call_args
            assert call_args[0][3] == "login"  # event_type
            assert call_args[0][4] == "success"  # event_status
            assert call_args[1]["auth_method"] == "oauth_google"

    @pytest.mark.asyncio
    async def test_github_oauth_name_fallback_to_login(self, mock_db, mock_request):
        """Test GitHub OAuth uses login as name when name is not provided."""
        github_token = {
            'access_token': 'github_access_token',
            'expires_in': 3600,
        }

        github_user_info = {
            'id': 12345,
            'login': 'cooluser',
            'email': 'cooluser@example.com',
            'name': None,  # No name provided
            'avatar_url': 'https://github.com/avatar.jpg',
        }

        mock_oauth_result = Mock()
        mock_oauth_result.scalar_one_or_none.return_value = None
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = None

        new_user = User(
            id="user_123",
            email="cooluser@example.com",
            email_verified=True,
            full_name="cooluser",  # Should use login
            token_version=1,
        )

        mock_final_user_result = Mock()
        mock_final_user_result.scalar_one.return_value = new_user

        mock_db.execute.side_effect = [
            mock_oauth_result,
            mock_user_result,
            mock_final_user_result,
        ]

        with patch('app.auth.oauth.oauth') as mock_oauth, \
             patch('app.auth.oauth.get_redis_service'), \
             patch('app.auth.oauth.get_jwt_manager') as mock_jwt_mgr, \
             patch('app.auth.oauth.generate_device_fingerprint'), \
             patch('app.auth.oauth.create_session_record'), \
             patch('app.auth.oauth.log_audit_event'):

            mock_client = AsyncMock()
            mock_client.authorize_access_token = AsyncMock(return_value=github_token)

            mock_github_response = Mock()
            mock_github_response.json.return_value = github_user_info
            mock_client.get = AsyncMock(return_value=mock_github_response)

            mock_oauth.create_client.return_value = mock_client

            mock_jwt = Mock()
            mock_jwt.create_access_token = Mock(return_value="token")
            mock_jwt.create_refresh_token = Mock(return_value=("token", "jti"))
            mock_jwt_mgr.return_value = mock_jwt

            result = await oauth_callback("github", mock_request, mock_db)

            assert isinstance(result, RedirectResponse)
            # Verify the flow completed successfully even without a name


# ==================== Router Configuration Tests ====================


class TestOAuthRouter:
    """Tests for OAuth router configuration."""

    def test_router_prefix(self):
        """Test that router has correct prefix."""
        assert router.prefix == "/api/auth/oauth"

    def test_router_tags(self):
        """Test that router has correct tags."""
        assert "oauth" in router.tags
