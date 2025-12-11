from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Review(SQLModel, table=True):
    """Course and teacher reviews"""

    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    enrollment_id: int = Field(foreign_key="enrollments.id", unique=True, index=True)

    # Rating (1-5 scale)
    overall_rating: float = Field(ge=1, le=5)
    teaching_quality: Optional[float] = Field(ge=1, le=5, default=None)
    course_content: Optional[float] = Field(ge=1, le=5, default=None)
    communication: Optional[float] = Field(ge=1, le=5, default=None)
    value_for_money: Optional[float] = Field(ge=1, le=5, default=None)

    # Review content
    title: Optional[str] = None
    comment: Optional[str] = None

    # Moderation
    is_verified: bool = Field(default=False)  # Verified purchase
    is_approved: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    moderation_notes: Optional[str] = None

    # Interaction
    helpful_count: int = Field(default=0)
    unhelpful_count: int = Field(default=0)

    # Response from teacher
    teacher_response: Optional[str] = None
    teacher_response_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    # Note: Relationships removed to avoid circular dependency issues
    # course: "Course" = Relationship(back_populates="reviews")
    # student: "User" = Relationship(back_populates="reviews")


class ReviewCreate(SQLModel):
    """Schema for creating a review"""

    course_id: int
    enrollment_id: int
    overall_rating: float = Field(ge=1, le=5)
    teaching_quality: Optional[float] = Field(ge=1, le=5, default=None)
    course_content: Optional[float] = Field(ge=1, le=5, default=None)
    communication: Optional[float] = Field(ge=1, le=5, default=None)
    value_for_money: Optional[float] = Field(ge=1, le=5, default=None)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewUpdate(SQLModel):
    """Schema for updating a review"""

    overall_rating: Optional[float] = Field(ge=1, le=5, default=None)
    teaching_quality: Optional[float] = Field(ge=1, le=5, default=None)
    course_content: Optional[float] = Field(ge=1, le=5, default=None)
    communication: Optional[float] = Field(ge=1, le=5, default=None)
    value_for_money: Optional[float] = Field(ge=1, le=5, default=None)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(SQLModel):
    """Schema for review response"""

    id: int
    course_id: int
    student_id: int
    overall_rating: float
    teaching_quality: Optional[float]
    course_content: Optional[float]
    communication: Optional[float]
    value_for_money: Optional[float]
    title: Optional[str]
    comment: Optional[str]
    is_verified: bool
    helpful_count: int
    teacher_response: Optional[str]
    created_at: datetime
