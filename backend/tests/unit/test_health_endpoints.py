"""
Unit tests for health endpoints.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.api.v1.endpoints.health import router


class TestHealthEndpoints:
    """Tests for health endpoint functions."""

    @pytest.mark.asyncio
    async def test_health_check_basic(self):
        """Test basic health check endpoint."""
        from app.api.v1.endpoints.health import health_check
        
        with patch('app.api.v1.endpoints.health.settings') as mock_settings:
            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"
            
            result = await health_check()
            
            assert result["success"] is True
            assert result["data"]["status"] == "healthy"
            assert result["data"]["version"] == "1.0.0"
            assert result["data"]["environment"] == "test"
            assert "timestamp" in result["data"]

    @pytest.mark.asyncio
    async def test_readiness_check_healthy(self):
        """Test readiness check when all services are healthy."""
        from app.api.v1.endpoints.health import readiness_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True
        
        with patch('app.api.v1.endpoints.health.db_health_check') as mock_db_health, \
             patch('app.api.v1.endpoints.health.settings') as mock_settings:
            
            mock_db_health.return_value = True
            mock_settings.feature_ai_chat = False
            mock_settings.app_version = "1.0.0"
            
            result = await readiness_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["status"] == "ready"
            assert result["data"]["checks"]["database"]["status"] == "healthy"
            assert result["data"]["checks"]["redis"]["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_readiness_check_database_unhealthy(self):
        """Test readiness check when database is unhealthy."""
        from app.api.v1.endpoints.health import readiness_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True
        
        with patch('app.api.v1.endpoints.health.db_health_check') as mock_db_health, \
             patch('app.api.v1.endpoints.health.settings') as mock_settings:
            
            mock_db_health.return_value = False
            mock_settings.feature_ai_chat = False
            mock_settings.app_version = "1.0.0"
            
            result = await readiness_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["status"] == "not_ready"
            assert result["data"]["checks"]["database"]["status"] == "unhealthy"

    @pytest.mark.asyncio
    async def test_readiness_check_redis_unhealthy(self):
        """Test readiness check when Redis is unhealthy."""
        from app.api.v1.endpoints.health import readiness_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = False
        
        with patch('app.api.v1.endpoints.health.db_health_check') as mock_db_health, \
             patch('app.api.v1.endpoints.health.settings') as mock_settings:
            
            mock_db_health.return_value = True
            mock_settings.feature_ai_chat = False
            mock_settings.app_version = "1.0.0"
            
            result = await readiness_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["status"] == "not_ready"
            assert result["data"]["checks"]["redis"]["status"] == "unhealthy"

    @pytest.mark.asyncio
    async def test_readiness_check_with_ai_service(self):
        """Test readiness check with AI service enabled."""
        from app.api.v1.endpoints.health import readiness_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True
        
        with patch('app.api.v1.endpoints.health.db_health_check') as mock_db_health, \
             patch('app.api.v1.endpoints.health.settings') as mock_settings:
            
            mock_db_health.return_value = True
            mock_settings.feature_ai_chat = True
            mock_settings.openrouter_api_key = "test_key"
            mock_settings.app_version = "1.0.0"
            
            result = await readiness_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert "ai_service" in result["data"]["checks"]
            assert result["data"]["checks"]["ai_service"]["status"] == "configured"

    @pytest.mark.asyncio
    async def test_readiness_check_exception_handling(self):
        """Test readiness check with exception handling."""
        from app.api.v1.endpoints.health import readiness_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.side_effect = Exception("Redis connection failed")
        
        with patch('app.api.v1.endpoints.health.db_health_check') as mock_db_health, \
             patch('app.api.v1.endpoints.health.settings') as mock_settings:
            
            mock_db_health.side_effect = Exception("Database connection failed")
            mock_settings.feature_ai_chat = False
            mock_settings.app_version = "1.0.0"
            
            result = await readiness_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["status"] == "not_ready"
            assert result["data"]["checks"]["database"]["status"] == "error"
            assert result["data"]["checks"]["redis"]["status"] == "error"

    @pytest.mark.asyncio
    async def test_liveness_check(self):
        """Test liveness check endpoint."""
        from app.api.v1.endpoints.health import liveness_check
        
        result = await liveness_check()
        
        assert result["success"] is True
        assert result["data"]["status"] == "alive"
        assert "timestamp" in result["data"]
        assert "uptime" in result["data"]

    @pytest.mark.asyncio
    async def test_detailed_health_check_success(self):
        """Test detailed health check when all services are healthy."""
        from app.api.v1.endpoints.health import detailed_health_check

        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True

        with patch('app.api.v1.endpoints.health.settings') as mock_settings, \
             patch('builtins.__import__') as mock_import:

            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"

            # Mock psutil import
            mock_psutil = Mock()
            mock_psutil.cpu_percent.return_value = 25.0
            mock_psutil.virtual_memory.return_value.percent = 60.0
            mock_psutil.disk_usage.return_value.percent = 40.0

            def import_mock(name, *args, **kwargs):
                if name == 'psutil':
                    return mock_psutil
                return __import__(name, *args, **kwargs)

            mock_import.side_effect = import_mock

            result = await detailed_health_check(mock_db, mock_redis)

            assert result["success"] is True
            assert result["data"]["status"] == "healthy"
            assert "checks" in result["data"]
            assert "database" in result["data"]["checks"]
            assert "redis" in result["data"]["checks"]
            assert "system" in result["data"]["checks"]
            assert "total_check_time_ms" in result["data"]

    @pytest.mark.asyncio
    async def test_detailed_health_check_database_error(self):
        """Test detailed health check with database error."""
        from app.api.v1.endpoints.health import detailed_health_check
        
        mock_db = AsyncMock()
        mock_db.execute.side_effect = Exception("Database query failed")
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True
        
        with patch('app.api.v1.endpoints.health.settings') as mock_settings:
            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"
            
            result = await detailed_health_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["checks"]["database"]["status"] == "error"
            assert "error" in result["data"]["checks"]["database"]

    @pytest.mark.asyncio
    async def test_detailed_health_check_redis_error(self):
        """Test detailed health check with Redis error."""
        from app.api.v1.endpoints.health import detailed_health_check
        
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.side_effect = Exception("Redis connection failed")
        
        with patch('app.api.v1.endpoints.health.settings') as mock_settings:
            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"
            
            result = await detailed_health_check(mock_db, mock_redis)
            
            assert result["success"] is True
            assert result["data"]["checks"]["redis"]["status"] == "error"
            assert "error" in result["data"]["checks"]["redis"]

    @pytest.mark.asyncio
    async def test_detailed_health_check_no_psutil(self):
        """Test detailed health check when psutil is not available."""
        from app.api.v1.endpoints.health import detailed_health_check

        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.health_check.return_value = True

        with patch('app.api.v1.endpoints.health.settings') as mock_settings, \
             patch('builtins.__import__') as mock_import:

            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"

            # Mock ImportError for psutil
            def import_mock(name, *args, **kwargs):
                if name == 'psutil':
                    raise ImportError("psutil not available")
                return __import__(name, *args, **kwargs)

            mock_import.side_effect = import_mock

            result = await detailed_health_check(mock_db, mock_redis)

            assert result["success"] is True
            assert result["data"]["checks"]["system"]["status"] == "psutil_not_available"


class TestHealthRouterConfiguration:
    """Tests for health router configuration."""

    def test_router_exists(self):
        """Test that router is properly configured."""
        assert router is not None
        assert len(router.routes) > 0

    def test_router_endpoints(self):
        """Test that all expected endpoints are registered."""
        route_paths = [route.path for route in router.routes]
        
        expected_paths = ["/", "/ready", "/live", "/detailed"]
        for path in expected_paths:
            assert path in route_paths

    def test_router_methods(self):
        """Test that all endpoints use GET method."""
        for route in router.routes:
            if hasattr(route, 'methods'):
                assert "GET" in route.methods


class TestHealthEndpointIntegration:
    """Integration tests for health endpoints."""

    @pytest.mark.asyncio
    async def test_health_check_performance(self):
        """Test that health checks are fast."""
        from app.api.v1.endpoints.health import health_check, liveness_check
        import time
        
        # Basic health check should be very fast
        start_time = time.time()
        await health_check()
        duration = time.time() - start_time
        assert duration < 0.1  # Should complete in under 100ms
        
        # Liveness check should also be fast
        start_time = time.time()
        await liveness_check()
        duration = time.time() - start_time
        assert duration < 0.1  # Should complete in under 100ms

    @pytest.mark.asyncio
    async def test_health_endpoints_return_consistent_format(self):
        """Test that all health endpoints return consistent response format."""
        from app.api.v1.endpoints.health import health_check, liveness_check
        
        # Test basic health check format
        result = await health_check()
        assert "success" in result
        assert "data" in result
        assert "message" in result
        assert result["success"] is True
        
        # Test liveness check format
        result = await liveness_check()
        assert "success" in result
        assert "data" in result
        assert "message" in result
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_health_endpoints_include_timestamps(self):
        """Test that health endpoints include timestamps."""
        from app.api.v1.endpoints.health import health_check, liveness_check
        
        # Basic health check should include timestamp
        result = await health_check()
        assert "timestamp" in result["data"]
        assert isinstance(result["data"]["timestamp"], (int, float))
        
        # Liveness check should include timestamp
        result = await liveness_check()
        assert "timestamp" in result["data"]
        assert isinstance(result["data"]["timestamp"], (int, float))

    @pytest.mark.asyncio
    async def test_health_endpoints_include_version_info(self):
        """Test that health endpoints include version information."""
        from app.api.v1.endpoints.health import health_check

        with patch('app.api.v1.endpoints.health.settings') as mock_settings:
            mock_settings.app_version = "2.0.0"
            mock_settings.environment = "production"

            result = await health_check()

            assert result["data"]["version"] == "2.0.0"
            assert result["data"]["environment"] == "production"

    @pytest.mark.asyncio
    async def test_health_detailed_ai_service_exception(self):
        """Test detailed health check handles AI service exception."""
        from app.api.v1.endpoints.health import detailed_health_check
        from app.core.database import get_db
        from app.core.redis import get_redis
        from unittest.mock import AsyncMock

        # Mock database and redis
        mock_db = AsyncMock()
        mock_redis = AsyncMock()
        mock_redis.ping = AsyncMock(return_value=True)

        with patch('app.api.v1.endpoints.health.settings') as mock_settings:
            # Make accessing openrouter_api_key raise an exception
            type(mock_settings).openrouter_api_key = property(lambda self: (_ for _ in ()).throw(Exception("API key error")))
            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"

            result = await detailed_health_check(db=mock_db, redis=mock_redis)

            # Should handle exception gracefully
            assert result["success"] is True
            assert "ai_service" in result["data"]["checks"]
            assert result["data"]["checks"]["ai_service"]["status"] == "error"
            assert "API key error" in result["data"]["checks"]["ai_service"]["error"]