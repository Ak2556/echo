"""
Unit tests for app/config/settings.py
"""

import os
from unittest.mock import patch

import pytest


class TestSettingsValidators:
    """Tests for Settings field validators."""

    def test_assemble_cors_origins_with_comma_separated_string(self):
        """Test assemble_cors_origins validator with comma-separated string."""
        from app.config.settings import Settings

        # Test the validator method directly - covers line 98
        result = Settings.assemble_cors_origins(
            "http://localhost:3000,http://localhost:3001,http://localhost:3002"
        )
        assert result == ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]

    def test_assemble_cors_origins_with_spaces(self):
        """Test assemble_cors_origins validator strips spaces."""
        from app.config.settings import Settings

        # Test the validator method with spaces - covers line 98
        result = Settings.assemble_cors_origins(
            "http://localhost:3000 , http://localhost:3001 , http://localhost:3002"
        )
        assert result == ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]

    def test_assemble_cors_origins_with_list(self):
        """Test assemble_cors_origins validator with list input."""
        from app.config.settings import Settings

        # Test the validator method with list input - covers line 99
        input_list = ["http://localhost:3000", "http://localhost:3001"]
        result = Settings.assemble_cors_origins(input_list)
        assert result == input_list

    def test_assemble_db_connection_postgresql_replacement(self):
        """Test assemble_db_connection validator replaces postgresql:// with postgresql+asyncpg://."""
        from app.config.settings import Settings

        # Test the validator method - covers line 105
        result = Settings.assemble_db_connection("postgresql://user:pass@localhost/testdb")
        assert result == "postgresql+asyncpg://user:pass@localhost/testdb"

    def test_assemble_db_connection_with_asyncpg_already(self):
        """Test assemble_db_connection validator doesn't modify asyncpg URLs."""
        from app.config.settings import Settings

        # Test the validator method with asyncpg already present - covers line 106
        result = Settings.assemble_db_connection("postgresql+asyncpg://user:pass@localhost/testdb")
        assert result == "postgresql+asyncpg://user:pass@localhost/testdb"

    def test_assemble_db_connection_with_sqlite(self):
        """Test assemble_db_connection validator doesn't modify SQLite URLs."""
        from app.config.settings import Settings

        # Test the validator method with SQLite - covers line 106
        result = Settings.assemble_db_connection("sqlite:///./test.db")
        assert result == "sqlite:///./test.db"


class TestGetSettings:
    """Tests for get_settings function."""

    def test_get_settings_development_environment(self):
        """Test get_settings returns DevelopmentSettings for development env."""
        from app.config.settings import DevelopmentSettings, get_settings

        with patch.dict(os.environ, {"ENVIRONMENT": "development"}, clear=False):
            # Clear the lru_cache to force new settings creation
            get_settings.cache_clear()

            # Covers line 166
            settings = get_settings()
            assert isinstance(settings, DevelopmentSettings)
            assert settings.environment == "development"
            assert settings.debug is True

    def test_get_settings_test_environment(self):
        """Test get_settings returns TestSettings for test env."""
        from app.config.settings import TestSettings, get_settings

        with patch.dict(os.environ, {"ENVIRONMENT": "test"}, clear=False):
            # Clear the lru_cache to force new settings creation
            get_settings.cache_clear()

            # Covers line 168
            settings = get_settings()
            assert isinstance(settings, TestSettings)
            assert settings.environment == "test"
            assert settings.debug is True

    def test_get_settings_production_environment(self):
        """Test get_settings returns ProductionSettings for production env."""
        from app.config.settings import ProductionSettings, get_settings

        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=False):
            # Clear the lru_cache to force new settings creation
            get_settings.cache_clear()

            # Covers line 170
            settings = get_settings()
            assert isinstance(settings, ProductionSettings)

    def test_get_settings_unknown_environment_defaults_to_production(self):
        """Test get_settings returns ProductionSettings for unknown env."""
        from app.config.settings import ProductionSettings, get_settings

        with patch.dict(os.environ, {"ENVIRONMENT": "staging"}, clear=False):
            # Clear the lru_cache to force new settings creation
            get_settings.cache_clear()

            # Covers line 170 (else branch)
            settings = get_settings()
            assert isinstance(settings, ProductionSettings)


class TestSettingsClasses:
    """Tests for Settings classes."""

    @patch.dict(
        os.environ,
        {"DEBUG": "true", "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test"},
        clear=False,
    )
    def test_development_settings(self):
        """Test DevelopmentSettings can be instantiated."""
        from app.config.settings import DevelopmentSettings

        settings = DevelopmentSettings()
        # Just verify it can be created - conftest.py env vars may override field values
        assert settings is not None
        assert hasattr(settings, "debug")
        assert hasattr(settings, "environment")

    @patch.dict(
        os.environ,
        {"DEBUG": "false", "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test"},
        clear=False,
    )
    def test_production_settings(self):
        """Test ProductionSettings can be instantiated."""
        from app.config.settings import ProductionSettings

        settings = ProductionSettings()
        # Just verify it can be created - conftest.py env vars may override field values
        assert settings is not None
        assert hasattr(settings, "debug")
        assert hasattr(settings, "environment")

    def test_test_settings(self):
        """Test TestSettings can be instantiated."""
        from app.config.settings import TestSettings

        settings = TestSettings()
        assert settings is not None
        assert hasattr(settings, "debug")
        assert hasattr(settings, "environment")
