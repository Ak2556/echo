"""
Unit tests for middleware components.
"""

import pytest
import time
from unittest.mock import Mock, patch, AsyncMock
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.core.middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    PerformanceMiddleware,
    RequestSizeLimitMiddleware,
    HealthCheckMiddleware,
    CORSMiddleware,
)


class TestSecurityHeadersMiddleware:
    """Tests for SecurityHeadersMiddleware."""

    @pytest.mark.asyncio
    async def test_security_headers_added(self):
        """Test security headers are added to response."""
        middleware = SecurityHeadersMiddleware(None)
        
        # Mock request and response
        request = Mock(spec=Request)
        response = Mock(spec=Response)
        response.headers = {}
        
        # Mock call_next
        async def mock_call_next(req):
            return response
        
        # Call middleware
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify security headers were added
        assert result.headers["X-Content-Type-Options"] == "nosniff"
        assert result.headers["X-Frame-Options"] == "DENY"
        assert result.headers["X-XSS-Protection"] == "1; mode=block"
        assert result.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "Permissions-Policy" in result.headers

    @pytest.mark.asyncio
    async def test_security_headers_production(self):
        """Test security headers in production mode."""
        with patch('app.core.middleware.settings') as mock_settings:
            mock_settings.debug = False
            
            middleware = SecurityHeadersMiddleware(None)
            request = Mock(spec=Request)
            response = Mock(spec=Response)
            response.headers = {}
            
            async def mock_call_next(req):
                return response
            
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify HSTS header is added in production
            assert "Strict-Transport-Security" in result.headers

    @pytest.mark.asyncio
    async def test_security_headers_debug_mode(self):
        """Test security headers in debug mode."""
        with patch('app.core.middleware.settings') as mock_settings:
            mock_settings.debug = True
            
            middleware = SecurityHeadersMiddleware(None)
            request = Mock(spec=Request)
            response = Mock(spec=Response)
            response.headers = {}
            
            async def mock_call_next(req):
                return response
            
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify HSTS header is not added in debug mode
            assert "Strict-Transport-Security" not in result.headers


class TestRequestLoggingMiddleware:
    """Tests for RequestLoggingMiddleware."""

    @pytest.mark.asyncio
    async def test_request_logging_success(self):
        """Test successful request logging."""
        middleware = RequestLoggingMiddleware(None)
        
        # Mock request
        request = Mock(spec=Request)
        request.method = "GET"
        request.url.path = "/api/test"
        request.query_params = {}
        request.client.host = "127.0.0.1"
        request.headers = {"user-agent": "test-agent"}
        request.state = Mock()
        
        # Mock response
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {"content-length": "100"}
        
        async def mock_call_next(req):
            return response
        
        with patch('app.core.middleware.logger') as mock_logger:
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify request ID was set
            assert hasattr(request.state, 'request_id')
            
            # Verify response headers include request ID
            assert "X-Request-ID" in result.headers
            
            # Verify logging was called
            assert mock_logger.info.call_count >= 2  # Start and end

    @pytest.mark.asyncio
    async def test_request_logging_exception(self):
        """Test request logging with exception."""
        middleware = RequestLoggingMiddleware(None)
        
        request = Mock(spec=Request)
        request.method = "POST"
        request.url.path = "/api/error"
        request.query_params = {}
        request.client.host = "127.0.0.1"
        request.headers = {"user-agent": "test-agent"}
        request.state = Mock()
        
        async def mock_call_next(req):
            raise Exception("Test error")
        
        with patch('app.core.middleware.logger') as mock_logger:
            with pytest.raises(Exception, match="Test error"):
                await middleware.dispatch(request, mock_call_next)
            
            # Verify error was logged
            mock_logger.error.assert_called_once()

    @pytest.mark.asyncio
    async def test_request_logging_no_client(self):
        """Test request logging when client is None."""
        middleware = RequestLoggingMiddleware(None)
        
        request = Mock(spec=Request)
        request.method = "GET"
        request.url.path = "/api/test"
        request.query_params = {}
        request.client = None
        request.headers = {}
        request.state = Mock()
        
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        with patch('app.core.middleware.logger'):
            result = await middleware.dispatch(request, mock_call_next)
            assert result is not None


class TestPerformanceMiddleware:
    """Tests for PerformanceMiddleware."""

    @pytest.mark.asyncio
    async def test_performance_headers_added(self):
        """Test performance headers are added."""
        middleware = PerformanceMiddleware(None)
        
        request = Mock(spec=Request)
        request.url.path = "/api/test"
        request.method = "GET"
        
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {}
        
        async def mock_call_next(req):
            # Simulate some processing time
            await asyncio.sleep(0.01)
            return response
        
        import asyncio
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify response time header was added
        assert "X-Response-Time" in result.headers
        assert result.headers["X-Response-Time"].endswith("s")

    @pytest.mark.asyncio
    async def test_performance_slow_request_logging(self):
        """Test slow request logging."""
        middleware = PerformanceMiddleware(None)
        
        request = Mock(spec=Request)
        request.url.path = "/api/slow"
        request.method = "GET"
        
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {}
        
        async def mock_call_next(req):
            # Simulate slow processing
            await asyncio.sleep(1.1)  # More than 1 second
            return response
        
        import asyncio
        with patch('app.core.middleware.logger') as mock_logger:
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify slow request was logged
            mock_logger.warning.assert_called_once()
            args = mock_logger.warning.call_args[0]
            assert "Slow request detected" in args[0]

    @pytest.mark.asyncio
    async def test_performance_fast_request_no_warning(self):
        """Test fast request doesn't trigger warning."""
        middleware = PerformanceMiddleware(None)
        
        request = Mock(spec=Request)
        request.url.path = "/api/fast"
        request.method = "GET"
        
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        with patch('app.core.middleware.logger') as mock_logger:
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify no warning was logged
            mock_logger.warning.assert_not_called()


class TestRequestSizeLimitMiddleware:
    """Tests for RequestSizeLimitMiddleware."""

    @pytest.mark.asyncio
    async def test_request_size_within_limit(self):
        """Test request within size limit."""
        middleware = RequestSizeLimitMiddleware(None, max_size=1000)
        
        request = Mock(spec=Request)
        request.headers = {"content-length": "500"}
        
        response = Mock(spec=Response)
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        assert result is response

    @pytest.mark.asyncio
    async def test_request_size_exceeds_limit(self):
        """Test request exceeding size limit."""
        middleware = RequestSizeLimitMiddleware(None, max_size=1000)
        
        request = Mock(spec=Request)
        request.headers = {"content-length": "2000"}
        
        async def mock_call_next(req):
            return Mock(spec=Response)
        
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify 413 response is returned
        assert isinstance(result, JSONResponse)
        assert result.status_code == 413

    @pytest.mark.asyncio
    async def test_request_size_no_content_length(self):
        """Test request without content-length header."""
        middleware = RequestSizeLimitMiddleware(None, max_size=1000)
        
        request = Mock(spec=Request)
        request.headers = {}
        
        response = Mock(spec=Response)
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        assert result is response

    @pytest.mark.asyncio
    async def test_request_size_default_limit(self):
        """Test request size with default limit."""
        with patch('app.core.middleware.settings') as mock_settings:
            mock_settings.api_max_request_size = 5000
            
            middleware = RequestSizeLimitMiddleware(None)
            
            request = Mock(spec=Request)
            request.headers = {"content-length": "3000"}
            
            response = Mock(spec=Response)
            
            async def mock_call_next(req):
                return response
            
            result = await middleware.dispatch(request, mock_call_next)
            assert result is response


class TestHealthCheckMiddleware:
    """Tests for HealthCheckMiddleware."""

    @pytest.mark.asyncio
    async def test_health_check_headers_added(self):
        """Test health check headers are added."""
        middleware = HealthCheckMiddleware(None)
        
        request = Mock(spec=Request)
        response = Mock(spec=Response)
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        with patch('app.core.middleware.settings') as mock_settings:
            mock_settings.app_name = "Test App"
            mock_settings.app_version = "1.0.0"
            mock_settings.environment = "test"
            
            result = await middleware.dispatch(request, mock_call_next)
            
            # Verify health headers were added
            assert result.headers["X-Service-Name"] == "Test App"
            assert result.headers["X-Service-Version"] == "1.0.0"
            assert result.headers["X-Environment"] == "test"


class TestCORSMiddleware:
    """Tests for CORSMiddleware."""

    @pytest.mark.asyncio
    async def test_cors_preflight_request(self):
        """Test CORS preflight request handling."""
        middleware = CORSMiddleware(
            None,
            allow_origins=["http://localhost:3000"],
            allow_methods=["GET", "POST"],
            allow_headers=["Content-Type"]
        )
        
        request = Mock(spec=Request)
        request.method = "OPTIONS"
        request.headers = {"origin": "http://localhost:3000"}
        
        result = await middleware.dispatch(request, lambda req: None)
        
        # Verify preflight response
        assert isinstance(result, Response)
        assert result.status_code == 200
        assert result.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        assert "GET" in result.headers["Access-Control-Allow-Methods"]
        assert "POST" in result.headers["Access-Control-Allow-Methods"]

    @pytest.mark.asyncio
    async def test_cors_actual_request(self):
        """Test CORS actual request handling."""
        middleware = CORSMiddleware(
            None,
            allow_origins=["http://localhost:3000"],
            allow_credentials=True
        )
        
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {"origin": "http://localhost:3000"}
        
        response = Mock(spec=Response)
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify CORS headers were added
        assert result.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        assert result.headers["Access-Control-Allow-Credentials"] == "true"

    @pytest.mark.asyncio
    async def test_cors_wildcard_origin(self):
        """Test CORS with wildcard origin."""
        middleware = CORSMiddleware(None, allow_origins=["*"])
        
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {}
        
        response = Mock(spec=Response)
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify wildcard origin is set
        assert result.headers["Access-Control-Allow-Origin"] == "*"

    @pytest.mark.asyncio
    async def test_cors_origin_not_allowed(self):
        """Test CORS with origin not in allowed list."""
        middleware = CORSMiddleware(
            None,
            allow_origins=["http://localhost:3000"]
        )
        
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {"origin": "http://evil.com"}
        
        response = Mock(spec=Response)
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify origin header is not set for disallowed origin
        assert "Access-Control-Allow-Origin" not in result.headers

    @pytest.mark.asyncio
    async def test_cors_expose_headers(self):
        """Test CORS with exposed headers."""
        middleware = CORSMiddleware(
            None,
            allow_origins=["*"],
            expose_headers=["X-Custom-Header", "X-Another-Header"]
        )
        
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {}
        
        response = Mock(spec=Response)
        response.headers = {}
        
        async def mock_call_next(req):
            return response
        
        result = await middleware.dispatch(request, mock_call_next)
        
        # Verify exposed headers are set
        exposed = result.headers["Access-Control-Expose-Headers"]
        assert "X-Custom-Header" in exposed
        assert "X-Another-Header" in exposed

    @pytest.mark.asyncio
    async def test_cors_max_age(self):
        """Test CORS max age setting."""
        middleware = CORSMiddleware(None, allow_origins=["*"], max_age=3600)
        
        request = Mock(spec=Request)
        request.method = "OPTIONS"
        request.headers = {}
        
        result = await middleware.dispatch(request, lambda req: None)
        
        # Verify max age is set
        assert result.headers["Access-Control-Max-Age"] == "3600"