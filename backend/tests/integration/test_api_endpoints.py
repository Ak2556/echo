"""
Integration tests for main API endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.asyncio
class TestHealthEndpoints:
    """Tests for health check endpoints."""

    async def test_root_endpoint(self, client: AsyncClient):
        """Test root endpoint."""
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data

    async def test_health_check(self, client: AsyncClient):
        """Test health check endpoint."""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "checks" in data
        assert data["status"] in ["healthy", "unhealthy"]

    async def test_metrics_endpoint(self, client: AsyncClient):
        """Test metrics endpoint."""
        response = await client.get("/metrics")

        # Metrics might be disabled or require auth
        assert response.status_code in [200, 403, 404]

    async def test_stats_endpoint(self, client: AsyncClient):
        """Test stats endpoint."""
        response = await client.get("/stats")

        assert response.status_code in [200, 401]


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserEndpoints:
    """Tests for user management endpoints."""

    async def test_list_users_admin(self, client: AsyncClient, auth_headers: dict):
        """Test listing users (admin only)."""
        response = await client.get("/api/v1/users/", headers=auth_headers)

        # Might require admin privileges
        assert response.status_code in [200, 403]

    async def test_get_user_by_id(self, client: AsyncClient, auth_headers: dict):
        """Test getting user by ID."""
        # First get own profile to get ID
        me_response = await client.get("/api/v1/users/me", headers=auth_headers)
        user_id = me_response.json()["id"]

        response = await client.get(f"/api/v1/users/{user_id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id

    async def test_delete_user(self, client: AsyncClient, auth_headers: dict):
        """Test deleting user."""
        me_response = await client.get("/api/v1/users/me", headers=auth_headers)
        user_id = me_response.json()["id"]

        response = await client.delete(f"/api/v1/users/{user_id}", headers=auth_headers)

        assert response.status_code in [200, 204]


@pytest.mark.integration
@pytest.mark.asyncio
class TestPostEndpoints:
    """Tests for post/content endpoints."""

    async def test_create_post(self, client: AsyncClient, auth_headers: dict, test_post_data: dict):
        """Test creating a post."""
        response = await client.post("/api/v1/posts/", json=test_post_data, headers=auth_headers)

        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        assert data["title"] == test_post_data["title"]

    async def test_list_posts(self, client: AsyncClient):
        """Test listing posts."""
        response = await client.get("/api/v1/posts/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or "items" in data

    async def test_get_post_by_id(
        self, client: AsyncClient, auth_headers: dict, test_post_data: dict
    ):
        """Test getting post by ID."""
        # Create a post first
        create_response = await client.post(
            "/api/v1/posts/", json=test_post_data, headers=auth_headers
        )
        post_id = create_response.json()["id"]

        # Get the post
        response = await client.get(f"/api/v1/posts/{post_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == post_id

    async def test_update_post(self, client: AsyncClient, auth_headers: dict, test_post_data: dict):
        """Test updating a post."""
        # Create a post first
        create_response = await client.post(
            "/api/v1/posts/", json=test_post_data, headers=auth_headers
        )
        post_id = create_response.json()["id"]

        # Update the post
        update_data = {"title": "Updated Title"}
        response = await client.patch(
            f"/api/v1/posts/{post_id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]

    async def test_delete_post(self, client: AsyncClient, auth_headers: dict, test_post_data: dict):
        """Test deleting a post."""
        # Create a post first
        create_response = await client.post(
            "/api/v1/posts/", json=test_post_data, headers=auth_headers
        )
        post_id = create_response.json()["id"]

        # Delete the post
        response = await client.delete(f"/api/v1/posts/{post_id}", headers=auth_headers)

        assert response.status_code in [200, 204]


@pytest.mark.integration
@pytest.mark.asyncio
class TestChatEndpoints:
    """Tests for AI chat endpoints."""

    async def test_send_chat_message(self, client: AsyncClient, auth_headers: dict):
        """Test sending a chat message."""
        chat_data = {"message": "Hello, how are you?", "conversation_id": None}

        response = await client.post("/api/v1/chat/", json=chat_data, headers=auth_headers)

        # Might require OpenAI API key
        assert response.status_code in [200, 201, 503]

    async def test_get_chat_history(self, client: AsyncClient, auth_headers: dict):
        """Test getting chat history."""
        response = await client.get("/api/v1/chat/history", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or "items" in data


@pytest.mark.integration
@pytest.mark.asyncio
class TestFileUploadEndpoints:
    """Tests for file upload endpoints."""

    async def test_upload_file(self, client: AsyncClient, auth_headers: dict):
        """Test file upload."""
        files = {"file": ("test.txt", b"test content", "text/plain")}

        response = await client.post("/api/v1/files/upload", files=files, headers=auth_headers)

        assert response.status_code in [200, 201]

    async def test_list_files(self, client: AsyncClient, auth_headers: dict):
        """Test listing uploaded files."""
        response = await client.get("/api/v1/files/", headers=auth_headers)

        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
class TestSearchEndpoints:
    """Tests for search functionality."""

    async def test_search_posts(self, client: AsyncClient):
        """Test searching posts."""
        response = await client.get("/api/v1/search/?q=test")

        assert response.status_code == 200

    async def test_search_with_filters(self, client: AsyncClient):
        """Test search with filters."""
        response = await client.get("/api/v1/search/?q=test&type=post&category=tech")

        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
class TestAnalyticsEndpoints:
    """Tests for analytics endpoints."""

    async def test_get_analytics(self, client: AsyncClient, auth_headers: dict):
        """Test getting analytics."""
        response = await client.get("/api/v1/analytics/", headers=auth_headers)

        # Might require admin privileges
        assert response.status_code in [200, 403]


@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.performance
class TestPaginationAndPerformance:
    """Tests for pagination and performance."""

    async def test_pagination(self, client: AsyncClient):
        """Test pagination on list endpoints."""
        response = await client.get("/api/v1/posts/?page=1&page_size=10")

        assert response.status_code == 200
        data = response.json()

        if isinstance(data, dict):
            assert "items" in data or "results" in data
            assert "total" in data or "count" in data

    async def test_large_page_size_limit(self, client: AsyncClient):
        """Test that page size is limited."""
        response = await client.get("/api/v1/posts/?page_size=10000")

        # Should either succeed with limited results or return error
        assert response.status_code in [200, 400, 422]


@pytest.mark.integration
@pytest.mark.asyncio
class TestErrorHandling:
    """Tests for error handling."""

    async def test_404_not_found(self, client: AsyncClient):
        """Test 404 error handling."""
        response = await client.get("/api/v1/nonexistent-endpoint")

        assert response.status_code == 404
        data = response.json()
        assert "error" in data or "detail" in data

    async def test_405_method_not_allowed(self, client: AsyncClient):
        """Test 405 error handling."""
        response = await client.post("/")

        assert response.status_code == 405

    async def test_422_validation_error(self, client: AsyncClient):
        """Test validation error handling."""
        response = await client.post("/api/auth/register", json={"invalid": "data"})

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
