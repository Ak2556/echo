"""
JWT utilities with RS256 signing, key rotation, and JWKS support.
"""

import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import jwt
import structlog
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

logger = structlog.get_logger(__name__)


class JWTManager:
    """Manages RS256 JWT creation, verification, and key rotation."""

    def __init__(
        self,
        private_key_path: str,
        public_key_path: str,
        access_token_expires: int = 15,  # minutes
        refresh_token_expires: int = 7,  # days
        issuer: str = "echo-api",
        audience: str = "echo-app",
    ):
        self.private_key_path = Path(private_key_path)
        self.public_key_path = Path(public_key_path)
        self.access_token_expires = access_token_expires
        self.refresh_token_expires = refresh_token_expires
        self.issuer = issuer
        self.audience = audience

        self._private_key = None
        self._public_key = None
        self._load_keys()

    def _load_keys(self):
        """Load RSA keys from files."""
        try:
            # Load private key
            if self.private_key_path.exists():
                with open(self.private_key_path, "rb") as f:
                    self._private_key = serialization.load_pem_private_key(
                        f.read(), password=None, backend=default_backend()
                    )
                logger.info("Loaded private key", path=str(self.private_key_path))

            # Load public key
            if self.public_key_path.exists():
                with open(self.public_key_path, "rb") as f:
                    self._public_key = serialization.load_pem_public_key(
                        f.read(), backend=default_backend()
                    )
                logger.info("Loaded public key", path=str(self.public_key_path))

            if not self._private_key or not self._public_key:
                logger.warning("Keys not found, generating new keypair")
                self._generate_keys()

        except Exception as e:
            logger.error("Failed to load keys", error=str(e))
            raise

    def _generate_keys(self):
        """Generate new RSA keypair."""
        logger.info("Generating new RSA keypair")

        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048, backend=default_backend()
        )

        # Ensure directory exists
        self.private_key_path.parent.mkdir(parents=True, exist_ok=True)
        self.public_key_path.parent.mkdir(parents=True, exist_ok=True)

        # Save private key
        with open(self.private_key_path, "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )
        self.private_key_path.chmod(0o600)

        # Save public key
        public_key = private_key.public_key()
        with open(self.public_key_path, "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )

        self._private_key = private_key
        self._public_key = public_key

        logger.info("Generated and saved new keypair")

    def create_access_token(
        self,
        user_id: str,
        email: str,
        token_version: int,
        session_id: Optional[str] = None,
        auth_methods: Optional[List[str]] = None,
        scopes: Optional[List[str]] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """Create an access token."""
        now = datetime.now(timezone.utc)
        exp = now + (
            expires_delta if expires_delta else timedelta(minutes=self.access_token_expires)
        )

        payload = {
            "sub": user_id,
            "email": email,
            "iat": now,
            "exp": exp,
            "iss": self.issuer,
            "aud": self.audience,
            "ver": token_version,
            "sid": session_id or str(uuid.uuid4()),
            "amr": auth_methods or ["pwd"],  # authentication methods reference
            "scope": " ".join(scopes or ["user:read", "user:write"]),
            "type": "access",
        }

        token = jwt.encode(payload, self._private_key, algorithm="RS256")

        return token

    def create_refresh_token(
        self,
        user_id: str,
        family_id: str,
        rotation_count: int = 0,
        parent_jti: Optional[str] = None,
    ) -> tuple[str, str]:
        """Create a refresh token with rotation tracking."""
        now = datetime.now(timezone.utc)
        exp = now + timedelta(days=self.refresh_token_expires)
        jti = str(uuid.uuid4())

        payload = {
            "sub": user_id,
            "jti": jti,
            "iat": now,
            "exp": exp,
            "iss": self.issuer,
            "aud": self.audience,
            "family_id": family_id,
            "rot": rotation_count,
            "parent": parent_jti,
            "type": "refresh",
        }

        token = jwt.encode(payload, self._private_key, algorithm="RS256")

        return token, jti

    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(
                token,
                self._public_key,
                algorithms=["RS256"],
                issuer=self.issuer,
                audience=self.audience,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_iss": True,
                    "verify_aud": True,
                },
            )

            # Verify token type
            if payload.get("type") != token_type:
                raise jwt.InvalidTokenError(f"Invalid token type, expected {token_type}")

            return payload

        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            raise ValueError("Token expired")
        except jwt.InvalidTokenError as e:
            logger.warning("Invalid token", error=str(e))
            raise ValueError(f"Invalid token: {str(e)}")

    def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set for token verification."""
        import json

        from jwcrypto import jwk

        # Convert public key to JWK
        public_key_pem = self._public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        key = jwk.JWK.from_pem(public_key_pem)
        key_data = json.loads(key.export_public())

        # Add standard JWKS fields
        key_data.update(
            {
                "use": "sig",
                "alg": "RS256",
                "kid": "echo-key-1",  # Key ID for rotation
            }
        )

        return {"keys": [key_data]}

    def decode_token_unsafe(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode token without verification (for debugging/logging only)."""
        try:
            return jwt.decode(token, options={"verify_signature": False})
        except Exception as e:
            logger.error("Failed to decode token", error=str(e))
            return None


# Global instance
jwt_manager: Optional[JWTManager] = None


def init_jwt_manager(
    private_key_path: str,
    public_key_path: str,
    access_token_expires: int = 15,
    refresh_token_expires: int = 7,
    issuer: str = "echo-api",
    audience: str = "echo-app",
):
    """Initialize the global JWT manager."""
    global jwt_manager
    jwt_manager = JWTManager(
        private_key_path=private_key_path,
        public_key_path=public_key_path,
        access_token_expires=access_token_expires,
        refresh_token_expires=refresh_token_expires,
        issuer=issuer,
        audience=audience,
    )
    return jwt_manager


def get_jwt_manager() -> JWTManager:
    """Get the global JWT manager instance."""
    global jwt_manager
    if jwt_manager is None:
        # Initialize with test settings - create temp keys
        import os
        import tempfile

        # Create temp directory for test keys
        temp_dir = tempfile.mkdtemp()
        private_key_path = os.path.join(temp_dir, "private_key.pem")
        public_key_path = os.path.join(temp_dir, "public_key.pem")

        # Initialize will auto-generate keys if they don't exist
        jwt_manager = JWTManager(
            private_key_path=private_key_path,
            public_key_path=public_key_path,
            access_token_expires=15,  # minutes
            refresh_token_expires=7,  # days
            issuer="echo-api-test",
            audience="echo-app-test",
        )
    return jwt_manager
