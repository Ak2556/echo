"""
Domain entities for tuition functionality.
"""
from dataclasses import dataclass
from typing import List, Optional, Dict
from datetime import datetime, time
from enum import Enum


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


@dataclass
class TuitionSessionEntity:
    """Tuition session domain entity"""
    id: Optional[int]
    course_id: int
    teacher_id: int
    title: str
    description: Optional[str]
    session_number: int
    duration_minutes: int
    scheduled_date: datetime
    start_time: time
    end_time: time
    status: SessionStatus
    session_type: str
    is_recorded: bool
    meeting_url: Optional[str]
    recording_url: Optional[str]
    agenda: List[str]
    materials: List[Dict]
    teacher_notes: Optional[str]
    session_summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]

    def can_start(self) -> bool:
        """Check if session can be started"""
        return self.status == SessionStatus.SCHEDULED

    def can_end(self) -> bool:
        """Check if session can be ended"""
        return self.status == SessionStatus.IN_PROGRESS

    def start_session(self) -> None:
        """Start the session"""
        if self.can_start():
            self.status = SessionStatus.IN_PROGRESS
            self.started_at = datetime.utcnow()

    def end_session(self, summary: Optional[str] = None) -> None:
        """End the session"""
        if self.can_end():
            self.status = SessionStatus.COMPLETED
            self.ended_at = datetime.utcnow()
            if summary:
                self.session_summary = summary

    def cancel_session(self, reason: Optional[str] = None) -> None:
        """Cancel the session"""
        if self.status in [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]:
            self.status = SessionStatus.CANCELLED
            if reason and self.teacher_notes:
                self.teacher_notes += f"\nCancellation reason: {reason}"
            elif reason:
                self.teacher_notes = f"Cancellation reason: {reason}"

    def reschedule_session(self, new_date: datetime, new_start: time, new_end: time) -> None:
        """Reschedule the session"""
        if self.status == SessionStatus.SCHEDULED:
            self.scheduled_date = new_date
            self.start_time = new_start
            self.end_time = new_end
            self.status = SessionStatus.RESCHEDULED

    def get_duration_hours(self) -> float:
        """Get session duration in hours"""
        return self.duration_minutes / 60.0

    def is_past_due(self) -> bool:
        """Check if session is past its scheduled time"""
        session_datetime = datetime.combine(
            self.scheduled_date.date(),
            self.start_time
        )
        return datetime.now() > session_datetime and self.status == SessionStatus.SCHEDULED


@dataclass
class SessionAttendanceEntity:
    """Session attendance domain entity"""
    id: Optional[int]
    session_id: int
    student_id: int
    enrollment_id: int
    status: AttendanceStatus
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    duration_minutes: int
    participation_score: Optional[int]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    def mark_present(self, check_in_time: Optional[datetime] = None) -> None:
        """Mark student as present"""
        self.status = AttendanceStatus.PRESENT
        self.check_in_time = check_in_time or datetime.utcnow()

    def mark_absent(self, reason: Optional[str] = None) -> None:
        """Mark student as absent"""
        self.status = AttendanceStatus.ABSENT
        if reason:
            self.notes = reason

    def mark_late(self, check_in_time: Optional[datetime] = None) -> None:
        """Mark student as late"""
        self.status = AttendanceStatus.LATE
        self.check_in_time = check_in_time or datetime.utcnow()

    def check_out(self, check_out_time: Optional[datetime] = None) -> None:
        """Record check out time"""
        self.check_out_time = check_out_time or datetime.utcnow()
        if self.check_in_time and self.check_out_time:
            duration = self.check_out_time - self.check_in_time
            self.duration_minutes = int(duration.total_seconds() / 60)

    def set_participation_score(self, score: int) -> None:
        """Set participation score (0-10)"""
        if 0 <= score <= 10:
            self.participation_score = score


@dataclass
class AssignmentEntity:
    """Assignment domain entity"""
    id: Optional[int]
    course_id: int
    teacher_id: int
    session_id: Optional[int]
    title: str
    description: str
    instructions: Optional[str]
    max_points: int
    assigned_date: datetime
    due_date: datetime
    allow_late_submission: bool
    late_penalty_percentage: float
    attachments: List[Dict]
    rubric: Optional[Dict]
    is_published: bool
    submission_type: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    def publish(self) -> None:
        """Publish the assignment"""
        if not self.is_published:
            self.is_published = True
            self.published_at = datetime.utcnow()

    def is_overdue(self) -> bool:
        """Check if assignment is overdue"""
        return datetime.utcnow() > self.due_date

    def can_submit(self) -> bool:
        """Check if assignment can still be submitted"""
        return self.is_published and (not self.is_overdue() or self.allow_late_submission)

    def calculate_late_penalty(self, submission_date: datetime) -> float:
        """Calculate late penalty percentage"""
        if submission_date <= self.due_date:
            return 0.0
        return self.late_penalty_percentage if self.allow_late_submission else 100.0

    def get_effective_points(self, submission_date: datetime) -> int:
        """Get effective max points considering late penalty"""
        penalty = self.calculate_late_penalty(submission_date)
        return int(self.max_points * (1 - penalty / 100))


@dataclass
class AssignmentSubmissionEntity:
    """Assignment submission domain entity"""
    id: Optional[int]
    assignment_id: int
    student_id: int
    enrollment_id: int
    status: AssignmentStatus
    submission_text: Optional[str]
    attachments: List[Dict]
    points_earned: Optional[float]
    grade: Optional[str]
    feedback: Optional[str]
    submitted_at: Optional[datetime]
    graded_at: Optional[datetime]
    is_late: bool
    created_at: datetime
    updated_at: datetime

    def submit(self, text: Optional[str] = None, attachments: List[Dict] = None) -> None:
        """Submit the assignment"""
        self.status = AssignmentStatus.SUBMITTED
        self.submitted_at = datetime.utcnow()
        if text:
            self.submission_text = text
        if attachments:
            self.attachments = attachments

    def grade(self, points: float, grade: str, feedback: Optional[str] = None) -> None:
        """Grade the submission"""
        self.status = AssignmentStatus.GRADED
        self.points_earned = points
        self.grade = grade
        self.feedback = feedback
        self.graded_at = datetime.utcnow()

    def calculate_percentage(self, max_points: int) -> float:
        """Calculate percentage score"""
        if self.points_earned is not None and max_points > 0:
            return (self.points_earned / max_points) * 100
        return 0.0

    def is_passing(self, passing_threshold: float = 60.0, max_points: int = 100) -> bool:
        """Check if submission is passing"""
        percentage = self.calculate_percentage(max_points)
        return percentage >= passing_threshold


@dataclass
class StudyMaterialEntity:
    """Study material domain entity"""
    id: Optional[int]
    course_id: int
    teacher_id: int
    session_id: Optional[int]
    title: str
    description: Optional[str]
    material_type: str
    file_url: Optional[str]
    file_size: Optional[int]
    content: Optional[str]
    external_url: Optional[str]
    category: Optional[str]
    tags: List[str]
    order_index: int
    is_public: bool
    requires_enrollment: bool
    download_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime

    def increment_view_count(self) -> None:
        """Increment view count"""
        self.view_count += 1

    def increment_download_count(self) -> None:
        """Increment download count"""
        self.download_count += 1

    def is_accessible_to_user(self, user_enrolled: bool, user_is_teacher: bool = False) -> bool:
        """Check if material is accessible to user"""
        if user_is_teacher or self.is_public:
            return True
        return not self.requires_enrollment or user_enrolled

    def get_file_size_mb(self) -> float:
        """Get file size in MB"""
        if self.file_size:
            return self.file_size / (1024 * 1024)
        return 0.0


@dataclass
class QuizEntity:
    """Quiz domain entity"""
    id: Optional[int]
    course_id: int
    teacher_id: int
    session_id: Optional[int]
    title: str
    description: Optional[str]
    instructions: Optional[str]
    duration_minutes: int
    available_from: datetime
    available_until: datetime
    max_attempts: int
    show_results_immediately: bool
    randomize_questions: bool
    total_points: int
    passing_score: Optional[int]
    is_published: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    def is_available(self) -> bool:
        """Check if quiz is currently available"""
        now = datetime.utcnow()
        return (
            self.is_published and
            self.available_from <= now <= self.available_until
        )

    def publish(self) -> None:
        """Publish the quiz"""
        if not self.is_published:
            self.is_published = True
            self.published_at = datetime.utcnow()

    def can_attempt(self, attempts_count: int) -> bool:
        """Check if user can attempt the quiz"""
        return self.is_available() and attempts_count < self.max_attempts

    def calculate_passing_percentage(self) -> float:
        """Calculate passing percentage"""
        if self.passing_score and self.total_points > 0:
            return (self.passing_score / self.total_points) * 100
        return 60.0  # Default passing percentage


@dataclass
class QuizAttemptEntity:
    """Quiz attempt domain entity"""
    id: Optional[int]
    quiz_id: int
    student_id: int
    enrollment_id: int
    attempt_number: int
    answers: Dict
    score: Optional[int]
    percentage: Optional[float]
    passed: Optional[bool]
    started_at: datetime
    submitted_at: Optional[datetime]
    time_taken_minutes: Optional[int]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    def submit(self, answers: Dict) -> None:
        """Submit the quiz attempt"""
        self.answers = answers
        self.submitted_at = datetime.utcnow()
        self.is_completed = True
        
        # Calculate time taken
        if self.started_at and self.submitted_at:
            duration = self.submitted_at - self.started_at
            self.time_taken_minutes = int(duration.total_seconds() / 60)

    def calculate_score(self, total_points: int, correct_answers: int) -> None:
        """Calculate and set the score"""
        self.score = correct_answers
        if total_points > 0:
            self.percentage = (correct_answers / total_points) * 100

    def determine_pass_fail(self, passing_score: int) -> None:
        """Determine if attempt passed or failed"""
        if self.score is not None:
            self.passed = self.score >= passing_score

    def is_time_expired(self, duration_minutes: int) -> bool:
        """Check if time limit has been exceeded"""
        if not self.started_at:
            return False
        
        elapsed = datetime.utcnow() - self.started_at
        elapsed_minutes = elapsed.total_seconds() / 60
        return elapsed_minutes > duration_minutes


@dataclass
class ProgressReportEntity:
    """Progress report domain entity"""
    id: Optional[int]
    enrollment_id: int
    student_id: int
    course_id: int
    teacher_id: int
    report_period: str
    start_date: datetime
    end_date: datetime
    total_sessions: int
    attended_sessions: int
    attendance_percentage: float
    assignments_completed: int
    assignments_total: int
    average_assignment_score: float
    quizzes_taken: int
    quizzes_passed: int
    average_quiz_score: float
    overall_grade: Optional[str]
    overall_percentage: float
    improvement_areas: List[str]
    strengths: List[str]
    teacher_comments: Optional[str]
    recommendations: Optional[str]
    created_at: datetime
    updated_at: datetime

    def calculate_attendance_percentage(self) -> None:
        """Calculate attendance percentage"""
        if self.total_sessions > 0:
            self.attendance_percentage = (self.attended_sessions / self.total_sessions) * 100
        else:
            self.attendance_percentage = 0.0

    def calculate_assignment_completion_rate(self) -> float:
        """Calculate assignment completion rate"""
        if self.assignments_total > 0:
            return (self.assignments_completed / self.assignments_total) * 100
        return 0.0

    def calculate_quiz_pass_rate(self) -> float:
        """Calculate quiz pass rate"""
        if self.quizzes_taken > 0:
            return (self.quizzes_passed / self.quizzes_taken) * 100
        return 0.0

    def determine_overall_grade(self) -> str:
        """Determine overall letter grade based on percentage"""
        if self.overall_percentage >= 90:
            return "A"
        elif self.overall_percentage >= 80:
            return "B"
        elif self.overall_percentage >= 70:
            return "C"
        elif self.overall_percentage >= 60:
            return "D"
        else:
            return "F"

    def add_improvement_area(self, area: str) -> None:
        """Add an improvement area"""
        if area not in self.improvement_areas:
            self.improvement_areas.append(area)

    def add_strength(self, strength: str) -> None:
        """Add a strength"""
        if strength not in self.strengths:
            self.strengths.append(strength)

    def is_satisfactory_performance(self, threshold: float = 70.0) -> bool:
        """Check if performance is satisfactory"""
        return self.overall_percentage >= threshold