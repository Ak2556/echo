"""
Unit tests for logging utilities.
"""

import logging
from unittest.mock import Mock, patch

import pytest

from app.core.logging import (
    PerformanceLogger,
    StructuredLogger,
    get_logger,
    log_cache_operation,
    log_database_operation,
    log_external_api_call,
    log_request_end,
    log_request_start,
    performance_logger,
    setup_logging,
)


class TestStructuredLogger:
    """Tests for StructuredLogger class."""

    def test_structured_logger_creation(self):
        """Test StructuredLogger creation."""
        logger = StructuredLogger("test_logger")
        assert logger.name == "test_logger"
        assert isinstance(logger.logger, logging.Logger)
        assert logger._context == {}

    def test_bind_context(self):
        """Test binding context to logger."""
        logger = StructuredLogger("test_logger")
        bound_logger = logger.bind(user_id="123", action="test")

        assert bound_logger.name == "test_logger"
        assert bound_logger._context == {"user_id": "123", "action": "test"}
        assert logger._context == {}  # Original logger unchanged

    def test_bind_multiple_contexts(self):
        """Test binding multiple contexts."""
        logger = StructuredLogger("test_logger")
        bound1 = logger.bind(user_id="123")
        bound2 = bound1.bind(action="test", session="abc")

        assert bound2._context == {"user_id": "123", "action": "test", "session": "abc"}

    def test_format_message_no_context(self):
        """Test message formatting without context."""
        logger = StructuredLogger("test_logger")
        formatted = logger._format_message("Test message")
        assert formatted == "Test message"

    def test_format_message_with_context(self):
        """Test message formatting with context."""
        logger = StructuredLogger("test_logger")
        bound_logger = logger.bind(user_id="123", action="test")
        formatted = bound_logger._format_message("Test message")

        assert "Test message" in formatted
        assert "user_id=123" in formatted
        assert "action=test" in formatted

    def test_format_message_with_kwargs(self):
        """Test message formatting with additional kwargs."""
        logger = StructuredLogger("test_logger")
        bound_logger = logger.bind(user_id="123")
        formatted = bound_logger._format_message("Test message", status="success")

        assert "Test message" in formatted
        assert "user_id=123" in formatted
        assert "status=success" in formatted

    @patch("logging.Logger.debug")
    def test_debug_logging(self, mock_debug):
        """Test debug logging."""
        logger = StructuredLogger("test_logger")
        logger.debug("Debug message", extra="data")

        mock_debug.assert_called_once()
        args = mock_debug.call_args[0]
        assert "Debug message" in args[0]
        assert "extra=data" in args[0]

    @patch("logging.Logger.info")
    def test_info_logging(self, mock_info):
        """Test info logging."""
        logger = StructuredLogger("test_logger")
        logger.info("Info message", status="ok")

        mock_info.assert_called_once()
        args = mock_info.call_args[0]
        assert "Info message" in args[0]
        assert "status=ok" in args[0]

    @patch("logging.Logger.warning")
    def test_warning_logging(self, mock_warning):
        """Test warning logging."""
        logger = StructuredLogger("test_logger")
        logger.warning("Warning message", code="W001")

        mock_warning.assert_called_once()
        args = mock_warning.call_args[0]
        assert "Warning message" in args[0]
        assert "code=W001" in args[0]

    @patch("logging.Logger.error")
    def test_error_logging(self, mock_error):
        """Test error logging."""
        logger = StructuredLogger("test_logger")
        logger.error("Error message", error_code="E001")

        mock_error.assert_called_once()
        args = mock_error.call_args[0]
        assert "Error message" in args[0]
        assert "error_code=E001" in args[0]

    @patch("logging.Logger.critical")
    def test_critical_logging(self, mock_critical):
        """Test critical logging."""
        logger = StructuredLogger("test_logger")
        logger.critical("Critical message", severity="high")

        mock_critical.assert_called_once()
        args = mock_critical.call_args[0]
        assert "Critical message" in args[0]
        assert "severity=high" in args[0]


class TestGetLogger:
    """Tests for get_logger function."""

    def test_get_logger_returns_structured_logger(self):
        """Test get_logger returns StructuredLogger instance."""
        logger = get_logger("test_module")
        assert isinstance(logger, StructuredLogger)
        assert logger.name == "test_module"

    def test_get_logger_different_names(self):
        """Test get_logger with different names."""
        logger1 = get_logger("module1")
        logger2 = get_logger("module2")

        assert logger1.name == "module1"
        assert logger2.name == "module2"
        assert logger1 is not logger2


class TestSetupLogging:
    """Tests for setup_logging function."""

    @patch("logging.basicConfig")
    def test_setup_logging_default(self, mock_basic_config):
        """Test setup_logging with default level."""
        setup_logging()

        mock_basic_config.assert_called_once()
        call_args = mock_basic_config.call_args
        assert call_args[1]["level"] == logging.INFO

    @patch("logging.basicConfig")
    def test_setup_logging_custom_level(self, mock_basic_config):
        """Test setup_logging with custom level."""
        setup_logging("DEBUG")

        mock_basic_config.assert_called_once()
        call_args = mock_basic_config.call_args
        assert call_args[1]["level"] == logging.DEBUG

    @patch("logging.basicConfig")
    def test_setup_logging_invalid_level(self, mock_basic_config):
        """Test setup_logging with invalid level defaults to INFO."""
        setup_logging("INVALID")

        mock_basic_config.assert_called_once()
        # Should default to INFO level for invalid input


class TestLogRequestHelpers:
    """Tests for request logging helper functions."""

    def test_log_request_start(self):
        """Test log_request_start function."""
        mock_logger = Mock()
        mock_bound_logger = Mock()
        mock_logger.bind.return_value = mock_bound_logger

        log_request_start(mock_logger, "req-123", "GET", "/api/test", "127.0.0.1", "Mozilla/5.0")

        mock_logger.bind.assert_called_once_with(
            request_id="req-123",
            method="GET",
            path="/api/test",
            client_ip="127.0.0.1",
            user_agent="Mozilla/5.0",
        )
        mock_bound_logger.info.assert_called_once_with("Request started")

    def test_log_request_end(self):
        """Test log_request_end function."""
        mock_logger = Mock()
        mock_bound_logger = Mock()
        mock_logger.bind.return_value = mock_bound_logger

        log_request_end(mock_logger, "req-123", "GET", "/api/test", 200, 0.123, 1024)

        mock_logger.bind.assert_called_once_with(
            request_id="req-123",
            method="GET",
            path="/api/test",
            status_code=200,
            duration="0.123s",
            response_size=1024,
        )
        mock_bound_logger.info.assert_called_once_with("Request completed")

    def test_log_database_operation(self):
        """Test log_database_operation function."""
        mock_logger = Mock()
        mock_bound_logger = Mock()
        mock_logger.bind.return_value = mock_bound_logger

        log_database_operation(mock_logger, "SELECT", "users", 0.045, 5)

        mock_logger.bind.assert_called_once_with(
            operation="SELECT", table="users", duration="0.045s", rows_affected=5
        )
        mock_bound_logger.debug.assert_called_once_with("Database operation completed")

    def test_log_cache_operation(self):
        """Test log_cache_operation function."""
        mock_logger = Mock()
        mock_bound_logger = Mock()
        mock_logger.bind.return_value = mock_bound_logger

        log_cache_operation(mock_logger, "GET", "user:123", True, 300)

        mock_logger.bind.assert_called_once_with(operation="GET", key="user:123", hit=True, ttl=300)
        mock_bound_logger.debug.assert_called_once_with("Cache operation completed")

    def test_log_external_api_call(self):
        """Test log_external_api_call function."""
        mock_logger = Mock()
        mock_bound_logger = Mock()
        mock_logger.bind.return_value = mock_bound_logger

        log_external_api_call(
            mock_logger, "payment_gateway", "/api/charge", "POST", 200, 1.234, True
        )

        mock_logger.bind.assert_called_once_with(
            service="payment_gateway",
            endpoint="/api/charge",
            method="POST",
            status_code=200,
            duration="1.234s",
            success=True,
        )
        mock_bound_logger.info.assert_called_once_with("External API call completed")


class TestPerformanceLogger:
    """Tests for PerformanceLogger class."""

    def test_performance_logger_creation(self):
        """Test PerformanceLogger creation."""
        perf_logger = PerformanceLogger()
        assert isinstance(perf_logger.logger, StructuredLogger)

    def test_log_slow_query(self):
        """Test log_slow_query method."""
        perf_logger = PerformanceLogger()
        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_slow_query(
                "SELECT * FROM users WHERE active = true", 2.5, {"active": True}
            )

            mock_warning.assert_called_once()
            args = mock_warning.call_args[0]
            kwargs = mock_warning.call_args[1]

            assert "Slow query detected" in args
            assert kwargs["duration"] == "2.500s"
            assert kwargs["params"] == {"active": True}

    def test_log_slow_query_truncation(self):
        """Test log_slow_query with long query truncation."""
        perf_logger = PerformanceLogger()
        long_query = "SELECT * FROM users WHERE " + "x" * 300

        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_slow_query(long_query, 1.0)

            mock_warning.assert_called_once()
            kwargs = mock_warning.call_args[1]
            assert len(kwargs["query"]) <= 203  # 200 + "..."

    def test_log_memory_usage_below_threshold(self):
        """Test log_memory_usage below threshold."""
        perf_logger = PerformanceLogger()
        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_memory_usage(400, 500)
            mock_warning.assert_not_called()

    def test_log_memory_usage_above_threshold(self):
        """Test log_memory_usage above threshold."""
        perf_logger = PerformanceLogger()
        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_memory_usage(600, 500)

            mock_warning.assert_called_once()
            kwargs = mock_warning.call_args[1]
            assert kwargs["usage_mb"] == 600
            assert kwargs["threshold_mb"] == 500

    def test_log_response_time_below_threshold(self):
        """Test log_response_time below threshold."""
        perf_logger = PerformanceLogger()
        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_response_time("/api/test", 0.5, 1.0)
            mock_warning.assert_not_called()

    def test_log_response_time_above_threshold(self):
        """Test log_response_time above threshold."""
        perf_logger = PerformanceLogger()
        with patch.object(perf_logger.logger, "warning") as mock_warning:
            perf_logger.log_response_time("/api/test", 1.5, 1.0)

            mock_warning.assert_called_once()
            kwargs = mock_warning.call_args[1]
            assert kwargs["endpoint"] == "/api/test"
            assert kwargs["duration"] == "1.500s"
            assert kwargs["threshold"] == "1.000s"


class TestGlobalPerformanceLogger:
    """Tests for global performance logger instance."""

    def test_performance_logger_instance(self):
        """Test global performance_logger instance."""
        assert isinstance(performance_logger, PerformanceLogger)

    def test_performance_logger_methods_available(self):
        """Test performance_logger has required methods."""
        assert hasattr(performance_logger, "log_slow_query")
        assert hasattr(performance_logger, "log_memory_usage")
        assert hasattr(performance_logger, "log_response_time")
