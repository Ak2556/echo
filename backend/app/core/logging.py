"""
Production-grade logging configuration with structured logging,
log rotation, and monitoring integration.
"""

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Any, Dict

import structlog


# Simple structured logger implementation
class StructuredLogger:
    """Structured logger with context management."""

    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(name)
        self._context = {}

    def bind(self, **kwargs) -> "StructuredLogger":
        """Bind context to logger."""
        new_logger = StructuredLogger(self.name)
        new_logger.logger = self.logger
        new_logger._context = {**self._context, **kwargs}
        return new_logger

    def _format_message(self, message: str, **kwargs) -> str:
        """Format message with context."""
        context = {**self._context, **kwargs}
        if context:
            context_str = " ".join(f"{k}={v}" for k, v in context.items())
            return f"{message} | {context_str}"
        return message

    def debug(self, message: str, **kwargs) -> None:
        """Log debug message."""
        self.logger.debug(self._format_message(message, **kwargs))

    def info(self, message: str, **kwargs) -> None:
        """Log info message."""
        self.logger.info(self._format_message(message, **kwargs))

    def warning(self, message: str, **kwargs) -> None:
        """Log warning message."""
        self.logger.warning(self._format_message(message, **kwargs))

    def error(self, message: str, **kwargs) -> None:
        """Log error message."""
        self.logger.error(self._format_message(message, **kwargs))

    def critical(self, message: str, **kwargs) -> None:
        """Log critical message."""
        self.logger.critical(self._format_message(message, **kwargs))


def get_logger(name: str) -> StructuredLogger:
    """Get structured logger instance."""
    return StructuredLogger(name)


def setup_logging(log_level: str = "INFO") -> None:
    """Setup basic logging configuration."""
    # Validate log level
    level_name = log_level.upper()
    if not hasattr(logging, level_name):
        # Default to INFO for invalid levels
        level_name = "INFO"

    logging.basicConfig(
        level=getattr(logging, level_name),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


# Request logging helpers


def log_request_start(
    logger: StructuredLogger,
    request_id: str,
    method: str,
    path: str,
    client_ip: str,
    user_agent: str,
) -> None:
    """Log request start with context."""
    logger.bind(
        request_id=request_id,
        method=method,
        path=path,
        client_ip=client_ip,
        user_agent=user_agent,
    ).info("Request started")


def log_request_end(
    logger: StructuredLogger,
    request_id: str,
    method: str,
    path: str,
    status_code: int,
    duration: float,
    response_size: int = None,
) -> None:
    """Log request completion with metrics."""
    logger.bind(
        request_id=request_id,
        method=method,
        path=path,
        status_code=status_code,
        duration=f"{duration:.3f}s",
        response_size=response_size,
    ).info("Request completed")


def log_database_operation(
    logger: StructuredLogger,
    operation: str,
    table: str,
    duration: float,
    rows_affected: int = None,
) -> None:
    """Log database operation with metrics."""
    logger.bind(
        operation=operation,
        table=table,
        duration=f"{duration:.3f}s",
        rows_affected=rows_affected,
    ).debug("Database operation completed")


def log_cache_operation(
    logger: StructuredLogger,
    operation: str,
    key: str,
    hit: bool = None,
    ttl: int = None,
) -> None:
    """Log cache operation."""
    logger.bind(
        operation=operation,
        key=key,
        hit=hit,
        ttl=ttl,
    ).debug("Cache operation completed")


def log_external_api_call(
    logger: StructuredLogger,
    service: str,
    endpoint: str,
    method: str,
    status_code: int,
    duration: float,
    success: bool,
) -> None:
    """Log external API call."""
    logger.bind(
        service=service,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        duration=f"{duration:.3f}s",
        success=success,
    ).info("External API call completed")


# Performance logging


class PerformanceLogger:
    """Logger for performance metrics."""

    def __init__(self):
        self.logger = get_logger("performance")

    def log_slow_query(self, query: str, duration: float, params: Dict = None) -> None:
        """Log slow database query."""
        self.logger.warning(
            "Slow query detected",
            query=query[:200] + "..." if len(query) > 200 else query,
            duration=f"{duration:.3f}s",
            params=params,
        )

    def log_memory_usage(self, usage_mb: float, threshold_mb: float = 500) -> None:
        """Log high memory usage."""
        if usage_mb > threshold_mb:
            self.logger.warning(
                "High memory usage detected",
                usage_mb=usage_mb,
                threshold_mb=threshold_mb,
            )

    def log_response_time(self, endpoint: str, duration: float, threshold: float = 1.0) -> None:
        """Log slow response times."""
        if duration > threshold:
            self.logger.warning(
                "Slow response time detected",
                endpoint=endpoint,
                duration=f"{duration:.3f}s",
                threshold=f"{threshold:.3f}s",
            )


# Global performance logger
performance_logger = PerformanceLogger()
