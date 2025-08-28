"""
Unit tests for JWKS routes.
Tests JWT public key distribution and OpenID Connect discovery.
"""

import pytest
from unittest.mock import patch, Mock

from app.auth.jwks_routes import get_jwks, get_openid_configuration


class TestGetJWKS:
    """Test JWKS endpoint."""

    @pytest.mark.asyncio
    async def test_get_jwks_success(self):
        """Test successful JWKS retrieval."""
        mock_jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "use": "sig",
                    "kid": "test-key-id",
                    "n": "test-modulus",
                    "e": "AQAB"
                }
            ]
        }

        with patch("app.auth.jwks_routes.get_jwt_manager") as mock_get_jwt:
            mock_jwt_manager = Mock()
            mock_jwt_manager.get_jwks.return_value = mock_jwks
            mock_get_jwt.return_value = mock_jwt_manager

            result = await get_jwks()

            assert result == mock_jwks
            mock_jwt_manager.get_jwks.assert_called_once()


class TestGetOpenIDConfiguration:
    """Test OpenID Connect discovery endpoint."""

    @pytest.mark.asyncio
    async def test_get_openid_configuration(self):
        """Test OpenID Connect configuration endpoint."""
        result = await get_openid_configuration()

        # Verify required fields are present
        assert "issuer" in result
        assert "authorization_endpoint" in result
        assert "token_endpoint" in result
        assert "jwks_uri" in result
        assert "response_types_supported" in result
        assert "subject_types_supported" in result
        assert "id_token_signing_alg_values_supported" in result
        assert "scopes_supported" in result
        assert "claims_supported" in result

        # Verify specific values
        assert result["issuer"] == "echo-api"
        assert result["jwks_uri"] == "/.well-known/jwks.json"
        assert "RS256" in result["id_token_signing_alg_values_supported"]
        assert "openid" in result["scopes_supported"]
        assert "email" in result["scopes_supported"]
