"""
Unit tests for search endpoints.
"""

import pytest
from app.api.v1.endpoints.search import (
    advanced_search,
    autocomplete,
    get_filters,
    SearchType,
)


class TestSearchEndpoints:
    """Tests for search endpoints."""

    @pytest.mark.asyncio
    async def test_search_all_types(self):
        """Test searching all types."""
        response = await advanced_search(
            q="test",
            search_type=SearchType.ALL,
            limit=10,
            offset=0
        )

        assert "query" in response
        assert response["query"] == "test"
        assert "results" in response
        assert "users" in response["results"]
        assert "posts" in response["results"]
        assert "files" in response["results"]

    @pytest.mark.asyncio
    async def test_search_users_only(self):
        """Test searching users only."""
        response = await advanced_search(
            q="john",
            search_type=SearchType.USERS,
            limit=5,
            offset=0
        )

        assert response["query"] == "john"
        assert "users" in response["results"]
        assert "posts" not in response["results"]

    @pytest.mark.asyncio
    async def test_search_posts_only(self):
        """Test searching posts only."""
        response = await advanced_search(
            q="echo",
            search_type=SearchType.POSTS,
            limit=5,
            offset=0
        )

        assert response["query"] == "echo"
        assert "posts" in response["results"]
        assert "users" not in response["results"]

    @pytest.mark.asyncio
    async def test_search_files_only(self):
        """Test searching files only."""
        response = await advanced_search(
            q="document",
            search_type=SearchType.FILES,
            limit=5,
            offset=0
        )

        assert response["query"] == "document"
        assert "files" in response["results"]

    @pytest.mark.asyncio
    async def test_search_with_pagination(self):
        """Test search with pagination."""
        response = await advanced_search(
            q="test",
            search_type=SearchType.ALL,
            limit=2,
            offset=1
        )

        assert "results" in response
        # Results should be limited and offset applied

    @pytest.mark.asyncio
    async def test_search_with_sorting(self):
        """Test search with sorting."""
        response = await advanced_search(
            q="test",
            search_type=SearchType.ALL,
            limit=10,
            offset=0,
            sort_by="name",
            order="desc"
        )

        assert "results" in response

    @pytest.mark.asyncio
    async def test_autocomplete(self):
        """Test autocomplete suggestions."""
        response = await autocomplete(q="jo", limit=5)

        assert "suggestions" in response
        assert isinstance(response["suggestions"], list)

    @pytest.mark.asyncio
    async def test_autocomplete_with_limit(self):
        """Test autocomplete with custom limit."""
        response = await autocomplete(q="te", limit=3)

        assert "suggestions" in response
        assert len(response["suggestions"]) <= 3

    @pytest.mark.asyncio
    async def test_get_filters(self):
        """Test getting available filters."""
        response = await get_filters()

        assert "types" in response
        assert "user_roles" in response
        assert "file_types" in response
        assert "sort_options" in response
        assert isinstance(response["types"], list)


class TestSearchTypes:
    """Tests for search type enum."""

    def test_search_type_values(self):
        """Test search type enum values."""
        assert SearchType.ALL.value == "all"
        assert SearchType.USERS.value == "users"
        assert SearchType.POSTS.value == "posts"
        assert SearchType.FILES.value == "files"
