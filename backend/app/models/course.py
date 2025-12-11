from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import JSON
from sqlmodel import Column, Field, Relationship, SQLModel

from ..utils.database_compat import get_vector_column


class CourseLevel(str, Enum):
    ELEMENTARY = "elementary"
    MIDDLE_SCHOOL = "middle_school"
    HIGH_SCHOOL = "high_school"
    COLLEGE = "college"
    ADULT = "adult"
    PROFESSIONAL = "professional"


class CourseMode(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    HYBRID = "hybrid"


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    FULL = "full"


class Course(SQLModel, table=True):
    """Course/Class model"""

    __tablename__ = "courses"

    id: Optional[int] = Field(default=None, primary_key=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)

    # Basic information
    title: str = Field(index=True)
    subject: str = Field(index=True)
    level: CourseLevel = Field(index=True)
    description: str

    # Course details
    duration_weeks: int = Field(default=12)
    sessions_per_week: int = Field(default=2)
    session_duration_minutes: int = Field(default=60)
    schedule: List[str] = Field(sa_column=Column(JSON), default=[])  # e.g., ["Mon 4PM", "Wed 4PM"]

    # Pricing
    price: float
    currency: str = Field(default="INR")
    discount_percentage: float = Field(default=0.0)

    # Capacity
    max_students: int = Field(default=20)
    enrolled_students: int = Field(default=0)

    # Mode and language
    mode: CourseMode = Field(default=CourseMode.ONLINE)
    language: str = Field(default="English")

    # Media
    thumbnail_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    syllabus_url: Optional[str] = None

    # Status and visibility
    status: CourseStatus = Field(default=CourseStatus.DRAFT)
    is_featured: bool = Field(default=False)

    # Statistics
    total_enrollments: int = Field(default=0)
    average_rating: float = Field(default=0.0)
    total_reviews: int = Field(default=0)
    completion_rate: float = Field(default=0.0)

    # SEO and tags
    tags: List[str] = Field(sa_column=Column(JSON), default=[])
    prerequisites: List[str] = Field(sa_column=Column(JSON), default=[])
    learning_outcomes: List[str] = Field(sa_column=Column(JSON), default=[])

    # Vector embedding for AI recommendations
    embedding: Optional[List[float]] = Field(sa_column=get_vector_column(1536), default=None)

    # Timestamps
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

    # Relationships
    teacher: "Teacher" = Relationship(back_populates="courses")
    enrollments: List["Enrollment"] = Relationship(back_populates="course")
    # Note: Review relationship removed to avoid circular dependency issues


class CourseCreate(SQLModel):
    """Schema for creating a course"""

    title: str
    subject: str
    level: CourseLevel
    description: str
    duration_weeks: int = 12
    sessions_per_week: int = 2
    session_duration_minutes: int = 60
    schedule: List[str] = []
    price: float
    max_students: int = 20
    mode: CourseMode = CourseMode.ONLINE
    language: str = "English"
    tags: List[str] = []
    prerequisites: List[str] = []
    learning_outcomes: List[str] = []


class CourseUpdate(SQLModel):
    """Schema for updating a course"""

    title: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[CourseLevel] = None
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    sessions_per_week: Optional[int] = None
    session_duration_minutes: Optional[int] = None
    schedule: Optional[List[str]] = None
    price: Optional[float] = None
    max_students: Optional[int] = None
    mode: Optional[CourseMode] = None
    language: Optional[str] = None
    status: Optional[CourseStatus] = None


class CourseResponse(SQLModel):
    """Schema for course response"""

    id: int
    teacher_id: int
    title: str
    subject: str
    level: CourseLevel
    description: str
    duration_weeks: int
    sessions_per_week: int
    session_duration_minutes: int
    schedule: List[str]
    price: float
    currency: str
    discount_percentage: float
    max_students: int
    enrolled_students: int
    mode: CourseMode
    language: str
    thumbnail_url: Optional[str]
    preview_video_url: Optional[str]
    status: CourseStatus
    average_rating: float
    total_reviews: int
    tags: List[str]
    created_at: datetime
    start_date: Optional[datetime]
