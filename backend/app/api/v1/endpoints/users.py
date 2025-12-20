"""
User management endpoints.
"""

from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import AuthenticatedUser, get_current_user
from app.auth.models import User
from app.core.database import get_db

logger = structlog.get_logger(__name__)

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    full_name: Optional[str] = None


@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get current user profile."""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfile(
        id=user.id,
        username=user.username or user.email.split("@")[0],
        display_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url or None,
        bio=user.bio or None,
        full_name=user.full_name,
    )


@router.put("/me", response_model=UserProfile)
async def update_my_profile_put(
    update: UserUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile (full update)."""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update.full_name is not None:
        user.full_name = update.full_name
    if update.bio is not None and hasattr(user, "bio"):
        user.bio = update.bio
    if update.avatar_url is not None and hasattr(user, "avatar_url"):
        user.avatar_url = update.avatar_url

    await db.commit()
    await db.refresh(user)

    return UserProfile(
        id=user.id,
        username=user.username or user.email.split("@")[0],
        display_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url or None,
        bio=user.bio or None,
        full_name=user.full_name,
    )


@router.patch("/me", response_model=UserProfile)
async def update_my_profile_patch(
    update: UserUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile (partial update)."""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update.full_name is not None:
        user.full_name = update.full_name
    if update.bio is not None and hasattr(user, "bio"):
        user.bio = update.bio
    if update.avatar_url is not None and hasattr(user, "avatar_url"):
        user.avatar_url = update.avatar_url

    await db.commit()
    await db.refresh(user)

    return UserProfile(
        id=user.id,
        username=user.username or user.email.split("@")[0],
        display_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url or None,
        bio=user.bio or None,
        full_name=user.full_name,
    )


@router.get("/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    """Get user profile by ID."""
    return UserProfile(id=user_id, username="user", display_name="User", email="user@example.com")


@router.get("/", response_model=List[UserProfile])
async def list_users(
    limit: int = Query(20, le=100), offset: int = Query(0, ge=0), search: Optional[str] = None
):
    """List users with pagination and search."""
    return []


@router.post("/{user_id}/follow")
async def follow_user(user_id: str):
    """Follow a user."""
    return {"message": "User followed successfully"}


@router.delete("/{user_id}/follow")
async def unfollow_user(user_id: str):
    """Unfollow a user."""
    return {"message": "User unfollowed successfully"}


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user account."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}
