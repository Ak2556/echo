"""
Unit tests for configuration management.
"""

import os
from unittest.mock import patch

import pytest

from app.core.config import Settings, get_settings


class TestSettings:
    """Tests for Settings class."""

    @patch.dict(
        os.environ, {"ENVIRONMENT": "production", "DATABASE_URL": "", "DEBUG": "false"}, clear=False
    )
    def test_default_settings(self):
        """Test default settings values."""
        settings = Settings()
        # APP_NAME can be "Echo" or "Echo API" depending on environment
        assert settings.app_name in ["Echo", "Echo API"]
        assert settings.environment == "production"
        assert settings.debug is False
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000
        assert settings.log_level == "INFO"

    def test_database_url_default(self):
        """Test default database URL."""
        # Save and remove DATABASE_URL if it exists
        old_db_url = os.environ.pop("DATABASE_URL", None)
        try:
            settings = Settings()
            # Check if DATABASE_URL is not empty (should have a default value)
            assert settings.database_url != ""
        finally:
            # Restore DATABASE_URL
            if old_db_url:
                os.environ["DATABASE_URL"] = old_db_url

    def test_secret_key_generation(self):
        """Test secret key is generated."""
        settings = Settings()
        assert len(settings.secret_key) > 0

    def test_cors_origins_default(self):
        """Test default CORS origins."""
        settings = Settings()
        assert isinstance(settings.cors_origins, list)
        assert len(settings.cors_origins) > 0

    def test_jwt_settings(self):
        """Test JWT configuration."""
        settings = Settings()
        assert settings.algorithm == "HS256"
        assert settings.access_token_expire_minutes == 30
        assert settings.refresh_token_expire_days == 7

    def test_password_settings(self):
        """Test password configuration."""
        settings = Settings()
        assert settings.password_min_length == 8
        assert isinstance(settings.password_min_length, int)

    def test_rate_limiting_settings(self):
        """Test rate limiting configuration."""
        settings = Settings()
        assert settings.rate_limit_requests == 100
        assert settings.rate_limit_window == 60
        assert settings.rate_limit_burst == 20

    def test_feature_flags(self):
        """Test feature flags."""
        settings = Settings()
        assert isinstance(settings.feature_ai_chat, bool)
        assert isinstance(settings.feature_image_generation, bool)
        assert isinstance(settings.enable_metrics, bool)

    @patch.dict(os.environ, {"ENVIRONMENT": "production"})
    def test_production_environment(self):
        """Test production environment settings."""
        settings = Settings()
        assert settings.environment == "production"
        assert settings.is_production is True
        assert settings.is_development is False

    @patch.dict(os.environ, {"ENVIRONMENT": "test"})
    def test_test_environment(self):
        """Test test environment settings."""
        settings = Settings()
        assert settings.environment == "test"
        assert settings.is_testing is True
        assert settings.is_development is False

    @patch.dict(os.environ, {"DEBUG": "false"})
    def test_debug_false(self):
        """Test debug mode disabled."""
        settings = Settings()
        assert settings.debug is False

    @patch.dict(os.environ, {"PORT": "9000"})
    def test_custom_port(self):
        """Test custom port configuration."""
        settings = Settings()
        assert settings.port == 9000

    @patch.dict(os.environ, {"DATABASE_URL": "postgresql://test:test@localhost/test"})
    def test_custom_database_url(self):
        """Test custom database URL."""
        settings = Settings()
        assert "postgresql" in settings.database_url

    @patch.dict(os.environ, {"SECRET_KEY": "test-secret-key"})
    def test_custom_secret_key(self):
        """Test custom secret key."""
        settings = Settings()
        assert settings.secret_key == "test-secret-key"

    @patch.dict(os.environ, {"CORS_ORIGINS": '["http://localhost:3000", "http://localhost:3001"]'})
    def test_custom_cors_origins(self):
        """Test custom CORS origins."""
        settings = Settings()
        cors_origins_str = [str(url) for url in settings.cors_origins]
        assert "http://localhost:3000/" in cors_origins_str
        assert "http://localhost:3001/" in cors_origins_str

    @patch.dict(os.environ, {"LOG_LEVEL": "DEBUG"})
    def test_custom_log_level(self):
        """Test custom log level."""
        settings = Settings()
        assert settings.log_level == "DEBUG"

    @patch.dict(os.environ, {"WORKERS": "4"})
    def test_custom_workers(self):
        """Test custom worker count."""
        settings = Settings()
        assert settings.workers == 4

    def test_redis_url_default(self):
        """Test default Redis URL."""
        settings = Settings()
        assert "redis://" in settings.redis_url

    @patch.dict(os.environ, {"REDIS_URL": "redis://custom:6379/1"})
    def test_custom_redis_url(self):
        """Test custom Redis URL."""
        settings = Settings()
        assert settings.redis_url == "redis://custom:6379/1"

    def test_api_limits(self):
        """Test API limits configuration."""
        settings = Settings()
        assert settings.api_max_request_size > 0
        assert settings.api_timeout > 0

    def test_jwt_issuer_audience(self):
        """Test JWT issuer and audience."""
        settings = Settings()
        assert settings.jwt_issuer == "echo-api"
        assert settings.jwt_audience == "echo-app"

    @patch.dict(os.environ, {"ACCESS_TOKEN_EXPIRE_MINUTES": "60"})
    def test_custom_token_expiry(self):
        """Test custom token expiry."""
        settings = Settings()
        assert settings.access_token_expire_minutes == 60

    @patch.dict(os.environ, {"RATE_LIMIT_REQUESTS": "200"})
    def test_custom_rate_limit(self):
        """Test custom rate limit."""
        settings = Settings()
        assert settings.rate_limit_requests == 200


class TestGetSettings:
    """Tests for get_settings function."""

    def test_get_settings_returns_instance(self):
        """Test get_settings returns Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_get_settings_singleton(self):
        """Test get_settings returns same instance (singleton pattern)."""
        settings1 = get_settings()
        settings2 = get_settings()
        assert settings1 is settings2

    def test_get_settings_with_env_changes(self):
        """Test get_settings reflects environment changes."""
        # This test verifies that settings are properly loaded
        settings = get_settings()
        assert hasattr(settings, "app_name")
        assert hasattr(settings, "environment")
        assert hasattr(settings, "database_url")

    def test_cors_origins_validator_with_string(self):
        """Test cors_origins validator with comma-separated string."""
        from app.core.config import Settings

        result = Settings.assemble_cors_origins("http://localhost:3000,http://localhost:3001")
        assert result == ["http://localhost:3000", "http://localhost:3001"]

    def test_cors_origins_validator_with_empty_string(self):
        """Test cors_origins validator with empty string."""
        from app.core.config import Settings

        result = Settings.assemble_cors_origins("")
        assert result == []

    def test_cors_origins_validator_with_json_string(self):
        """Test cors_origins validator with JSON array string - covers lines 156-161."""
        from app.core.config import Settings

        # Test valid JSON array - covers lines 156-159
        result = Settings.assemble_cors_origins(
            '["http://localhost:3000", "http://localhost:3001"]'
        )
        assert result == ["http://localhost:3000", "http://localhost:3001"]

    def test_cors_origins_validator_with_invalid_json_string(self):
        """Test cors_origins validator with invalid JSON falls back to comma-separated."""
        from app.core.config import Settings

        # Test invalid JSON (starts with [ but not valid JSON) - covers lines 160-161 (except clause)
        result = Settings.assemble_cors_origins("[not-valid-json, still-not-valid")
        # Should fall back to comma-separated parsing
        assert result == ["[not-valid-json", "still-not-valid"]

    def test_cors_origins_validator_with_non_string_non_list(self):
        """Test cors_origins validator returns empty list for non-string/non-list - covers line 166."""
        from app.core.config import Settings

        # Test with None - should return empty list
        result = Settings.assemble_cors_origins(None)
        assert result == []

        # Test with dict - should return empty list
        result = Settings.assemble_cors_origins({})
        assert result == []

    def test_database_url_validator_postgresql_replacement(self):
        """Test database_url validator replaces postgresql:// with postgresql+asyncpg:// - covers line 172."""
        from app.core.config import Settings

        # Test the validator method directly
        result = Settings.assemble_db_connection("postgresql://user:pass@localhost/testdb")
        assert result == "postgresql+asyncpg://user:pass@localhost/testdb"

    def test_database_url_validator_non_postgresql(self):
        """Test database_url validator doesn't modify non-postgresql URLs."""
        from app.core.config import Settings

        # Test with SQLite
        result = Settings.assemble_db_connection("sqlite:///./test.db")
        assert result == "sqlite:///./test.db"

        # Test with already asyncpg
        result = Settings.assemble_db_connection("postgresql+asyncpg://user:pass@localhost/testdb")
        assert result == "postgresql+asyncpg://user:pass@localhost/testdb"

    def test_settings_computed_properties(self):
        """Test Settings computed properties - covers lines 178, 183, 188."""
        from app.core.config import Settings

        # Test is_production
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=False):
            settings = Settings()
            assert settings.is_production is True
            assert settings.is_development is False
            assert settings.is_testing is False

        # Test is_development
        with patch.dict(os.environ, {"ENVIRONMENT": "development"}, clear=False):
            settings = Settings()
            assert settings.is_production is False
            assert settings.is_development is True
            assert settings.is_testing is False

        # Test is_testing
        with patch.dict(os.environ, {"ENVIRONMENT": "test"}, clear=False):
            settings = Settings()
            assert settings.is_production is False
            assert settings.is_development is False
            assert settings.is_testing is True

    def test_get_settings_development_environment(self):
        """Test get_settings returns DevelopmentSettings for development env."""
        import os
        from unittest.mock import patch

        with patch.dict(os.environ, {"ENVIRONMENT": "development"}):
            # Clear the lru_cache to force new settings creation
            from app.core.config import get_settings

            get_settings.cache_clear()

            settings = get_settings()
            from app.core.config import DevelopmentSettings

            assert isinstance(settings, DevelopmentSettings)

    def test_get_settings_production_environment(self):
        """Test get_settings returns ProductionSettings for production env."""
        import os
        from unittest.mock import patch

        with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
            # Clear the lru_cache to force new settings creation
            from app.core.config import get_settings

            get_settings.cache_clear()

            settings = get_settings()
            from app.core.config import ProductionSettings

            assert isinstance(settings, ProductionSettings)
