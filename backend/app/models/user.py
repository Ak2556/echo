from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(SQLModel, table=True):
    """Base user model for authentication and common user data"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

    # Profile information
    full_name: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    language: str = Field(default="en")
    timezone: str = Field(default="UTC")

    # Role and status
    role: UserRole = Field(default=UserRole.STUDENT)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    email_verified: bool = Field(default=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    # Relationships
    teacher_profile: Optional["Teacher"] = Relationship(back_populates="user")
    enrollments: List["Enrollment"] = Relationship(back_populates="student")
    reviews: List["Review"] = Relationship(back_populates="student")
    chat_messages: List["ChatMessage"] = Relationship(back_populates="sender")


class UserCreate(SQLModel):
    """Schema for user registration"""
    email: str
    username: str
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT


class UserLogin(SQLModel):
    """Schema for user login"""
    email: str
    password: str


class UserResponse(SQLModel):
    """Schema for user response (without password)"""
    id: int
    email: str
    username: str
    full_name: str
    avatar_url: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime


class Token(SQLModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(SQLModel):
    """Token payload data"""
    user_id: int
    email: str
    role: UserRole
