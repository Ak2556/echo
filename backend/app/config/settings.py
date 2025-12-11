"""
Production-grade configuration management with environment-based settings.
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation and environment support."""

    # Application
    app_name: str = "Echo API"
    app_version: str = "2.0.0"
    debug: bool = False
    environment: str = "production"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4

    # Security
    secret_key: str = "dev-secret-key-change-in-production-12345678"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_dev"
    database_pool_size: int = 20
    database_max_overflow: int = 30
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 100

    # ChromaDB
    chroma_api_key: Optional[str] = None
    chroma_tenant: Optional[str] = None
    chroma_database: Optional[str] = None
    chroma_host: str = "localhost"
    chroma_port: int = 8000

    # External APIs
    openrouter_api_key: str = "not-set"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds

    # Caching
    cache_ttl: int = 300  # 5 minutes
    cache_max_size: int = 1000

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9090

    # Background Tasks
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_tls: bool = True
    smtp_ssl: bool = False
    email_from: str = "noreply@echo.com"
    email_from_name: str = "Echo Platform"
    email_enabled: bool = False  # Disabled by default, enabled in production
    email_template_dir: str = "./app/templates/email"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_connection(cls, v):
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=False, extra="ignore"  # Ignore extra fields from .env
    )


class DevelopmentSettings(Settings):
    """Development environment settings."""

    debug: bool = True
    environment: str = "development"
    log_level: str = "DEBUG"

    # Development database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_dev"


class ProductionSettings(Settings):
    """Production environment settings."""

    debug: bool = False
    environment: str = "production"
    log_level: str = "INFO"

    # Production optimizations for 10K concurrent users
    workers: int = 16  # Increased for better concurrency
    database_pool_size: int = 120  # Optimized for 10K users
    database_max_overflow: int = 80  # Total 200 connections max
    redis_max_connections: int = 300  # Increased for distributed caching/rate limiting
    rate_limit_requests: int = 300  # Higher limits for production
    rate_limit_window: int = 60

    # Enable email in production
    email_enabled: bool = True


class TestSettings(Settings):
    """Test environment settings."""

    debug: bool = True
    environment: str = "test"

    # Test database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_test"

    # Disable external services in tests
    enable_metrics: bool = False

    # Disable rate limiting in tests
    rate_limit_requests: int = 10000  # Very high limit for tests
    rate_limit_window: int = 3600  # 1 hour window


@lru_cache()
def get_settings() -> Settings:
    """Get application settings based on environment."""
    env = os.getenv("ENVIRONMENT", "production").lower()

    if env == "development":
        return DevelopmentSettings()
    elif env == "test":
        return TestSettings()
    else:
        return ProductionSettings()


# Global settings instance
settings = get_settings()
