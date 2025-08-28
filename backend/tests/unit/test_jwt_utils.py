"""
Unit tests for JWT utilities.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import jwt as pyjwt
from app.auth.jwt_utils import JWTManager, init_jwt_manager, get_jwt_manager


class TestJWTManager:
    """Tests for JWTManager class."""

    @pytest.fixture
    def jwt_manager(self, tmp_path):
        """Create a JWTManager instance with temporary key paths."""
        private_key_path = tmp_path / "private.pem"
        public_key_path = tmp_path / "public.pem"

        # Manager will auto-generate keys since files don't exist
        manager = JWTManager(
            private_key_path=str(private_key_path),
            public_key_path=str(public_key_path)
        )
        return manager

    def test_verify_token_invalid_type(self, jwt_manager):
        """Test verify_token with wrong token type."""
        # Create an access token
        token = jwt_manager.create_access_token(
            user_id="user123",
            email="test@example.com",
            token_version=1
        )

        # Try to verify as refresh token (wrong type)
        with pytest.raises(ValueError, match="Invalid token type"):
            jwt_manager.verify_token(token, token_type="refresh")

    def test_verify_token_expired(self, jwt_manager):
        """Test verify_token with expired token."""
        from datetime import timedelta

        # Create token with negative expiry
        token = jwt_manager.create_access_token(
            user_id="user123",
            email="test@example.com",
            token_version=1,
            expires_delta=timedelta(seconds=-10)
        )

        # Should raise ValueError for expired token
        with pytest.raises(ValueError, match="Token expired"):
            jwt_manager.verify_token(token)

    def test_get_jwks(self, jwt_manager):
        """Test get_jwks returns valid JWKS format."""
        jwks = jwt_manager.get_jwks()

        assert "keys" in jwks
        assert isinstance(jwks["keys"], list)
        assert len(jwks["keys"]) > 0

        key_data = jwks["keys"][0]
        assert key_data["use"] == "sig"
        assert key_data["alg"] == "RS256"
        assert key_data["kid"] == "echo-key-1"

    def test_decode_token_unsafe_success(self, jwt_manager):
        """Test decode_token_unsafe with valid token."""
        token = jwt_manager.create_access_token(
            user_id="user123",
            email="test@example.com",
            token_version=1
        )

        result = jwt_manager.decode_token_unsafe(token)

        assert result is not None
        assert result["sub"] == "user123"
        assert result["email"] == "test@example.com"

    def test_decode_token_unsafe_invalid(self, jwt_manager):
        """Test decode_token_unsafe with invalid token."""
        invalid_token = "this.is.not.a.valid.token"

        result = jwt_manager.decode_token_unsafe(invalid_token)

        # Should return None on error
        assert result is None


class TestJWTManagerKeyLoading:
    """Tests for JWTManager key loading functionality."""

    def test_load_keys_from_file(self, tmp_path):
        """Test loading existing keys from files."""
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives import serialization

        # Generate keys
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()

        # Save keys to files
        private_key_path = tmp_path / "private.pem"
        public_key_path = tmp_path / "public.pem"

        with open(private_key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))

        with open(public_key_path, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))

        # Create manager which should load the existing keys
        manager = JWTManager(
            private_key_path=str(private_key_path),
            public_key_path=str(public_key_path)
        )

        # Verify keys were loaded by creating and verifying a token
        token = manager.create_access_token(
            user_id="test",
            email="test@example.com",
            token_version=1
        )
        payload = manager.verify_token(token)
        assert payload["sub"] == "test"

    def test_load_keys_exception_handling(self, tmp_path):
        """Test exception handling during key loading."""
        private_key_path = tmp_path / "private.pem"
        public_key_path = tmp_path / "public.pem"

        # Create invalid key files (not valid PEM)
        with open(private_key_path, "w") as f:
            f.write("invalid private key content")

        with open(public_key_path, "w") as f:
            f.write("invalid public key content")

        # Should raise exception when trying to load invalid keys
        with pytest.raises(Exception):
            JWTManager(
                private_key_path=str(private_key_path),
                public_key_path=str(public_key_path)
            )


class TestJWTManagerGlobalInstance:
    """Tests for global JWT manager instance functions."""

    def test_init_jwt_manager(self, tmp_path):
        """Test init_jwt_manager function."""
        private_key_path = str(tmp_path / "private.pem")
        public_key_path = str(tmp_path / "public.pem")

        manager = init_jwt_manager(
            private_key_path=private_key_path,
            public_key_path=public_key_path,
            access_token_expires=30,
            refresh_token_expires=14,
            issuer="test-issuer",
            audience="test-audience"
        )

        assert manager is not None
        assert isinstance(manager, JWTManager)

    def test_get_jwt_manager(self, tmp_path):
        """Test get_jwt_manager returns global instance."""
        # Initialize global manager first
        private_key_path = str(tmp_path / "private.pem")
        public_key_path = str(tmp_path / "public.pem")

        init_jwt_manager(
            private_key_path=private_key_path,
            public_key_path=public_key_path
        )

        manager = get_jwt_manager()
        assert manager is not None
        assert isinstance(manager, JWTManager)
