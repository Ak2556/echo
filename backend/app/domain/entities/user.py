"""
User domain entity with rich business logic.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class UserStatus(Enum):
    """User account status."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class UserRole(Enum):
    """User roles with permissions."""

    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


@dataclass
class UserPreferences:
    """User preferences and settings."""

    language: str = "en"
    theme: str = "light"
    notifications_enabled: bool = True
    email_notifications: bool = True
    ai_personality: str = "helpful"
    ai_model: str = "anthropic/claude-3-haiku"
    ai_max_tokens: int = 500
    ai_temperature: float = 0.7
    timezone: str = "UTC"
    privacy_level: str = "public"  # public, friends, private

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "language": self.language,
            "theme": self.theme,
            "notifications_enabled": self.notifications_enabled,
            "email_notifications": self.email_notifications,
            "ai_personality": self.ai_personality,
            "ai_model": self.ai_model,
            "ai_max_tokens": self.ai_max_tokens,
            "ai_temperature": self.ai_temperature,
            "timezone": self.timezone,
            "privacy_level": self.privacy_level,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "UserPreferences":
        """Create from dictionary."""
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})


@dataclass
class UserStats:
    """User activity statistics."""

    posts_count: int = 0
    likes_given: int = 0
    likes_received: int = 0
    comments_count: int = 0
    followers_count: int = 0
    following_count: int = 0
    ai_interactions: int = 0
    last_active: Optional[datetime] = None

    def calculate_engagement_score(self) -> float:
        """Calculate user engagement score."""
        if self.posts_count == 0:
            return 0.0

        # Weighted engagement score
        score = (
            self.likes_received * 2
            + self.comments_count * 3
            + self.followers_count * 1.5
            + self.ai_interactions * 0.5
        ) / max(self.posts_count, 1)

        return round(score, 2)


@dataclass
class User:
    """
    User domain entity with rich business logic.

    This entity encapsulates all user-related business rules and behaviors.
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    email: str = ""
    username: str = ""
    display_name: str = ""
    password_hash: str = ""
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None

    # Account management
    status: UserStatus = UserStatus.PENDING_VERIFICATION
    role: UserRole = UserRole.USER
    email_verified: bool = False
    phone_verified: bool = False
    two_factor_enabled: bool = False

    # Timestamps
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    last_password_change: Optional[datetime] = None

    # User data
    preferences: UserPreferences = field(default_factory=UserPreferences)
    stats: UserStats = field(default_factory=UserStats)
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Security
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    api_keys: List[str] = field(default_factory=list)

    def __post_init__(self):
        """Post-initialization validation."""
        if not self.display_name and self.username:
            self.display_name = self.username

    @property
    def is_active(self) -> bool:
        """Check if user account is active."""
        return (
            self.status == UserStatus.ACTIVE
            and self.email_verified
            and (self.locked_until is None or self.locked_until < datetime.now(timezone.utc))
        )

    @property
    def is_admin(self) -> bool:
        """Check if user has admin privileges."""
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]

    @property
    def is_moderator(self) -> bool:
        """Check if user has moderator privileges."""
        return self.role in [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]

    @property
    def full_name(self) -> str:
        """Get user's full display name."""
        return self.display_name or self.username or self.email.split("@")[0]

    def can_perform_action(self, action: str) -> bool:
        """
        Check if user can perform a specific action.

        Args:
            action: Action to check permissions for

        Returns:
            True if user can perform action, False otherwise
        """
        if not self.is_active:
            return False

        # Define role-based permissions
        permissions = {
            UserRole.USER: {
                "create_post",
                "like_post",
                "comment",
                "follow_user",
                "update_profile",
                "delete_own_content",
            },
            UserRole.MODERATOR: {
                "create_post",
                "like_post",
                "comment",
                "follow_user",
                "update_profile",
                "delete_own_content",
                "moderate_content",
                "ban_user",
                "delete_any_content",
            },
            UserRole.ADMIN: {
                "create_post",
                "like_post",
                "comment",
                "follow_user",
                "update_profile",
                "delete_own_content",
                "moderate_content",
                "ban_user",
                "delete_any_content",
                "manage_users",
                "view_analytics",
                "system_settings",
            },
            UserRole.SUPER_ADMIN: {"*"},  # All permissions
        }

        user_permissions = permissions.get(self.role, set())
        return "*" in user_permissions or action in user_permissions

    def update_last_activity(self) -> None:
        """Update user's last activity timestamp."""
        self.stats.last_active = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

    def increment_login_attempts(self) -> None:
        """Increment failed login attempts."""
        self.failed_login_attempts += 1

        # Lock account after 5 failed attempts for 30 minutes
        if self.failed_login_attempts >= 5:
            from datetime import timedelta

            self.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)

    def reset_login_attempts(self) -> None:
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.last_login = datetime.now(timezone.utc)
        self.update_last_activity()

    def verify_email(self) -> None:
        """Mark email as verified."""
        self.email_verified = True
        if self.status == UserStatus.PENDING_VERIFICATION:
            self.status = UserStatus.ACTIVE
        self.updated_at = datetime.now(timezone.utc)

    def suspend_account(self, reason: str = "") -> None:
        """Suspend user account."""
        self.status = UserStatus.SUSPENDED
        self.metadata["suspension_reason"] = reason
        self.metadata["suspended_at"] = datetime.now(timezone.utc).isoformat()
        self.updated_at = datetime.now(timezone.utc)

    def reactivate_account(self) -> None:
        """Reactivate suspended account."""
        self.status = UserStatus.ACTIVE
        self.metadata.pop("suspension_reason", None)
        self.metadata.pop("suspended_at", None)
        self.updated_at = datetime.now(timezone.utc)

    def update_preferences(self, preferences: Dict[str, Any]) -> None:
        """
        Update user preferences.

        Args:
            preferences: Dictionary of preference updates
        """
        for key, value in preferences.items():
            if hasattr(self.preferences, key):
                setattr(self.preferences, key, value)

        self.updated_at = datetime.now(timezone.utc)

    def add_api_key(self, api_key: str) -> None:
        """Add API key to user account."""
        if api_key not in self.api_keys:
            self.api_keys.append(api_key)
            self.updated_at = datetime.now(timezone.utc)

    def remove_api_key(self, api_key: str) -> bool:
        """
        Remove API key from user account.

        Args:
            api_key: API key to remove

        Returns:
            True if key was removed, False if not found
        """
        if api_key in self.api_keys:
            self.api_keys.remove(api_key)
            self.updated_at = datetime.now(timezone.utc)
            return True
        return False

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """
        Convert user to dictionary.

        Args:
            include_sensitive: Whether to include sensitive data

        Returns:
            Dictionary representation of user
        """
        data = {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "display_name": self.display_name,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "website": self.website,
            "location": self.location,
            "status": self.status.value,
            "role": self.role.value,
            "email_verified": self.email_verified,
            "phone_verified": self.phone_verified,
            "two_factor_enabled": self.two_factor_enabled,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "preferences": self.preferences.to_dict(),
            "stats": {
                "posts_count": self.stats.posts_count,
                "likes_given": self.stats.likes_given,
                "likes_received": self.stats.likes_received,
                "comments_count": self.stats.comments_count,
                "followers_count": self.stats.followers_count,
                "following_count": self.stats.following_count,
                "ai_interactions": self.stats.ai_interactions,
                "engagement_score": self.stats.calculate_engagement_score(),
                "last_active": (
                    self.stats.last_active.isoformat() if self.stats.last_active else None
                ),
            },
        }

        if include_sensitive:
            data.update(
                {
                    "password_hash": self.password_hash,
                    "failed_login_attempts": self.failed_login_attempts,
                    "locked_until": self.locked_until.isoformat() if self.locked_until else None,
                    "api_keys": self.api_keys,
                    "metadata": self.metadata,
                }
            )

        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "User":
        """
        Create user from dictionary.

        Args:
            data: Dictionary with user data

        Returns:
            User instance
        """
        # Handle datetime fields
        datetime_fields = [
            "created_at",
            "updated_at",
            "last_login",
            "last_password_change",
            "locked_until",
        ]
        for field in datetime_fields:
            if field in data and data[field]:
                if isinstance(data[field], str):
                    data[field] = datetime.fromisoformat(data[field].replace("Z", "+00:00"))

        # Handle enum fields
        if "status" in data:
            data["status"] = UserStatus(data["status"])
        if "role" in data:
            data["role"] = UserRole(data["role"])

        # Handle nested objects
        if "preferences" in data:
            data["preferences"] = UserPreferences.from_dict(data["preferences"])

        if "stats" in data:
            stats_data = data["stats"]
            if "last_active" in stats_data and stats_data["last_active"]:
                if isinstance(stats_data["last_active"], str):
                    stats_data["last_active"] = datetime.fromisoformat(
                        stats_data["last_active"].replace("Z", "+00:00")
                    )
            data["stats"] = UserStats(
                **{k: v for k, v in stats_data.items() if hasattr(UserStats, k)}
            )

        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})
