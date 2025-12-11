"""
Repository interfaces for tuition functionality.
"""

from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from ..entities.tuition import (
    AssignmentEntity,
    AssignmentSubmissionEntity,
    ProgressReportEntity,
    QuizAttemptEntity,
    QuizEntity,
    SessionAttendanceEntity,
    StudyMaterialEntity,
    TuitionSessionEntity,
)


class TuitionSessionRepositoryInterface(ABC):
    """Interface for tuition session repository"""

    @abstractmethod
    async def create(self, session: TuitionSessionEntity) -> TuitionSessionEntity:
        """Create a new session"""
        pass

    @abstractmethod
    async def get_by_id(self, session_id: int) -> Optional[TuitionSessionEntity]:
        """Get session by ID"""
        pass

    @abstractmethod
    async def update(self, session: TuitionSessionEntity) -> TuitionSessionEntity:
        """Update session"""
        pass

    @abstractmethod
    async def delete(self, session_id: int) -> bool:
        """Delete session"""
        pass

    @abstractmethod
    async def get_course_sessions(
        self, course_id: int, skip: int = 0, limit: int = 100, status: Optional[str] = None
    ) -> List[TuitionSessionEntity]:
        """Get sessions for a course"""
        pass

    @abstractmethod
    async def get_teacher_sessions(
        self, teacher_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> List[TuitionSessionEntity]:
        """Get sessions for a teacher"""
        pass

    @abstractmethod
    async def get_upcoming_sessions(
        self, teacher_id: Optional[int] = None, course_id: Optional[int] = None, limit: int = 10
    ) -> List[TuitionSessionEntity]:
        """Get upcoming sessions"""
        pass

    @abstractmethod
    async def get_sessions_by_date(
        self, target_date: date, teacher_id: Optional[int] = None
    ) -> List[TuitionSessionEntity]:
        """Get sessions for a specific date"""
        pass

    @abstractmethod
    async def update_status(self, session_id: int, status: str) -> bool:
        """Update session status"""
        pass

    @abstractmethod
    async def get_session_statistics(
        self,
        course_id: Optional[int] = None,
        teacher_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """Get session statistics"""
        pass


class SessionAttendanceRepositoryInterface(ABC):
    """Interface for session attendance repository"""

    @abstractmethod
    async def create(self, attendance: SessionAttendanceEntity) -> SessionAttendanceEntity:
        """Create attendance record"""
        pass

    @abstractmethod
    async def get_by_id(self, attendance_id: int) -> Optional[SessionAttendanceEntity]:
        """Get attendance by ID"""
        pass

    @abstractmethod
    async def update(self, attendance: SessionAttendanceEntity) -> SessionAttendanceEntity:
        """Update attendance"""
        pass

    @abstractmethod
    async def delete(self, attendance_id: int) -> bool:
        """Delete attendance record"""
        pass

    @abstractmethod
    async def get_session_attendance(self, session_id: int) -> List[SessionAttendanceEntity]:
        """Get attendance for a session"""
        pass

    @abstractmethod
    async def get_student_attendance(
        self,
        student_id: int,
        course_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[SessionAttendanceEntity]:
        """Get attendance for a student"""
        pass

    @abstractmethod
    async def mark_attendance(
        self,
        session_id: int,
        student_id: int,
        status: str,
        participation_score: Optional[int] = None,
    ) -> SessionAttendanceEntity:
        """Mark attendance for a student"""
        pass

    @abstractmethod
    async def get_attendance_statistics(
        self,
        student_id: Optional[int] = None,
        course_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """Get attendance statistics"""
        pass

    @abstractmethod
    async def bulk_mark_attendance(
        self, session_id: int, attendance_data: List[Dict[str, Any]]
    ) -> List[SessionAttendanceEntity]:
        """Bulk mark attendance for multiple students"""
        pass


class AssignmentRepositoryInterface(ABC):
    """Interface for assignment repository"""

    @abstractmethod
    async def create(self, assignment: AssignmentEntity) -> AssignmentEntity:
        """Create a new assignment"""
        pass

    @abstractmethod
    async def get_by_id(self, assignment_id: int) -> Optional[AssignmentEntity]:
        """Get assignment by ID"""
        pass

    @abstractmethod
    async def update(self, assignment: AssignmentEntity) -> AssignmentEntity:
        """Update assignment"""
        pass

    @abstractmethod
    async def delete(self, assignment_id: int) -> bool:
        """Delete assignment"""
        pass

    @abstractmethod
    async def get_course_assignments(
        self, course_id: int, skip: int = 0, limit: int = 100, published_only: bool = True
    ) -> List[AssignmentEntity]:
        """Get assignments for a course"""
        pass

    @abstractmethod
    async def get_teacher_assignments(
        self, teacher_id: int, skip: int = 0, limit: int = 100
    ) -> List[AssignmentEntity]:
        """Get assignments created by a teacher"""
        pass

    @abstractmethod
    async def get_upcoming_assignments(
        self, course_id: Optional[int] = None, student_id: Optional[int] = None, limit: int = 10
    ) -> List[AssignmentEntity]:
        """Get upcoming assignments"""
        pass

    @abstractmethod
    async def get_overdue_assignments(
        self, course_id: Optional[int] = None, student_id: Optional[int] = None
    ) -> List[AssignmentEntity]:
        """Get overdue assignments"""
        pass

    @abstractmethod
    async def publish_assignment(self, assignment_id: int) -> bool:
        """Publish an assignment"""
        pass


class AssignmentSubmissionRepositoryInterface(ABC):
    """Interface for assignment submission repository"""

    @abstractmethod
    async def create(self, submission: AssignmentSubmissionEntity) -> AssignmentSubmissionEntity:
        """Create a new submission"""
        pass

    @abstractmethod
    async def get_by_id(self, submission_id: int) -> Optional[AssignmentSubmissionEntity]:
        """Get submission by ID"""
        pass

    @abstractmethod
    async def update(self, submission: AssignmentSubmissionEntity) -> AssignmentSubmissionEntity:
        """Update submission"""
        pass

    @abstractmethod
    async def delete(self, submission_id: int) -> bool:
        """Delete submission"""
        pass

    @abstractmethod
    async def get_assignment_submissions(
        self, assignment_id: int, skip: int = 0, limit: int = 100
    ) -> List[AssignmentSubmissionEntity]:
        """Get submissions for an assignment"""
        pass

    @abstractmethod
    async def get_student_submissions(
        self, student_id: int, course_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[AssignmentSubmissionEntity]:
        """Get submissions by a student"""
        pass

    @abstractmethod
    async def get_student_assignment_submission(
        self, assignment_id: int, student_id: int
    ) -> Optional[AssignmentSubmissionEntity]:
        """Get specific student's submission for an assignment"""
        pass

    @abstractmethod
    async def submit_assignment(
        self, assignment_id: int, student_id: int, submission_data: Dict[str, Any]
    ) -> AssignmentSubmissionEntity:
        """Submit an assignment"""
        pass

    @abstractmethod
    async def grade_submission(
        self, submission_id: int, points: float, grade: str, feedback: Optional[str] = None
    ) -> AssignmentSubmissionEntity:
        """Grade a submission"""
        pass

    @abstractmethod
    async def get_pending_grading(
        self, teacher_id: Optional[int] = None, course_id: Optional[int] = None
    ) -> List[AssignmentSubmissionEntity]:
        """Get submissions pending grading"""
        pass


class StudyMaterialRepositoryInterface(ABC):
    """Interface for study material repository"""

    @abstractmethod
    async def create(self, material: StudyMaterialEntity) -> StudyMaterialEntity:
        """Create a new study material"""
        pass

    @abstractmethod
    async def get_by_id(self, material_id: int) -> Optional[StudyMaterialEntity]:
        """Get material by ID"""
        pass

    @abstractmethod
    async def update(self, material: StudyMaterialEntity) -> StudyMaterialEntity:
        """Update material"""
        pass

    @abstractmethod
    async def delete(self, material_id: int) -> bool:
        """Delete material"""
        pass

    @abstractmethod
    async def get_course_materials(
        self,
        course_id: int,
        category: Optional[str] = None,
        material_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[StudyMaterialEntity]:
        """Get materials for a course"""
        pass

    @abstractmethod
    async def get_session_materials(self, session_id: int) -> List[StudyMaterialEntity]:
        """Get materials for a session"""
        pass

    @abstractmethod
    async def get_public_materials(
        self, skip: int = 0, limit: int = 100
    ) -> List[StudyMaterialEntity]:
        """Get public materials"""
        pass

    @abstractmethod
    async def search_materials(
        self, query: str, course_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[StudyMaterialEntity]:
        """Search materials"""
        pass

    @abstractmethod
    async def increment_view_count(self, material_id: int) -> bool:
        """Increment view count"""
        pass

    @abstractmethod
    async def increment_download_count(self, material_id: int) -> bool:
        """Increment download count"""
        pass


class QuizRepositoryInterface(ABC):
    """Interface for quiz repository"""

    @abstractmethod
    async def create(self, quiz: QuizEntity) -> QuizEntity:
        """Create a new quiz"""
        pass

    @abstractmethod
    async def get_by_id(self, quiz_id: int) -> Optional[QuizEntity]:
        """Get quiz by ID"""
        pass

    @abstractmethod
    async def update(self, quiz: QuizEntity) -> QuizEntity:
        """Update quiz"""
        pass

    @abstractmethod
    async def delete(self, quiz_id: int) -> bool:
        """Delete quiz"""
        pass

    @abstractmethod
    async def get_course_quizzes(
        self, course_id: int, published_only: bool = True, skip: int = 0, limit: int = 100
    ) -> List[QuizEntity]:
        """Get quizzes for a course"""
        pass

    @abstractmethod
    async def get_available_quizzes(self, course_id: int, student_id: int) -> List[QuizEntity]:
        """Get available quizzes for a student"""
        pass

    @abstractmethod
    async def publish_quiz(self, quiz_id: int) -> bool:
        """Publish a quiz"""
        pass


class QuizAttemptRepositoryInterface(ABC):
    """Interface for quiz attempt repository"""

    @abstractmethod
    async def create(self, attempt: QuizAttemptEntity) -> QuizAttemptEntity:
        """Create a new quiz attempt"""
        pass

    @abstractmethod
    async def get_by_id(self, attempt_id: int) -> Optional[QuizAttemptEntity]:
        """Get attempt by ID"""
        pass

    @abstractmethod
    async def update(self, attempt: QuizAttemptEntity) -> QuizAttemptEntity:
        """Update attempt"""
        pass

    @abstractmethod
    async def delete(self, attempt_id: int) -> bool:
        """Delete attempt"""
        pass

    @abstractmethod
    async def get_quiz_attempts(
        self, quiz_id: int, student_id: Optional[int] = None
    ) -> List[QuizAttemptEntity]:
        """Get attempts for a quiz"""
        pass

    @abstractmethod
    async def get_student_attempts(
        self, student_id: int, quiz_id: Optional[int] = None, course_id: Optional[int] = None
    ) -> List[QuizAttemptEntity]:
        """Get attempts by a student"""
        pass

    @abstractmethod
    async def get_student_quiz_attempts(
        self, quiz_id: int, student_id: int
    ) -> List[QuizAttemptEntity]:
        """Get specific student's attempts for a quiz"""
        pass

    @abstractmethod
    async def start_attempt(
        self, quiz_id: int, student_id: int, enrollment_id: int
    ) -> QuizAttemptEntity:
        """Start a new quiz attempt"""
        pass

    @abstractmethod
    async def submit_attempt(self, attempt_id: int, answers: Dict[str, Any]) -> QuizAttemptEntity:
        """Submit a quiz attempt"""
        pass

    @abstractmethod
    async def get_attempt_count(self, quiz_id: int, student_id: int) -> int:
        """Get number of attempts by student for a quiz"""
        pass


class ProgressReportRepositoryInterface(ABC):
    """Interface for progress report repository"""

    @abstractmethod
    async def create(self, report: ProgressReportEntity) -> ProgressReportEntity:
        """Create a new progress report"""
        pass

    @abstractmethod
    async def get_by_id(self, report_id: int) -> Optional[ProgressReportEntity]:
        """Get report by ID"""
        pass

    @abstractmethod
    async def update(self, report: ProgressReportEntity) -> ProgressReportEntity:
        """Update report"""
        pass

    @abstractmethod
    async def delete(self, report_id: int) -> bool:
        """Delete report"""
        pass

    @abstractmethod
    async def get_student_reports(
        self, student_id: int, course_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[ProgressReportEntity]:
        """Get reports for a student"""
        pass

    @abstractmethod
    async def get_course_reports(
        self, course_id: int, report_period: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[ProgressReportEntity]:
        """Get reports for a course"""
        pass

    @abstractmethod
    async def get_latest_report(
        self, student_id: int, course_id: int
    ) -> Optional[ProgressReportEntity]:
        """Get latest report for a student in a course"""
        pass

    @abstractmethod
    async def generate_report(
        self, enrollment_id: int, report_period: str, start_date: datetime, end_date: datetime
    ) -> ProgressReportEntity:
        """Generate a new progress report"""
        pass

    @abstractmethod
    async def get_reports_by_period(
        self,
        report_period: str,
        start_date: datetime,
        end_date: datetime,
        teacher_id: Optional[int] = None,
    ) -> List[ProgressReportEntity]:
        """Get reports by period"""
        pass
