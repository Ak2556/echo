"""
JWKS (JSON Web Key Set) endpoint for public key distribution.
Allows clients to verify JWT signatures.
"""
from fastapi import APIRouter
from .jwt_utils import get_jwt_manager

router = APIRouter(tags=["jwks"])


@router.get("/.well-known/jwks.json")
async def get_jwks():
    """
    Get JSON Web Key Set (JWKS) for JWT verification.

    This endpoint exposes the public key used to verify JWT signatures.
    Clients can use this to verify tokens without contacting the auth server.

    Standard JWKS endpoint as per RFC 7517.
    """
    jwt_manager = get_jwt_manager()
    return jwt_manager.get_jwks()


@router.get("/.well-known/openid-configuration")
async def get_openid_configuration():
    """
    OpenID Connect Discovery endpoint (optional).

    Provides metadata about the OAuth/OIDC configuration.
    """
    return {
        "issuer": "echo-api",
        "authorization_endpoint": "/api/auth/oauth/{provider}/start",
        "token_endpoint": "/api/auth/token/refresh",
        "jwks_uri": "/.well-known/jwks.json",
        "response_types_supported": ["code"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["RS256"],
        "scopes_supported": ["openid", "email", "profile"],
        "claims_supported": ["sub", "email", "name", "picture"],
    }
