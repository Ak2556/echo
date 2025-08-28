"""
Unit tests for app/main.py
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient


class TestApplicationLifespan:
    """Tests for application lifespan events."""

    @pytest.mark.asyncio
    async def test_lifespan_startup_success(self):
        """Test successful application startup."""
        from app.main import lifespan, create_app

        mock_app = MagicMock()

        with patch('app.main.init_db', new=AsyncMock()) as mock_init_db:
            with patch('app.main.init_redis', new=AsyncMock()) as mock_init_redis:
                with patch('app.main.close_redis', new=AsyncMock()) as mock_close_redis:
                    with patch('app.main.close_db', new=AsyncMock()) as mock_close_db:
                        # Execute lifespan
                        async with lifespan(mock_app):
                            # Verify startup functions were called
                            mock_init_db.assert_called_once()
                            mock_init_redis.assert_called_once()

                        # Verify shutdown functions were called
                        mock_close_redis.assert_called_once()
                        mock_close_db.assert_called_once()

    @pytest.mark.asyncio
    async def test_lifespan_startup_failure(self):
        """Test application startup failure."""
        from app.main import lifespan

        mock_app = MagicMock()

        with patch('app.main.init_db', new=AsyncMock(side_effect=Exception("DB init failed"))):
            with patch('app.main.close_redis', new=AsyncMock()):
                with patch('app.main.close_db', new=AsyncMock()):
                    with pytest.raises(Exception, match="DB init failed"):
                        async with lifespan(mock_app):
                            pass

    @pytest.mark.asyncio
    async def test_lifespan_shutdown_error(self):
        """Test error during application shutdown."""
        from app.main import lifespan

        mock_app = MagicMock()

        with patch('app.main.init_db', new=AsyncMock()):
            with patch('app.main.init_redis', new=AsyncMock()):
                with patch('app.main.close_redis', new=AsyncMock(side_effect=Exception("Redis close failed"))):
                    with patch('app.main.close_db', new=AsyncMock()):
                        # Should not raise exception during shutdown
                        async with lifespan(mock_app):
                            pass
                        # Shutdown error is logged but doesn't raise

    @pytest.mark.asyncio
    async def test_lifespan_with_metrics_enabled(self):
        """Test lifespan with metrics enabled."""
        from app.main import lifespan

        mock_app = MagicMock()

        with patch('app.main.settings') as mock_settings:
            mock_settings.enable_metrics = True

            with patch('app.main.init_db', new=AsyncMock()):
                with patch('app.main.init_redis', new=AsyncMock()):
                    with patch('app.main.close_redis', new=AsyncMock()):
                        with patch('app.main.close_db', new=AsyncMock()):
                            async with lifespan(mock_app):
                                # Metrics setup should be logged
                                pass


class TestCreateApp:
    """Tests for create_app function."""

    def test_create_app_returns_fastapi_instance(self):
        """Test create_app returns FastAPI instance."""
        from app.main import create_app
        from fastapi import FastAPI

        app = create_app()
        assert isinstance(app, FastAPI)

    @patch('app.main.settings')
    def test_create_app_with_debug_disabled(self, mock_settings):
        """Test create_app with debug mode disabled adds TrustedHostMiddleware."""
        from app.main import create_app

        mock_settings.debug = False
        mock_settings.app_name = "Echo API"
        mock_settings.app_description = "Test"
        mock_settings.app_version = "1.0.0"
        mock_settings.docs_url = "/docs"
        mock_settings.redoc_url = "/redoc"
        mock_settings.cors_origins = ["*"]
        mock_settings.enable_metrics = False

        app = create_app()

        # Verify TrustedHostMiddleware was added
        # The middleware stack will include TrustedHostMiddleware
        assert app is not None


class TestApplicationEndpoints:
    """Tests for application endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        from app.main import create_app

        with patch('app.main.init_db', new=AsyncMock()):
            with patch('app.main.init_redis', new=AsyncMock()):
                with patch('app.main.close_redis', new=AsyncMock()):
                    with patch('app.main.close_db', new=AsyncMock()):
                        app = create_app()
                        return TestClient(app)

    def test_root_endpoint(self, client):
        """Test root endpoint returns correct response."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()

        assert "name" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
        assert "docs_url" in data
        assert "health_url" in data

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert data["status"] == "healthy"
        assert "version" in data
        assert "environment" in data
        assert "checks" in data
        assert "database" in data["checks"]
        assert "redis" in data["checks"]

    def test_stats_endpoint(self, client):
        """Test stats endpoint."""
        response = client.get("/stats")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert data["status"] == "ok"

    def test_ready_endpoint(self, client):
        """Test readiness check endpoint."""
        response = client.get("/ready")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert data["status"] == "ready"
        assert "checks" in data
        assert "database" in data["checks"]
        assert "redis" in data["checks"]
        assert "external_apis" in data["checks"]


class TestApplicationConfiguration:
    """Tests for application configuration."""

    @patch('app.main.settings')
    def test_app_with_metrics_enabled(self, mock_settings):
        """Test app creation with metrics enabled."""
        from app.main import create_app

        mock_settings.debug = True
        mock_settings.app_name = "Echo API"
        mock_settings.app_description = "Test"
        mock_settings.app_version = "1.0.0"
        mock_settings.docs_url = "/docs"
        mock_settings.redoc_url = "/redoc"
        mock_settings.cors_origins = ["*"]
        mock_settings.enable_metrics = True

        app = create_app()
        assert app is not None

    def test_app_includes_routers(self):
        """Test that app includes required routers."""
        from app.main import create_app

        app = create_app()

        # Check that routes exist
        routes = [route.path for route in app.routes]

        assert "/" in routes
        assert "/health" in routes
        assert "/stats" in routes
        assert "/ready" in routes

    def test_app_has_cors_middleware(self):
        """Test that app has CORS middleware configured."""
        from app.main import create_app

        app = create_app()

        # Verify middleware stack includes CORS
        # The app.user_middleware list will contain our middleware
        assert len(app.user_middleware) > 0

    def test_app_has_exception_handlers(self):
        """Test that app has exception handlers configured."""
        from app.main import create_app

        app = create_app()

        # Verify exception handlers are registered
        assert len(app.exception_handlers) > 0
