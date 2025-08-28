"""
Two-factor authentication (2FA) setup, verification, and management.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timezone
import structlog

from ..config.database import get_session
from .models import User, Credential
from .security import (
    generate_totp_secret, get_totp_provisioning_uri,
    generate_qr_code, verify_totp, generate_backup_codes,
    verify_backup_code, verify_password, encrypt_totp_secret,
    decrypt_totp_secret
)
from .redis_service import get_redis_service
from .routes import log_audit_event

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/auth/2fa", tags=["2fa"])


# ==================== Schemas ====================

class Setup2FAResponse(BaseModel):
    secret: str
    qr_code: str
    provisioning_uri: str
    backup_codes: List[str]
    message: str


class Verify2FASetupRequest(BaseModel):
    code: str


class Verify2FALoginRequest(BaseModel):
    temp_token: str
    code: str
    trust_device: bool = False


class Disable2FARequest(BaseModel):
    password: str
    code: Optional[str] = None  # Can use TOTP or backup code


class RegenerateBackupCodesRequest(BaseModel):
    password: str


# ==================== Helper to get current user ====================

async def get_current_user_from_token(request: Request, db: AsyncSession) -> User:
    """
    Extract user from Authorization header.
    TODO: Replace with proper auth middleware when available.
    """
    from .jwt_utils import get_jwt_manager

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")

    token = auth_header[7:]
    jwt_manager = get_jwt_manager()

    try:
        payload = jwt_manager.verify_token(token, "access")
        user_id = payload["sub"]

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# ==================== Routes ====================

@router.post("/setup", response_model=Setup2FAResponse)
async def setup_2fa(
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Generate TOTP secret and QR code for 2FA setup.

    Flow:
    1. User requests 2FA setup
    2. Backend generates secret and QR code
    3. User scans QR code in authenticator app
    4. User verifies with code from app
    5. Backend enables 2FA
    """
    user = await get_current_user_from_token(request, db)
    redis = get_redis_service()

    # Check if already enabled
    if user.totp_enabled:
        raise HTTPException(
            status_code=400,
            detail="2FA is already enabled. Disable it first to set up again."
        )

    # Generate TOTP secret
    secret = generate_totp_secret()

    # Generate provisioning URI
    issuer = "Echo"
    provisioning_uri = get_totp_provisioning_uri(secret, user.email, issuer)

    # Generate QR code
    qr_code = generate_qr_code(provisioning_uri)

    # Generate backup codes
    backup_codes = generate_backup_codes(count=10)

    # Store temporarily in Redis (not enabled until verified)
    setup_data = {
        "secret": secret,
        "backup_codes": backup_codes,
    }
    await redis.cache_set(
        f"totp_setup:{user.id}",
        setup_data,
        expires_in_seconds=600  # 10 minutes
    )

    logger.info("2FA setup initiated", user_id=user.id)

    return Setup2FAResponse(
        secret=secret,
        qr_code=qr_code,
        provisioning_uri=provisioning_uri,
        backup_codes=backup_codes,
        message="Scan QR code in your authenticator app and verify with a code"
    )


@router.post("/verify-setup")
async def verify_2fa_setup(
    data: Verify2FASetupRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Verify TOTP code and enable 2FA.
    """
    user = await get_current_user_from_token(request, db)
    redis = get_redis_service()

    # Get setup data from Redis
    setup_data = await redis.cache_get(f"totp_setup:{user.id}")

    if not setup_data:
        raise HTTPException(
            status_code=400,
            detail="No pending 2FA setup found. Please start setup again."
        )

    secret = setup_data["secret"]
    backup_codes = setup_data["backup_codes"]

    # Verify TOTP code
    if not verify_totp(secret, data.code, window=1):
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code. Please try again."
        )

    # Enable 2FA with encrypted secret storage
    user.totp_secret = encrypt_totp_secret(secret)
    user.totp_enabled = True
    user.backup_codes = backup_codes
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Clear setup data from Redis
    await redis.cache_delete(f"totp_setup:{user.id}")

    # Log audit event
    await log_audit_event(
        db, user.id, user.email,
        "2fa_enable", "success", request
    )

    logger.info("2FA enabled", user_id=user.id)

    return {
        "message": "2FA enabled successfully",
        "backup_codes": backup_codes
    }


@router.post("/verify-login")
async def verify_2fa_login(
    data: Verify2FALoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Verify 2FA code during login.

    After successful password login, if 2FA is enabled,
    user must provide TOTP code or backup code.
    """
    from .jwt_utils import get_jwt_manager
    from .security import generate_device_fingerprint
    from .models import RefreshToken
    from .routes import create_session_record
    from datetime import timedelta
    import uuid

    redis = get_redis_service()
    jwt_manager = get_jwt_manager()

    # Get pending login data from temp token
    pending_data = await redis.cache_get(f"2fa_pending:{data.temp_token}")

    if not pending_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired 2FA session. Please login again."
        )

    user_id = pending_data["user_id"]

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.totp_enabled:
        raise HTTPException(status_code=400, detail="Invalid 2FA session")

    # Decrypt TOTP secret and verify code
    decrypted_secret = decrypt_totp_secret(user.totp_secret)
    is_valid = verify_totp(decrypted_secret, data.code, window=1)

    # If TOTP fails, try backup codes
    if not is_valid:
        is_backup_code_valid, remaining_codes = verify_backup_code(
            user.backup_codes, data.code
        )

        if is_backup_code_valid:
            # Update backup codes (remove used one)
            user.backup_codes = remaining_codes
            await db.commit()

            logger.info("Backup code used", user_id=user.id, remaining=len(remaining_codes))

            if len(remaining_codes) <= 2:
                # Warn user to regenerate backup codes
                logger.warning("Low backup codes", user_id=user.id, remaining=len(remaining_codes))

            is_valid = True
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid 2FA code. Please try again."
            )

    # Clear pending 2FA session
    await redis.cache_delete(f"2fa_pending:{data.temp_token}")

    # Generate JWT tokens
    family_id = str(uuid.uuid4())

    access_token = jwt_manager.create_access_token(
        user_id=user.id,
        email=user.email,
        token_version=user.token_version,
        auth_methods=["pwd", "totp"],
    )

    refresh_token, jti = jwt_manager.create_refresh_token(
        user_id=user.id,
        family_id=family_id,
        rotation_count=0,
    )

    # Store refresh token
    device_fp = generate_device_fingerprint(
        request.headers.get("user-agent", ""),
        request.client.host
    )

    refresh_record = RefreshToken(
        jti=jti,
        user_id=user.id,
        family_id=family_id,
        device_fingerprint=device_fp,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(refresh_record)

    # Create session
    session = await create_session_record(
        db, user.id, jti, request,
        datetime.now(timezone.utc) + timedelta(days=7)
    )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # Log audit event
    await log_audit_event(
        db, user.id, user.email,
        "login_2fa", "success", request,
        auth_method="totp"
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 900,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
        }
    }


@router.post("/disable")
async def disable_2fa(
    data: Disable2FARequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Disable 2FA (requires password confirmation).
    """
    user = await get_current_user_from_token(request, db)

    if not user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")

    # Verify password
    cred_result = await db.execute(
        select(Credential).where(Credential.user_id == user.id)
    )
    credential = cred_result.scalar_one_or_none()

    if not credential or not verify_password(credential.password_hash, data.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    # Also verify TOTP code or backup code for extra security
    if data.code:
        decrypted_secret = decrypt_totp_secret(user.totp_secret)
        is_valid = verify_totp(decrypted_secret, data.code, window=1)

        if not is_valid:
            # Try backup code
            is_backup_valid, _ = verify_backup_code(user.backup_codes, data.code)
            if not is_backup_valid:
                raise HTTPException(status_code=400, detail="Invalid 2FA code")

    # Disable 2FA
    user.totp_enabled = False
    user.totp_secret = None
    user.backup_codes = []
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Log audit event
    await log_audit_event(
        db, user.id, user.email,
        "2fa_disable", "success", request
    )

    logger.info("2FA disabled", user_id=user.id)

    return {"message": "2FA disabled successfully"}


@router.post("/regenerate-backup-codes")
async def regenerate_backup_codes(
    data: RegenerateBackupCodesRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Regenerate backup codes (requires password).
    """
    user = await get_current_user_from_token(request, db)

    if not user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")

    # Verify password
    cred_result = await db.execute(
        select(Credential).where(Credential.user_id == user.id)
    )
    credential = cred_result.scalar_one_or_none()

    if not credential or not verify_password(credential.password_hash, data.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    # Generate new backup codes
    new_backup_codes = generate_backup_codes(count=10)

    user.backup_codes = new_backup_codes
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Log audit event
    await log_audit_event(
        db, user.id, user.email,
        "2fa_backup_codes_regenerated", "success", request
    )

    logger.info("Backup codes regenerated", user_id=user.id)

    return {
        "message": "Backup codes regenerated successfully",
        "backup_codes": new_backup_codes
    }


@router.get("/status")
async def get_2fa_status(
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    """
    Check if 2FA is enabled for current user.
    """
    user = await get_current_user_from_token(request, db)

    return {
        "enabled": user.totp_enabled,
        "backup_codes_remaining": len(user.backup_codes) if user.totp_enabled else 0
    }
