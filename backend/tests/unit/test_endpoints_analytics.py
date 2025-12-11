"""
Unit tests for analytics endpoints.
"""

import pytest

from app.api.v1.endpoints.analytics import (
    export_analytics,
    get_analytics,
    get_analytics_overview,
    get_popular_content,
    get_realtime_stats,
    get_traffic_stats,
    get_user_engagement,
)


class TestAnalyticsEndpoints:
    """Tests for analytics endpoints."""

    @pytest.mark.asyncio
    async def test_get_analytics(self):
        """Test getting basic analytics."""
        response = await get_analytics()

        assert "daily_active_users" in response
        assert "monthly_active_users" in response
        assert "total_sessions" in response
        assert isinstance(response["daily_active_users"], int)

    @pytest.mark.asyncio
    async def test_get_analytics_overview(self):
        """Test getting analytics overview."""
        response = await get_analytics_overview()

        assert "daily_active_users" in response
        assert "monthly_active_users" in response
        assert "bounce_rate" in response
        assert "conversion_rate" in response

    @pytest.mark.asyncio
    async def test_get_traffic_stats_no_dates(self):
        """Test getting traffic stats without dates."""
        response = await get_traffic_stats()

        assert "pageviews" in response
        assert "unique_visitors" in response
        assert "returning_visitors" in response
        assert isinstance(response["pageviews"], list)

    @pytest.mark.asyncio
    async def test_get_traffic_stats_with_dates(self):
        """Test getting traffic stats with date range."""
        response = await get_traffic_stats(start_date="2025-10-01", end_date="2025-10-05")

        assert "pageviews" in response
        assert len(response["pageviews"]) > 0

    @pytest.mark.asyncio
    async def test_get_user_engagement(self):
        """Test getting user engagement metrics."""
        response = await get_user_engagement()

        assert "total_posts" in response
        assert "total_comments" in response
        assert "total_likes" in response
        assert "engagement_rate" in response

    @pytest.mark.asyncio
    async def test_get_popular_content_default(self):
        """Test getting popular content with default limit."""
        response = await get_popular_content()

        assert "posts" in response
        assert isinstance(response["posts"], list)
        assert len(response["posts"]) > 0

    @pytest.mark.asyncio
    async def test_get_popular_content_custom_limit(self):
        """Test getting popular content with custom limit."""
        response = await get_popular_content(limit=5)

        assert "posts" in response
        assert isinstance(response["posts"], list)

    @pytest.mark.asyncio
    async def test_export_analytics_csv(self):
        """Test exporting analytics as CSV."""
        response = await export_analytics(format="csv")

        assert response["success"] is True
        assert "download_url" in response
        assert ".csv" in response["download_url"]

    @pytest.mark.asyncio
    async def test_export_analytics_json(self):
        """Test exporting analytics as JSON."""
        response = await export_analytics(format="json")

        assert response["success"] is True
        assert ".json" in response["download_url"]

    @pytest.mark.asyncio
    async def test_export_analytics_pdf(self):
        """Test exporting analytics as PDF."""
        response = await export_analytics(format="pdf")

        assert response["success"] is True
        assert ".pdf" in response["download_url"]

    @pytest.mark.asyncio
    async def test_get_realtime_stats(self):
        """Test getting real-time statistics."""
        response = await get_realtime_stats()

        assert "active_users_now" in response
        assert "current_sessions" in response
        assert "pageviews_last_minute" in response
        assert "top_pages" in response
        assert isinstance(response["top_pages"], list)
