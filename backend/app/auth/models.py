"""
Authentication models for users, credentials, sessions, and audit logs.
"""
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy import Index, text
import uuid


class User(SQLModel, table=True):
    """Core user identity model."""
    __tablename__ = "auth_users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    email_verified: bool = Field(default=False)
    email_verified_at: Optional[datetime] = None

    # Profile
    username: Optional[str] = Field(unique=True, index=True)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str = Field(default="student")  # student, teacher, admin

    # Security
    is_active: bool = Field(default=True)
    is_locked: bool = Field(default=False)
    locked_until: Optional[datetime] = None
    failed_login_attempts: int = Field(default=0)

    # 2FA
    totp_secret: Optional[str] = None  # Encrypted
    totp_enabled: bool = Field(default=False)
    backup_codes: List[str] = Field(default=[], sa_column=Column(JSON))

    # Token versioning for global revocation
    token_version: int = Field(default=1)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login_at: Optional[datetime] = None

    __table_args__ = (
        Index('idx_email_verified', 'email', 'email_verified'),
        Index('idx_active_users', 'is_active', 'is_locked'),
    )


class Credential(SQLModel, table=True):
    """Password credentials - separate from User for security."""
    __tablename__ = "auth_credentials"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="auth_users.id", unique=True, index=True)
    password_hash: str = Field(nullable=False)

    # Password policy
    password_changed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    must_change_password: bool = Field(default=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OAuthAccount(SQLModel, table=True):
    """Linked OAuth provider accounts."""
    __tablename__ = "auth_oauth_accounts"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="auth_users.id", index=True)

    provider: str = Field(index=True)  # google, github, etc.
    provider_user_id: str = Field(index=True)
    provider_email: Optional[str] = None

    access_token: Optional[str] = None  # Encrypted
    refresh_token: Optional[str] = None  # Encrypted
    expires_at: Optional[datetime] = None

    profile_data: dict = Field(default={}, sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_provider_user', 'provider', 'provider_user_id', unique=True),
    )


class RefreshToken(SQLModel, table=True):
    """Refresh token storage with rotation tracking."""
    __tablename__ = "auth_refresh_tokens"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    jti: str = Field(unique=True, index=True)  # JWT ID
    user_id: str = Field(foreign_key="auth_users.id", index=True)

    # Token family for rotation detection
    family_id: str = Field(index=True)
    rotation_count: int = Field(default=0)
    parent_jti: Optional[str] = Field(index=True)

    # Device/session info
    device_fingerprint: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

    # Status
    is_revoked: bool = Field(default=False)
    revoked_at: Optional[datetime] = None
    revoked_reason: Optional[str] = None

    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_family_rotation', 'family_id', 'rotation_count'),
        Index('idx_expiry', 'expires_at', 'is_revoked'),
    )


class Session(SQLModel, table=True):
    """Active user sessions for tracking and management."""
    __tablename__ = "auth_sessions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="auth_users.id", index=True)

    # Session identifier
    session_token: str = Field(unique=True, index=True)
    refresh_token_jti: Optional[str] = Field(index=True)

    # Device info
    device_name: Optional[str] = None
    device_type: Optional[str] = None  # mobile, desktop, tablet
    user_agent: str
    ip_address: str
    location: Optional[str] = None  # Approximate city/country

    # Activity
    is_current: bool = Field(default=True)
    last_activity_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime

    __table_args__ = (
        Index('idx_user_current', 'user_id', 'is_current'),
    )


class VerificationCode(SQLModel, table=True):
    """OTP codes for email verification, 2FA, password reset."""
    __tablename__ = "auth_verification_codes"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)

    code: str = Field(index=True)
    code_hash: str  # Hashed for security

    # Context
    user_id: Optional[str] = Field(foreign_key="auth_users.id", index=True)
    email: Optional[str] = Field(index=True)
    purpose: str  # email_verify, password_reset, login_otp, 2fa_backup

    # Status
    is_used: bool = Field(default=False)
    used_at: Optional[datetime] = None
    attempts: int = Field(default=0)

    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_code_purpose', 'code_hash', 'purpose', 'is_used'),
    )


class AuditLog(SQLModel, table=True):
    """Security audit trail for all auth events."""
    __tablename__ = "auth_audit_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)

    user_id: Optional[str] = Field(foreign_key="auth_users.id", index=True)
    email: Optional[str] = Field(index=True)

    # Event details
    event_type: str = Field(index=True)  # login, logout, 2fa_enable, password_change, etc.
    event_status: str  # success, failure, pending
    event_metadata: dict = Field(default={}, sa_column=Column(JSON))

    # Request context
    ip_address: str
    user_agent: Optional[str] = None
    request_id: Optional[str] = None

    # Authentication method
    auth_method: Optional[str] = None  # password, oauth, totp, magic_link

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        sa_column_kwargs={"server_default": text("CURRENT_TIMESTAMP")}
    )

    __table_args__ = (
        Index('idx_user_events', 'user_id', 'event_type', 'timestamp'),
        Index('idx_failed_logins', 'email', 'event_type', 'event_status', 'timestamp'),
    )


class MagicLink(SQLModel, table=True):
    """Magic link tokens for passwordless authentication."""
    __tablename__ = "auth_magic_links"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    token: str = Field(unique=True, index=True)
    token_hash: str

    email: str = Field(index=True)
    user_id: Optional[str] = Field(foreign_key="auth_users.id")

    is_used: bool = Field(default=False)
    used_at: Optional[datetime] = None

    ip_address: str
    user_agent: Optional[str] = None

    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('idx_token_used', 'token_hash', 'is_used'),
    )
