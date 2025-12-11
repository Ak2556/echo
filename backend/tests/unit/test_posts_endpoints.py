"""
Unit tests for posts endpoints.
"""

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from app.api.v1.endpoints.posts import router


@pytest.fixture
def app():
    """Create FastAPI app with posts router."""
    app = FastAPI()
    app.include_router(router, prefix="/posts")
    return app


class TestPostsEndpoints:
    """Tests for posts endpoints."""

    @pytest.mark.asyncio
    async def test_update_post(self, app):
        """Test update post endpoint."""
        from app.api.v1.endpoints.posts import PostUpdate, update_post

        post_id = "post_123"
        update_data = PostUpdate(title="Updated Title", content="Updated Content")

        result = await update_post(post_id, update_data)

        assert result.id == post_id
        assert result.title == "Updated Title"
        assert result.content == "Updated Content"

    @pytest.mark.asyncio
    async def test_like_post(self, app):
        """Test like post endpoint."""
        from app.api.v1.endpoints.posts import like_post

        post_id = "post_123"
        result = await like_post(post_id)

        assert result["message"] == "Post liked successfully"

    @pytest.mark.asyncio
    async def test_unlike_post(self, app):
        """Test unlike post endpoint."""
        from app.api.v1.endpoints.posts import unlike_post

        post_id = "post_123"
        result = await unlike_post(post_id)

        assert result["message"] == "Post unliked successfully"

    @pytest.mark.asyncio
    async def test_get_trending_posts(self, app):
        """Test get trending posts endpoint."""
        from app.api.v1.endpoints.posts import get_trending_posts

        result = await get_trending_posts(limit=20)

        assert isinstance(result, list)
        assert len(result) == 0  # TODO implementation returns empty list
