from sqlmodel import SQLModel, Field, Relationship, Column
from typing import Optional, List
from datetime import datetime, time, timezone
from enum import Enum
from sqlalchemy import JSON


class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class AssignmentStatus(str, Enum):
    ASSIGNED = "assigned"
    SUBMITTED = "submitted"
    GRADED = "graded"
    OVERDUE = "overdue"


class TuitionSession(SQLModel, table=True):
    """Individual tuition sessions"""
    __tablename__ = "tuition_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)

    # Session details
    title: str
    description: Optional[str] = None
    session_number: int
    duration_minutes: int = Field(default=60)
    
    # Scheduling
    scheduled_date: datetime
    start_time: time
    end_time: time
    timezone: str = Field(default="UTC")
    
    # Status and type
    status: SessionStatus = Field(default=SessionStatus.SCHEDULED)
    session_type: str = Field(default="regular")  # regular, makeup, extra
    is_recorded: bool = Field(default=False)
    
    # Online session details
    meeting_url: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None
    recording_url: Optional[str] = None
    
    # Content and materials
    agenda: List[str] = Field(sa_column=Column(JSON), default=[])
    materials: List[dict] = Field(sa_column=Column(JSON), default=[])  # files, links, etc.
    homework_assigned: Optional[str] = None
    
    # Notes
    teacher_notes: Optional[str] = None
    session_summary: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    # Relationships
    course: "Course" = Relationship()
    teacher: "Teacher" = Relationship()
    attendances: List["SessionAttendance"] = Relationship(back_populates="session")
    assignments: List["Assignment"] = Relationship(back_populates="session")


class SessionAttendance(SQLModel, table=True):
    """Student attendance for sessions"""
    __tablename__ = "session_attendances"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="tuition_sessions.id", index=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    enrollment_id: int = Field(foreign_key="enrollments.id", index=True)

    # Attendance details
    status: AttendanceStatus = Field(default=AttendanceStatus.ABSENT)
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    duration_minutes: int = Field(default=0)
    
    # Participation
    participation_score: Optional[int] = Field(default=None, ge=0, le=10)
    notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    session: TuitionSession = Relationship(back_populates="attendances")
    student: "User" = Relationship()
    enrollment: "Enrollment" = Relationship()


class Assignment(SQLModel, table=True):
    """Assignments and homework"""
    __tablename__ = "assignments"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)
    session_id: Optional[int] = Field(foreign_key="tuition_sessions.id", default=None)

    # Assignment details
    title: str
    description: str
    instructions: Optional[str] = None
    max_points: int = Field(default=100)
    
    # Timing
    assigned_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: datetime
    allow_late_submission: bool = Field(default=True)
    late_penalty_percentage: float = Field(default=10.0)
    
    # Content
    attachments: List[dict] = Field(sa_column=Column(JSON), default=[])
    rubric: Optional[dict] = Field(sa_column=Column(JSON), default=None)
    
    # Settings
    is_published: bool = Field(default=False)
    submission_type: str = Field(default="file")  # file, text, url
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

    # Relationships
    course: "Course" = Relationship()
    teacher: "Teacher" = Relationship()
    session: Optional[TuitionSession] = Relationship(back_populates="assignments")
    submissions: List["AssignmentSubmission"] = Relationship(back_populates="assignment")


class AssignmentSubmission(SQLModel, table=True):
    """Student assignment submissions"""
    __tablename__ = "assignment_submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="assignments.id", index=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    enrollment_id: int = Field(foreign_key="enrollments.id", index=True)

    # Submission details
    status: AssignmentStatus = Field(default=AssignmentStatus.ASSIGNED)
    submission_text: Optional[str] = None
    attachments: List[dict] = Field(sa_column=Column(JSON), default=[])
    
    # Grading
    points_earned: Optional[float] = None
    grade: Optional[str] = None
    feedback: Optional[str] = None
    
    # Timing
    submitted_at: Optional[datetime] = None
    graded_at: Optional[datetime] = None
    is_late: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    assignment: Assignment = Relationship(back_populates="submissions")
    student: "User" = Relationship()
    enrollment: "Enrollment" = Relationship()


class StudyMaterial(SQLModel, table=True):
    """Study materials and resources"""
    __tablename__ = "study_materials"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)
    session_id: Optional[int] = Field(foreign_key="tuition_sessions.id", default=None)

    # Material details
    title: str
    description: Optional[str] = None
    material_type: str  # pdf, video, link, image, document
    file_url: Optional[str] = None
    file_size: Optional[int] = None  # in bytes
    
    # Content
    content: Optional[str] = None  # for text-based materials
    external_url: Optional[str] = None
    
    # Organization
    category: Optional[str] = None
    tags: List[str] = Field(sa_column=Column(JSON), default=[])
    order_index: int = Field(default=0)
    
    # Access control
    is_public: bool = Field(default=False)
    requires_enrollment: bool = Field(default=True)
    
    # Statistics
    download_count: int = Field(default=0)
    view_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    course: "Course" = Relationship()
    teacher: "Teacher" = Relationship()
    session: Optional[TuitionSession] = Relationship()


class Quiz(SQLModel, table=True):
    """Quizzes and assessments"""
    __tablename__ = "quizzes"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)
    session_id: Optional[int] = Field(foreign_key="tuition_sessions.id", default=None)

    # Quiz details
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    
    # Timing
    duration_minutes: int = Field(default=30)
    available_from: datetime
    available_until: datetime
    
    # Settings
    max_attempts: int = Field(default=1)
    show_results_immediately: bool = Field(default=True)
    randomize_questions: bool = Field(default=False)
    
    # Scoring
    total_points: int = Field(default=0)
    passing_score: Optional[int] = None
    
    # Status
    is_published: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

    # Relationships
    course: "Course" = Relationship()
    teacher: "Teacher" = Relationship()
    session: Optional[TuitionSession] = Relationship()
    questions: List["QuizQuestion"] = Relationship(back_populates="quiz")
    attempts: List["QuizAttempt"] = Relationship(back_populates="quiz")


class QuizQuestion(SQLModel, table=True):
    """Quiz questions"""
    __tablename__ = "quiz_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quizzes.id", index=True)

    # Question details
    question_text: str
    question_type: str = Field(default="multiple_choice")  # multiple_choice, true_false, short_answer, essay
    points: int = Field(default=1)
    order_index: int = Field(default=0)
    
    # Options (for multiple choice)
    options: List[dict] = Field(sa_column=Column(JSON), default=[])  # [{"text": "Option A", "is_correct": true}]
    correct_answer: Optional[str] = None  # for short answer questions
    
    # Media
    image_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    quiz: Quiz = Relationship(back_populates="questions")


class QuizAttempt(SQLModel, table=True):
    """Student quiz attempts"""
    __tablename__ = "quiz_attempts"

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quizzes.id", index=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    enrollment_id: int = Field(foreign_key="enrollments.id", index=True)

    # Attempt details
    attempt_number: int = Field(default=1)
    answers: dict = Field(sa_column=Column(JSON), default={})  # question_id -> answer
    
    # Scoring
    score: Optional[int] = None
    percentage: Optional[float] = None
    passed: Optional[bool] = None
    
    # Timing
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submitted_at: Optional[datetime] = None
    time_taken_minutes: Optional[int] = None
    
    # Status
    is_completed: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    quiz: Quiz = Relationship(back_populates="attempts")
    student: "User" = Relationship()
    enrollment: "Enrollment" = Relationship()


class ProgressReport(SQLModel, table=True):
    """Student progress reports"""
    __tablename__ = "progress_reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    enrollment_id: int = Field(foreign_key="enrollments.id", index=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)

    # Report period
    report_period: str  # weekly, monthly, quarterly
    start_date: datetime
    end_date: datetime
    
    # Attendance metrics
    total_sessions: int = Field(default=0)
    attended_sessions: int = Field(default=0)
    attendance_percentage: float = Field(default=0.0)
    
    # Academic performance
    assignments_completed: int = Field(default=0)
    assignments_total: int = Field(default=0)
    average_assignment_score: float = Field(default=0.0)
    
    # Quiz performance
    quizzes_taken: int = Field(default=0)
    quizzes_passed: int = Field(default=0)
    average_quiz_score: float = Field(default=0.0)
    
    # Overall metrics
    overall_grade: Optional[str] = None
    overall_percentage: float = Field(default=0.0)
    improvement_areas: List[str] = Field(sa_column=Column(JSON), default=[])
    strengths: List[str] = Field(sa_column=Column(JSON), default=[])
    
    # Teacher feedback
    teacher_comments: Optional[str] = None
    recommendations: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    enrollment: "Enrollment" = Relationship()
    student: "User" = Relationship()
    course: "Course" = Relationship()
    teacher: "Teacher" = Relationship()


# Pydantic schemas for API

class TuitionSessionCreate(SQLModel):
    """Schema for creating a tuition session"""
    course_id: int
    title: str
    description: Optional[str] = None
    session_number: int
    scheduled_date: datetime
    start_time: time
    end_time: time
    agenda: List[str] = []


class TuitionSessionUpdate(SQLModel):
    """Schema for updating a tuition session"""
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[SessionStatus] = None
    meeting_url: Optional[str] = None


class AttendanceCreate(SQLModel):
    """Schema for marking attendance"""
    student_id: int
    status: AttendanceStatus
    participation_score: Optional[int] = None


class AssignmentCreate(SQLModel):
    """Schema for creating an assignment"""
    course_id: int
    title: str
    description: str
    due_date: datetime
    max_points: int = 100
    session_id: Optional[int] = None


class AssignmentSubmissionCreate(SQLModel):
    """Schema for submitting an assignment"""
    submission_text: Optional[str] = None
    attachments: List[dict] = []


class QuizCreate(SQLModel):
    """Schema for creating a quiz"""
    course_id: int
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    available_from: datetime
    available_until: datetime
    questions: List[dict] = []


class StudyMaterialCreate(SQLModel):
    """Schema for creating study material"""
    course_id: int
    title: str
    description: Optional[str] = None
    material_type: str
    file_url: Optional[str] = None
    content: Optional[str] = None