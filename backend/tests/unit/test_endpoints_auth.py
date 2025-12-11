"""
Unit tests for app/api/v1/endpoints/auth.py
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient


@pytest.fixture
def test_app():
    """Create a test FastAPI app with the auth router."""
    from fastapi import FastAPI
    from app.api.v1.endpoints.auth import router

    app = FastAPI()
    app.include_router(router, prefix="/api/v1/auth")
    return app


@pytest.fixture
def client(test_app):
    """Create test client."""
    return TestClient(test_app)


class TestAuthEndpoints:
    """Tests for authentication endpoints."""

    def test_login_endpoint(self, client):
        """Test login endpoint returns token response - covers line 37."""
        response = client.post(
            "/api/v1/auth/login", json={"email": "test@example.com", "password": "testpass123"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert data["token_type"] == "bearer"
        assert data["access_token"] == "mock_access_token"

    def test_register_endpoint(self, client):
        """Test register endpoint returns token response - covers line 46."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "password123",
                "display_name": "New User",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert data["token_type"] == "bearer"
        assert data["access_token"] == "mock_access_token"

    def test_refresh_token_endpoint(self, client):
        """Test refresh token endpoint - covers line 55."""
        response = client.post("/api/v1/auth/refresh")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["access_token"] == "new_mock_token"

    def test_logout_endpoint(self, client):
        """Test logout endpoint - covers line 62."""
        response = client.post("/api/v1/auth/logout")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert data["message"] == "Logged out successfully"
