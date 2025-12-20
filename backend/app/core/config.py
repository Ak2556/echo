"""
Production-grade configuration management.
Environment-based settings with validation and security.
"""

import os
import secrets
from functools import lru_cache
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Base application settings with comprehensive configuration."""

    # Application
    app_name: str = "Echo API"
    app_version: str = "2.0.0"
    app_description: str = "Production-ready Echo API with enterprise features"
    debug: bool = False
    environment: str = "production"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    max_connections: int = 1000
    keepalive_timeout: int = 5

    # Security
    secret_key: str = Field(
        default_factory=lambda: os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    password_min_length: int = 8
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15

    # JWT Keys (for RS256 in production)
    jwt_private_key_path: Optional[str] = None
    jwt_public_key_path: Optional[str] = None
    jwt_algorithm: str = "HS256"  # Use RS256 in production
    jwt_issuer: str = "echo-api"
    jwt_audience: str = "echo-app"

    # Database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_prod"
    database_pool_size: int = 20
    database_max_overflow: int = 30
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600
    database_echo: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 100
    redis_retry_on_timeout: bool = True
    redis_health_check_interval: int = 30

    # Cache
    cache_ttl_default: int = 300  # 5 minutes
    cache_ttl_short: int = 60  # 1 minute
    cache_ttl_long: int = 3600  # 1 hour
    cache_max_size: int = 10000

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    rate_limit_burst: int = 20

    # CORS
    cors_origins: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:3001"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    cors_allow_headers: List[str] = ["*"]

    # External APIs
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_timeout: int = 30
    openrouter_max_retries: int = 3

    # File Storage
    upload_max_size: int = 10 * 1024 * 1024  # 10MB
    upload_allowed_types: List[str] = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    storage_backend: str = "local"  # local, s3, minio

    # S3/MinIO Configuration
    s3_bucket: str = "echo-uploads"
    s3_region: str = "us-east-1"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_endpoint_url: Optional[str] = None  # For MinIO

    # Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_tls: bool = True
    smtp_ssl: bool = False
    email_from: EmailStr = "noreply@echo.com"
    email_from_name: str = "Echo Platform"
    email_enabled: bool = False

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    log_file: Optional[str] = None
    log_rotation: str = "1 day"
    log_retention: str = "30 days"

    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9090
    sentry_dsn: Optional[str] = None

    # Background Tasks
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    celery_task_routes: Dict[str, Any] = {}

    # AI/ML
    ai_model_cache_size: int = 100
    ai_request_timeout: int = 30
    ai_max_tokens: int = 4000
    ai_temperature: float = 0.7

    # WebSocket
    websocket_max_connections: int = 1000
    websocket_ping_interval: int = 20
    websocket_ping_timeout: int = 10

    # API Limits
    api_max_request_size: int = 50 * 1024 * 1024  # 50MB for video uploads
    api_timeout: int = 30
    api_max_concurrent_requests: int = 100

    # Feature Flags
    feature_ai_chat: bool = True
    feature_image_generation: bool = True
    feature_file_upload: bool = True
    feature_websockets: bool = True
    feature_analytics: bool = True

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and v:
            # Try to parse as JSON first
            if v.startswith("["):
                try:
                    import json

                    return json.loads(v)
                except:
                    pass
            # Fall back to comma-separated
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @computed_field
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @computed_field
    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @computed_field
    @property
    def is_testing(self) -> bool:
        return self.environment == "test"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        validate_assignment=True,
    )


class DevelopmentSettings(Settings):
    """Development environment settings."""

    debug: bool = True
    environment: str = "development"
    log_level: str = "DEBUG"
    database_echo: bool = True

    # Development database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_dev"

    # Development CORS origins
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
    ]

    # Relaxed limits for development
    rate_limit_requests: int = 1000
    workers: int = 1

    # Enable all features in development
    feature_ai_chat: bool = True
    feature_image_generation: bool = True
    feature_file_upload: bool = True
    feature_websockets: bool = True
    feature_analytics: bool = True


class ProductionSettings(Settings):
    """Production environment settings."""

    debug: bool = False
    environment: str = "production"
    log_level: str = "INFO"
    database_echo: bool = False

    # Production optimizations
    workers: int = 16
    max_connections: int = 10000
    database_pool_size: int = 120
    database_max_overflow: int = 80
    redis_max_connections: int = 300

    # Stricter rate limits
    rate_limit_requests: int = 300
    rate_limit_window: int = 60

    # Enable monitoring
    enable_metrics: bool = True
    email_enabled: bool = True

    # Use RS256 for JWT in production
    jwt_algorithm: str = "RS256"

    # Production security
    password_min_length: int = 12
    max_login_attempts: int = 3
    lockout_duration_minutes: int = 30


class TestSettings(Settings):
    """Test environment settings."""

    debug: bool = True
    environment: str = "test"
    log_level: str = "WARNING"

    # Test database
    database_url: str = "postgresql+asyncpg://echo:echo@localhost/echo_test"

    # Test CORS origins
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://testserver",
    ]

    # Disable external services
    enable_metrics: bool = False
    email_enabled: bool = False

    # High limits for testing
    rate_limit_requests: int = 10000
    rate_limit_window: int = 3600

    # Disable features that require external services
    feature_ai_chat: bool = False
    feature_image_generation: bool = False


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
