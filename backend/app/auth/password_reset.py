"""
Password reset flow: forgot password → email with token → reset with new password.
"""

from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..core.database import get_session
from .models import Credential, User, VerificationCode
from .redis_service import get_redis_service
from .routes import log_audit_event
from .security import (
    calculate_password_strength,
    check_password_breach,
    generate_secure_token,
    hash_password,
    hash_token,
    verify_password,
)

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/auth/password", tags=["password"])


# ==================== Schemas ====================


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ==================== Routes ====================


@router.post("/forgot")
async def forgot_password(
    data: ForgotPasswordRequest, request: Request, db: AsyncSession = Depends(get_session)
):
    """
    Request password reset email.

    Security: Always return success even if email doesn't exist
    to prevent email enumeration attacks.
    """
    redis = get_redis_service()

    # Rate limiting
    rate_key = f"password_reset:{request.client.host}"
    is_allowed, remaining = await redis.check_rate_limit(
        rate_key, max_requests=3, window_seconds=3600
    )

    if not is_allowed:
        raise HTTPException(
            status_code=429, detail="Too many password reset requests. Please try again later."
        )

    # Get user
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    success_message = (
        "If an account exists with this email, you will receive password reset instructions."
    )

    if not user:
        # Log failed attempt
        await log_audit_event(
            db,
            None,
            data.email,
            "password_reset_request",
            "failure",
            request,
            metadata={"reason": "user_not_found"},
        )
        return {"message": success_message}

    # Check if account is locked
    if user.is_locked:
        await log_audit_event(
            db,
            user.id,
            user.email,
            "password_reset_request",
            "failure",
            request,
            metadata={"reason": "account_locked"},
        )
        return {"message": success_message}

    # Generate secure token
    reset_token = generate_secure_token(32)
    token_hash = hash_token(reset_token)

    # Store in database
    verification_code = VerificationCode(
        code=reset_token,  # Store plain for email
        code_hash=token_hash,  # Store hash for verification
        user_id=user.id,
        email=user.email,
        purpose="password_reset",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(verification_code)
    await db.commit()

    # Store in Redis for quick lookup
    await redis.cache_set(
        f"password_reset:{token_hash}",
        {"user_id": user.id, "email": user.email},
        expires_in_seconds=3600,
    )

    # TODO: Send email with reset link
    reset_link = f"{request.base_url}auth/reset-password?token={reset_token}"

    logger.info(
        "Password reset requested", user_id=user.id, reset_link=reset_link  # Remove in production
    )

    # Log audit event
    await log_audit_event(db, user.id, user.email, "password_reset_request", "success", request)

    # TODO: In production, send email here
    # await send_email(
    #     to=user.email,
    #     subject="Reset Your Password",
    #     template="password_reset",
    #     context={"reset_link": reset_link, "user_name": user.full_name}
    # )

    return {"message": success_message}


@router.post("/reset")
async def reset_password(
    data: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_session)
):
    """
    Reset password with token from email.
    """
    redis = get_redis_service()

    # Hash token for lookup
    token_hash = hash_token(data.token)

    # Check Redis first (fast lookup)
    cached_data = await redis.cache_get(f"password_reset:{token_hash}")

    # Verify token in database
    result = await db.execute(
        select(VerificationCode)
        .where(VerificationCode.code_hash == token_hash)
        .where(VerificationCode.purpose == "password_reset")
        .where(VerificationCode.is_used == False)
        .where(VerificationCode.expires_at > datetime.now(timezone.utc))
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        await log_audit_event(
            db,
            None,
            None,
            "password_reset",
            "failure",
            request,
            metadata={"reason": "invalid_token"},
        )
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Rate limiting by user
    user_rate_key = f"password_reset_attempts:{reset_token.user_id}"
    is_allowed, remaining = await redis.check_rate_limit(
        user_rate_key, max_requests=5, window_seconds=300
    )

    if not is_allowed:
        raise HTTPException(
            status_code=429, detail="Too many reset attempts. Please wait before trying again."
        )

    # Validate new password strength
    strength = calculate_password_strength(data.new_password)
    if strength["score"] < 40:
        raise HTTPException(
            status_code=400, detail={"message": "Password too weak", "strength": strength}
        )

    # Check password breach
    is_breached, breach_count = await check_password_breach(data.new_password)
    if is_breached and breach_count > 100:
        raise HTTPException(
            status_code=400,
            detail="This password has been exposed in data breaches. Please choose a different one.",
        )

    # Get user
    user_result = await db.execute(select(User).where(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get credential
    cred_result = await db.execute(select(Credential).where(Credential.user_id == user.id))
    credential = cred_result.scalar_one_or_none()

    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    # Update password
    credential.password_hash = hash_password(data.new_password)
    credential.password_changed_at = datetime.now(timezone.utc)
    credential.updated_at = datetime.now(timezone.utc)

    # Mark token as used
    reset_token.is_used = True
    reset_token.used_at = datetime.now(timezone.utc)

    # Increment token version to invalidate all existing tokens
    user.token_version += 1
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Clear Redis cache
    await redis.cache_delete(f"password_reset:{token_hash}")

    # Invalidate all user sessions (force re-login)
    await redis.blacklist_user_tokens(user.id, expires_in_seconds=86400)

    # Log audit event
    await log_audit_event(db, user.id, user.email, "password_reset", "success", request)

    logger.info("Password reset successful", user_id=user.id)

    # TODO: Send confirmation email
    # await send_email(
    #     to=user.email,
    #     subject="Password Changed",
    #     template="password_changed",
    #     context={"user_name": user.full_name}
    # )

    return {"message": "Password reset successful. Please login with your new password."}


@router.post("/change")
async def change_password(
    data: ChangePasswordRequest, request: Request, db: AsyncSession = Depends(get_session)
):
    """
    Change password for authenticated user (requires current password).
    """
    from .totp_routes import get_current_user_from_token

    redis = get_redis_service()
    user = await get_current_user_from_token(request, db)

    # Rate limiting
    rate_key = f"password_change:{user.id}"
    is_allowed, remaining = await redis.check_rate_limit(
        rate_key, max_requests=5, window_seconds=300
    )

    if not is_allowed:
        raise HTTPException(status_code=429, detail="Too many password change attempts")

    # Get credential
    cred_result = await db.execute(select(Credential).where(Credential.user_id == user.id))
    credential = cred_result.scalar_one_or_none()

    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    # Verify current password
    if not verify_password(credential.password_hash, data.current_password):
        await log_audit_event(
            db,
            user.id,
            user.email,
            "password_change",
            "failure",
            request,
            metadata={"reason": "invalid_current_password"},
        )
        raise HTTPException(status_code=401, detail="Invalid current password")

    # Validate new password
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400, detail="New password must be different from current password"
        )

    # Check password strength
    strength = calculate_password_strength(data.new_password)
    if strength["score"] < 40:
        raise HTTPException(
            status_code=400, detail={"message": "Password too weak", "strength": strength}
        )

    # Check password breach
    is_breached, breach_count = await check_password_breach(data.new_password)
    if is_breached and breach_count > 100:
        raise HTTPException(
            status_code=400,
            detail="This password has been exposed in data breaches. Please choose a different one.",
        )

    # Update password
    credential.password_hash = hash_password(data.new_password)
    credential.password_changed_at = datetime.now(timezone.utc)
    credential.updated_at = datetime.now(timezone.utc)

    # Increment token version (invalidate old tokens)
    user.token_version += 1
    user.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Invalidate all existing sessions except current
    await redis.blacklist_user_tokens(user.id, expires_in_seconds=86400)

    # Log audit event
    await log_audit_event(db, user.id, user.email, "password_change", "success", request)

    logger.info("Password changed", user_id=user.id)

    # TODO: Send confirmation email
    # await send_email(
    #     to=user.email,
    #     subject="Password Changed",
    #     template="password_changed",
    #     context={"user_name": user.full_name}
    # )

    return {"message": "Password changed successfully. Please login again."}


@router.post("/verify-reset-token")
async def verify_reset_token(token: str, db: AsyncSession = Depends(get_session)):
    """
    Verify if a password reset token is valid (for frontend validation).
    """
    token_hash = hash_token(token)

    result = await db.execute(
        select(VerificationCode)
        .where(VerificationCode.code_hash == token_hash)
        .where(VerificationCode.purpose == "password_reset")
        .where(VerificationCode.is_used == False)
        .where(VerificationCode.expires_at > datetime.now(timezone.utc))
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        return {"valid": False, "message": "Invalid or expired token"}

    return {
        "valid": True,
        "email": reset_token.email,
        "expires_in": int((reset_token.expires_at - datetime.now(timezone.utc)).total_seconds()),
    }
