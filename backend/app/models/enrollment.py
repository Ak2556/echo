from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, timezone
from enum import Enum


class EnrollmentStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Enrollment(SQLModel, table=True):
    """Student enrollment in a course"""
    __tablename__ = "enrollments"

    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    payment_id: Optional[int] = Field(foreign_key="payments.id", default=None)

    # Enrollment details
    status: EnrollmentStatus = Field(default=EnrollmentStatus.PENDING)
    enrolled_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    cancellation_date: Optional[datetime] = None

    # Progress tracking
    attendance_count: int = Field(default=0)
    total_sessions: int = Field(default=0)
    completion_percentage: float = Field(default=0.0)
    last_attended: Optional[datetime] = None

    # Performance
    grade: Optional[str] = None
    final_score: Optional[float] = None

    # Feedback
    student_notes: Optional[str] = None
    teacher_notes: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    # Note: User relationship removed as auth User model doesn't have enrollments relationship
    course: "Course" = Relationship(back_populates="enrollments")
    payment: Optional["Payment"] = Relationship(back_populates="enrollment")


class EnrollmentCreate(SQLModel):
    """Schema for creating an enrollment"""
    course_id: int


class EnrollmentUpdate(SQLModel):
    """Schema for updating an enrollment"""
    status: Optional[EnrollmentStatus] = None
    attendance_count: Optional[int] = None
    completion_percentage: Optional[float] = None
    grade: Optional[str] = None
    final_score: Optional[float] = None


class EnrollmentResponse(SQLModel):
    """Schema for enrollment response"""
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    enrolled_date: datetime
    start_date: Optional[datetime]
    completion_date: Optional[datetime]
    attendance_count: int
    total_sessions: int
    completion_percentage: float
    grade: Optional[str]
    created_at: datetime
