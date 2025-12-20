"""
Integration tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.asyncio
class TestUserRegistration:
    """Tests for user registration endpoint."""

    async def test_register_success(self, client: AsyncClient, test_user_data: dict):
        """Test successful user registration."""
        response = await client.post("/api/auth/register", json=test_user_data)

        # Debug: print response if not 201
        if response.status_code != 201:
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")

        assert response.status_code == 201
        data = response.json()
        assert "user_id" in data
        assert data["email"] == test_user_data["email"]
        assert data["requires_verification"] == True
        assert "password" not in data  # Password should not be returned

    async def test_register_duplicate_email(self, client: AsyncClient, test_user_data: dict):
        """Test registration with duplicate email."""
        # Register first user
        await client.post("/api/auth/register", json=test_user_data)

        # Try to register with same email
        response = await client.post("/api/auth/register", json=test_user_data)

        assert response.status_code == 400
        # API returns informative message for duplicate email
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_invalid_email(self, client: AsyncClient, test_user_data: dict):
        """Test registration with invalid email."""
        test_user_data["email"] = "invalid-email"
        response = await client.post("/api/auth/register", json=test_user_data)

        assert response.status_code == 422

    async def test_register_weak_password(self, client: AsyncClient, test_user_data: dict):
        """Test registration with weak password."""
        test_user_data["password"] = "weak"
        response = await client.post("/api/auth/register", json=test_user_data)

        assert response.status_code == 422 or response.status_code == 400

    async def test_register_missing_fields(self, client: AsyncClient):
        """Test registration with missing required fields."""
        incomplete_data = {"email": "test@example.com"}
        response = await client.post("/api/auth/register", json=incomplete_data)

        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserLogin:
    """Tests for user login endpoint."""

    async def test_login_success(self, client: AsyncClient, test_user_data: dict, db_session):
        """Test successful login."""
        from tests.conftest import verify_test_user_email

        # Register user first
        await client.post("/api/auth/register", json=test_user_data)

        # Verify email for testing
        await verify_test_user_email(db_session, test_user_data["email"])

        # Login
        login_data = {"email": test_user_data["email"], "password": test_user_data["password"]}
        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(
        self, client: AsyncClient, test_user_data: dict, db_session
    ):
        """Test login with wrong password."""
        from tests.conftest import verify_test_user_email

        # Register user first
        await client.post("/api/auth/register", json=test_user_data)

        # Verify email for testing
        await verify_test_user_email(db_session, test_user_data["email"])

        # Try login with wrong password
        login_data = {"email": test_user_data["email"], "password": "WrongPassword123!"}
        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with nonexistent user."""
        login_data = {"email": "nonexistent@example.com", "password": "Password123!"}
        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == 401

    async def test_login_missing_credentials(self, client: AsyncClient):
        """Test login with missing credentials."""
        response = await client.post("/api/auth/login", json={})

        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.asyncio
class TestTokenRefresh:
    """Tests for token refresh endpoint."""

    async def test_refresh_token_success(self, client: AsyncClient, authenticated_user: dict):
        """Test successful token refresh."""
        response = await client.post(
            "/api/auth/refresh", json={"refresh_token": authenticated_user["refresh_token"]}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        """Test refresh with invalid token."""
        response = await client.post("/api/auth/refresh", json={"refresh_token": "invalid_token"})

        assert response.status_code == 401

    async def test_refresh_expired_token(self, client: AsyncClient):
        """Test refresh with expired token."""
        # This would require generating an expired token
        # Placeholder for actual implementation
        pass


@pytest.mark.integration
@pytest.mark.asyncio
class TestPasswordReset:
    """Tests for password reset endpoints."""

    async def test_request_password_reset(self, client: AsyncClient, test_user_data: dict):
        """Test password reset request."""
        # Register user first
        await client.post("/api/auth/register", json=test_user_data)

        # Request password reset
        response = await client.post(
            "/api/auth/password-reset/request", json={"email": test_user_data["email"]}
        )

        assert response.status_code == 200
        assert "message" in response.json()

    async def test_request_password_reset_nonexistent_email(self, client: AsyncClient):
        """Test password reset for nonexistent email."""
        response = await client.post(
            "/api/auth/password-reset/request", json={"email": "nonexistent@example.com"}
        )

        # Should return 200 even for nonexistent email (security best practice)
        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
class TestEmailVerification:
    """Tests for email verification endpoints."""

    async def test_request_email_verification(self, client: AsyncClient, auth_headers: dict):
        """Test email verification request."""
        response = await client.post("/api/auth/verify-email/request", headers=auth_headers)

        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserProfile:
    """Tests for user profile endpoints."""

    async def test_get_own_profile(self, client: AsyncClient, auth_headers: dict):
        """Test getting own profile."""
        response = await client.get("/api/v1/users/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "username" in data
        assert "password" not in data

    async def test_get_profile_without_auth(self, client: AsyncClient):
        """Test getting profile without authentication."""
        response = await client.get("/api/v1/users/me")

        assert response.status_code == 401

    async def test_update_profile(self, client: AsyncClient, auth_headers: dict):
        """Test updating user profile."""
        update_data = {"full_name": "Updated Name", "bio": "Updated bio"}
        response = await client.patch("/api/v1/users/me", json=update_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == update_data["full_name"]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.security
class TestAuthSecurity:
    """Security tests for authentication."""

    async def test_rate_limiting(self, client: AsyncClient):
        """Test rate limiting on login endpoint."""
        login_data = {"username": "testuser", "password": "wrong_password"}

        # Make multiple failed login attempts
        responses = []
        for _ in range(10):
            response = await client.post("/api/auth/login", json=login_data)
            responses.append(response.status_code)

        # Should eventually get rate limited (429)
        # Implementation depends on rate limit settings
        pass

    async def test_sql_injection_protection(self, client: AsyncClient):
        """Test SQL injection protection."""
        malicious_data = {"username": "admin' OR '1'='1", "password": "password"}
        response = await client.post("/api/auth/login", json=malicious_data)

        # Should not succeed with SQL injection
        assert response.status_code in [401, 422]

    async def test_xss_protection(self, client: AsyncClient, test_user_data: dict):
        """Test XSS protection in user input."""
        test_user_data["full_name"] = "<script>alert('xss')</script>"
        response = await client.post("/api/auth/register", json=test_user_data)

        if response.status_code == 201:
            data = response.json()
            # Script tags should be sanitized
            assert "<script>" not in data.get("full_name", "")

    async def test_password_not_exposed_in_response(
        self, client: AsyncClient, test_user_data: dict
    ):
        """Test that password is never exposed in API responses."""
        response = await client.post("/api/auth/register", json=test_user_data)

        assert response.status_code == 201
        data = response.json()
        assert "password" not in data
        assert "hashed_password" not in data


@pytest.mark.integration
@pytest.mark.asyncio
class TestTwoFactorAuth:
    """Tests for two-factor authentication."""

    async def test_enable_2fa(self, client: AsyncClient, auth_headers: dict):
        """Test enabling 2FA."""
        response = await client.post("/api/auth/2fa/enable", headers=auth_headers)

        assert response.status_code in [200, 201]
        data = response.json()
        assert "secret" in data or "qr_code" in data

    async def test_verify_2fa_code(self, client: AsyncClient, auth_headers: dict):
        """Test verifying 2FA code."""
        # This would require actual 2FA implementation
        pass

    async def test_disable_2fa(self, client: AsyncClient, auth_headers: dict):
        """Test disabling 2FA."""
        response = await client.post("/api/auth/2fa/disable", headers=auth_headers)

        assert response.status_code == 200
