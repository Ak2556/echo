from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import JSON
from sqlmodel import Column, Field, Relationship, SQLModel

from ..utils.database_compat import get_vector_column


class Teacher(SQLModel, table=True):
    """Teacher profile with extended information"""

    __tablename__ = "teachers"

    id: Optional[str] = Field(
        default_factory=lambda: str(__import__("uuid").uuid4()), primary_key=True
    )
    user_id: str = Field(foreign_key="auth_users.id", unique=True, index=True)

    # Professional information
    title: str = Field(default="Teacher")  # e.g., "Dr.", "Prof.", "Ms."
    subjects: List[str] = Field(sa_column=Column(JSON), default=[])
    education: Optional[str] = None
    experience_years: int = Field(default=0)
    certifications: List[str] = Field(sa_column=Column(JSON), default=[])

    # Teaching details
    hourly_rate: float = Field(default=0.0)
    languages: List[str] = Field(sa_column=Column(JSON), default=["English"])
    teaching_mode: List[str] = Field(
        sa_column=Column(JSON), default=["online"]
    )  # online, offline, hybrid

    # Media
    demo_video_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Statistics
    total_students: int = Field(default=0)
    total_classes: int = Field(default=0)
    total_revenue: float = Field(default=0.0)
    average_rating: float = Field(default=0.0)
    total_reviews: int = Field(default=0)

    # Availability
    is_accepting_students: bool = Field(default=True)
    max_students: int = Field(default=50)

    # Vector embedding for AI recommendations (1536 dimensions for OpenAI ada-002)
    embedding: Optional[List[float]] = Field(sa_column=get_vector_column(1536), default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified_at: Optional[datetime] = None

    # Relationships
    # Note: User relationship removed as auth User model doesn't have teacher_profile relationship
    courses: List["Course"] = Relationship(back_populates="teacher")
    # Note: ChatRoom relationship removed to avoid circular dependency issues


class TeacherCreate(SQLModel):
    """Schema for creating teacher profile"""

    title: str = "Teacher"
    subjects: List[str]
    education: Optional[str] = None
    experience_years: int = 0
    certifications: List[str] = []
    hourly_rate: float
    languages: List[str] = ["English"]
    teaching_mode: List[str] = ["online"]


class TeacherUpdate(SQLModel):
    """Schema for updating teacher profile"""

    title: Optional[str] = None
    subjects: Optional[List[str]] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    certifications: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    languages: Optional[List[str]] = None
    teaching_mode: Optional[List[str]] = None
    demo_video_url: Optional[str] = None
    is_accepting_students: Optional[bool] = None


class TeacherResponse(SQLModel):
    """Schema for teacher profile response"""

    id: str
    user_id: str
    title: str
    subjects: List[str]
    education: Optional[str]
    experience_years: int
    hourly_rate: float
    languages: List[str]
    teaching_mode: List[str]
    demo_video_url: Optional[str]
    total_students: int
    total_classes: int
    average_rating: float
    total_reviews: int
    is_accepting_students: bool
    created_at: datetime
