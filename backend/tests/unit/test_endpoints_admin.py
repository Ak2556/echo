"""
Unit tests for app/api/v1/endpoints/admin.py
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient


@pytest.fixture
def test_app():
    """Create a test FastAPI app with the admin router."""
    from fastapi import FastAPI

    from app.api.v1.endpoints.admin import router

    app = FastAPI()
    app.include_router(router, prefix="/api/v1/admin")
    return app


@pytest.fixture
def client(test_app):
    """Create test client."""
    return TestClient(test_app)


class TestAdminEndpoints:
    """Tests for admin endpoints."""

    def test_get_admin_stats(self, client):
        """Test get admin stats endpoint - covers line 11."""
        response = client.get("/api/v1/admin/stats")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_users" in data
        assert "active_users" in data
        assert "total_posts" in data
        assert "total_files" in data
        assert "server_uptime" in data
        assert "storage_used" in data

    def test_get_all_users_default(self, client):
        """Test get all users with default params - covers lines 24-47."""
        response = client.get("/api/v1/admin/users")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert isinstance(data["users"], list)
        assert len(data["users"]) == 3  # Default mock users

    def test_get_all_users_with_pagination(self, client):
        """Test get all users with pagination - covers lines 24-47."""
        response = client.get("/api/v1/admin/users?limit=2&offset=1")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert len(data["users"]) == 2

    def test_update_user_role(self, client):
        """Test update user role endpoint - covers line 53."""
        response = client.put("/api/v1/admin/users/123/role?role=admin")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "User 123" in data["message"]
        assert "admin" in data["message"]

    def test_delete_user(self, client):
        """Test delete user endpoint - covers line 59."""
        response = client.delete("/api/v1/admin/users/456")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "User 456" in data["message"]
        assert "deleted" in data["message"]

    def test_get_system_logs(self, client):
        """Test get system logs endpoint - covers line 65."""
        response = client.get("/api/v1/admin/logs")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "logs" in data
        assert isinstance(data["logs"], list)
        assert len(data["logs"]) > 0
        # Check log structure
        log = data["logs"][0]
        assert "timestamp" in log
        assert "level" in log
        assert "message" in log

    def test_get_system_logs_with_limit(self, client):
        """Test get system logs with limit parameter."""
        response = client.get("/api/v1/admin/logs?limit=50")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "logs" in data
        assert isinstance(data["logs"], list)
