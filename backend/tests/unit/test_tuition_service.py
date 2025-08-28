"""
Unit tests for Tuition Service.
"""
import pytest
from datetime import datetime, date, time, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.tuition_service import TuitionService
from app.models.tuition import (
    TuitionSession, TuitionSessionCreate, TuitionSessionUpdate, SessionStatus,
    SessionAttendance, AttendanceCreate, AttendanceStatus,
    Assignment, AssignmentCreate, AssignmentSubmission, AssignmentStatus,
    StudyMaterial, StudyMaterialCreate,
    Quiz, QuizCreate, QuizAttempt, QuizQuestion,
    ProgressReport
)
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.core.exceptions import ValidationException, NotFoundException

# Aliases for test compatibility
ValidationError = ValidationException
NotFoundError = NotFoundException


@pytest.fixture
def mock_db():
    """Mock database session"""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def tuition_service(mock_db):
    """Create tuition service instance"""
    return TuitionService(mock_db)


class TestSessionManagement:
    """Tests for session management methods"""

    @pytest.mark.asyncio
    async def test_create_session_success(self, tuition_service, mock_db):
        """Test creating a session successfully"""
        # Setup
        course = Course(id=1, teacher_id=1, title="Test Course")
        mock_db.get.return_value = course

        session_data = TuitionSessionCreate(
            course_id=1,
            title="Test Session",
            session_number=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        # Mock _check_session_conflicts
        with patch.object(tuition_service, '_check_session_conflicts', return_value=False):
            result = await tuition_service.create_session(session_data, teacher_id=1)

        # Verify
        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_create_session_course_not_found(self, tuition_service, mock_db):
        """Test creating session with non-existent course"""
        mock_db.get.return_value = None

        session_data = TuitionSessionCreate(
            course_id=999,
            title="Test Session",
            session_number=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        with pytest.raises(NotFoundError, match="Course not found"):
            await tuition_service.create_session(session_data, teacher_id=1)

    @pytest.mark.asyncio
    async def test_create_session_unauthorized_teacher(self, tuition_service, mock_db):
        """Test creating session with unauthorized teacher"""
        course = Course(id=1, teacher_id=1, title="Test Course")
        mock_db.get.return_value = course

        session_data = TuitionSessionCreate(
            course_id=1,
            title="Test Session",
            session_number=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        with pytest.raises(ValidationError, match="Teacher not authorized"):
            await tuition_service.create_session(session_data, teacher_id=2)

    @pytest.mark.asyncio
    async def test_create_session_scheduling_conflict(self, tuition_service, mock_db):
        """Test creating session with scheduling conflict"""
        course = Course(id=1, teacher_id=1, title="Test Course")
        mock_db.get.return_value = course

        session_data = TuitionSessionCreate(
            course_id=1,
            title="Test Session",
            session_number=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        # Mock _check_session_conflicts to return True (conflict exists)
        with patch.object(tuition_service, '_check_session_conflicts', return_value=True):
            with pytest.raises(ValidationError, match="Session conflicts with existing schedule"):
                await tuition_service.create_session(session_data, teacher_id=1)

    @pytest.mark.asyncio
    async def test_get_session_by_id(self, tuition_service, mock_db):
        """Test getting session by ID"""
        mock_session = TuitionSession(id=1, title="Test Session")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_session
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_session_by_id(1)

        assert result == mock_session
        assert mock_db.execute.called

    @pytest.mark.asyncio
    async def test_update_session_success(self, tuition_service, mock_db):
        """Test updating session successfully"""
        mock_session = TuitionSession(
            id=1,
            title="Old Title",
            teacher_id=1,
            scheduled_date=date.today(),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            session_data = TuitionSessionUpdate(title="New Title")
            result = await tuition_service.update_session(1, session_data)

        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_update_session_not_found(self, tuition_service, mock_db):
        """Test updating non-existent session"""
        with patch.object(tuition_service, 'get_session_by_id', return_value=None):
            session_data = TuitionSessionUpdate(title="New Title")

            with pytest.raises(NotFoundError, match="Session not found"):
                await tuition_service.update_session(1, session_data)

    @pytest.mark.asyncio
    async def test_start_session_success(self, tuition_service, mock_db):
        """Test starting a session successfully"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.SCHEDULED
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            result = await tuition_service.start_session(1, teacher_id=1)

        assert mock_session.status == SessionStatus.IN_PROGRESS
        assert mock_session.started_at is not None
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_start_session_unauthorized(self, tuition_service, mock_db):
        """Test starting session with unauthorized teacher"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.SCHEDULED
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with pytest.raises(ValidationError, match="Not authorized"):
                await tuition_service.start_session(1, teacher_id=2)

    @pytest.mark.asyncio
    async def test_start_session_invalid_status(self, tuition_service, mock_db):
        """Test starting session with invalid status"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.COMPLETED
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with pytest.raises(ValidationError, match="Session cannot be started"):
                await tuition_service.start_session(1, teacher_id=1)

    @pytest.mark.asyncio
    async def test_end_session_success(self, tuition_service, mock_db):
        """Test ending a session successfully"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.IN_PROGRESS,
            started_at=datetime.now(timezone.utc)
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            result = await tuition_service.end_session(1, teacher_id=1, summary="Great session")

        assert mock_session.status == SessionStatus.COMPLETED
        assert mock_session.ended_at is not None
        assert mock_session.session_summary == "Great session"
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_list_sessions_with_filters(self, tuition_service, mock_db):
        """Test listing sessions with filters"""
        mock_sessions = [TuitionSession(id=1), TuitionSession(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_sessions
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_sessions(
            course_id=1,
            teacher_id=1,
            status=SessionStatus.SCHEDULED,
            skip=0,
            limit=10
        )

        assert len(result) == 2
        assert mock_db.execute.called


class TestAttendance:
    """Tests for attendance methods"""

    @pytest.mark.asyncio
    async def test_mark_attendance_new_record(self, tuition_service, mock_db):
        """Test marking attendance for new student"""
        # Mock no existing attendance
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Mock enrollment
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        with patch.object(tuition_service, '_get_student_enrollment', return_value=mock_enrollment):
            result = await tuition_service.mark_attendance(
                session_id=1,
                student_id=1,
                status=AttendanceStatus.PRESENT,
                participation_score=5
            )

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_mark_attendance_update_existing(self, tuition_service, mock_db):
        """Test updating existing attendance"""
        mock_attendance = SessionAttendance(
            id=1,
            session_id=1,
            student_id=1,
            enrollment_id=1,
            status=AttendanceStatus.ABSENT
        )
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_attendance
        mock_db.execute.return_value = mock_result

        result = await tuition_service.mark_attendance(
            session_id=1,
            student_id=1,
            status=AttendanceStatus.PRESENT
        )

        assert mock_attendance.status == AttendanceStatus.PRESENT
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_mark_attendance_student_not_enrolled(self, tuition_service, mock_db):
        """Test marking attendance for non-enrolled student"""
        # Mock no existing attendance
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Mock no enrollment
        with patch.object(tuition_service, '_get_student_enrollment', return_value=None):
            with pytest.raises(ValidationError, match="Student not enrolled"):
                await tuition_service.mark_attendance(
                    session_id=1,
                    student_id=1,
                    status=AttendanceStatus.PRESENT
                )

    @pytest.mark.asyncio
    async def test_mark_bulk_attendance(self, tuition_service, mock_db):
        """Test marking bulk attendance"""
        attendance_data = [
            AttendanceCreate(session_id=1, student_id=1, status=AttendanceStatus.PRESENT),
            AttendanceCreate(session_id=1, student_id=2, status=AttendanceStatus.ABSENT)
        ]

        with patch.object(tuition_service, 'mark_attendance', new_callable=AsyncMock) as mock_mark:
            mock_mark.return_value = SessionAttendance(id=1)
            result = await tuition_service.mark_bulk_attendance(1, attendance_data)

        assert len(result) == 2
        assert mock_mark.call_count == 2

    @pytest.mark.asyncio
    async def test_get_session_attendance(self, tuition_service, mock_db):
        """Test getting session attendance"""
        mock_attendance = [SessionAttendance(id=1), SessionAttendance(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_attendance
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_session_attendance(1)

        assert len(result) == 2


class TestAssignments:
    """Tests for assignment methods"""

    @pytest.mark.asyncio
    async def test_create_assignment_success(self, tuition_service, mock_db):
        """Test creating assignment successfully"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        assignment_data = AssignmentCreate(
            course_id=1,
            title="Test Assignment",
            description="Description",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            max_points=100
        )

        result = await tuition_service.create_assignment(assignment_data, teacher_id=1)

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_create_assignment_unauthorized(self, tuition_service, mock_db):
        """Test creating assignment with unauthorized teacher"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        assignment_data = AssignmentCreate(
            course_id=1,
            title="Test Assignment",
            description="Description",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            max_points=100
        )

        with pytest.raises(ValidationError, match="Teacher not authorized"):
            await tuition_service.create_assignment(assignment_data, teacher_id=2)

    @pytest.mark.asyncio
    async def test_submit_assignment_success(self, tuition_service, mock_db):
        """Test submitting assignment successfully"""
        mock_assignment = Assignment(
            id=1,
            course_id=1,
            is_published=True,
            allow_late_submission=True,
            due_date=datetime.now(timezone.utc) + timedelta(days=1)
        )
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1, status=EnrollmentStatus.ACTIVE)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                with patch.object(tuition_service, 'get_student_assignment_submission', return_value=None):
                    result = await tuition_service.submit_assignment(
                        assignment_id=1,
                        student_id=1,
                        submission_text="My submission"
                    )

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_submit_assignment_not_published(self, tuition_service, mock_db):
        """Test submitting unpublished assignment"""
        mock_assignment = Assignment(id=1, course_id=1, is_published=False)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with pytest.raises(ValidationError, match="Assignment is not published"):
                await tuition_service.submit_assignment(
                    assignment_id=1,
                    student_id=1,
                    submission_text="My submission"
                )

    @pytest.mark.asyncio
    async def test_submit_assignment_already_submitted(self, tuition_service, mock_db):
        """Test submitting assignment that was already submitted"""
        mock_assignment = Assignment(id=1, course_id=1, is_published=True)
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1, status=EnrollmentStatus.ACTIVE)
        mock_submission = AssignmentSubmission(id=1)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                with patch.object(tuition_service, 'get_student_assignment_submission', return_value=mock_submission):
                    with pytest.raises(ValidationError, match="Assignment already submitted"):
                        await tuition_service.submit_assignment(
                            assignment_id=1,
                            student_id=1,
                            submission_text="My submission"
                        )

    @pytest.mark.asyncio
    async def test_grade_submission_success(self, tuition_service, mock_db):
        """Test grading submission successfully"""
        mock_submission = AssignmentSubmission(id=1, assignment_id=1, student_id=1)

        with patch.object(tuition_service, 'get_submission_by_id', return_value=mock_submission):
            result = await tuition_service.grade_submission(
                submission_id=1,
                points=85.5,
                grade="B+",
                feedback="Good work"
            )

        assert mock_submission.points_earned == 85.5
        assert mock_submission.grade == "B+"
        assert mock_submission.feedback == "Good work"
        assert mock_submission.status == AssignmentStatus.GRADED
        assert mock_db.commit.called


class TestQuizzes:
    """Tests for quiz methods"""

    @pytest.mark.asyncio
    async def test_create_quiz_success(self, tuition_service, mock_db):
        """Test creating quiz successfully"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        quiz_data = QuizCreate(
            course_id=1,
            title="Test Quiz",
            description="Quiz description",
            duration_minutes=30,
            available_from=datetime.now(timezone.utc),
            available_until=datetime.now(timezone.utc) + timedelta(days=7),
            questions=[
                {
                    "question_text": "What is 2+2?",
                    "question_type": "multiple_choice",
                    "points": 5,
                    "options": [
                        {"text": "3", "is_correct": False},
                        {"text": "4", "is_correct": True}
                    ],
                    "correct_answer": "4"
                }
            ]
        )

        result = await tuition_service.create_quiz(quiz_data, teacher_id=1)

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_start_quiz_attempt_success(self, tuition_service, mock_db):
        """Test starting quiz attempt successfully"""
        mock_quiz = Quiz(
            id=1,
            course_id=1,
            is_published=True,
            max_attempts=3,
            available_from=datetime.now(timezone.utc) - timedelta(hours=1),
            available_until=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1, status=EnrollmentStatus.ACTIVE)

        with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                with patch.object(tuition_service, 'get_quiz_attempt_count', return_value=0):
                    result = await tuition_service.start_quiz_attempt(quiz_id=1, student_id=1)

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_start_quiz_attempt_max_attempts_reached(self, tuition_service, mock_db):
        """Test starting quiz attempt when max attempts reached"""
        mock_quiz = Quiz(
            id=1,
            course_id=1,
            is_published=True,
            max_attempts=3,
            available_from=datetime.now(timezone.utc) - timedelta(hours=1),
            available_until=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1, status=EnrollmentStatus.ACTIVE)

        with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                with patch.object(tuition_service, 'get_quiz_attempt_count', return_value=3):
                    with pytest.raises(ValidationError, match="Maximum attempts reached"):
                        await tuition_service.start_quiz_attempt(quiz_id=1, student_id=1)

    @pytest.mark.asyncio
    async def test_submit_quiz_attempt_success(self, tuition_service, mock_db):
        """Test submitting quiz attempt successfully"""
        mock_question = QuizQuestion(
            id=1,
            quiz_id=1,
            question_text="What is 2+2?",
            question_type="multiple_choice",
            points=5,
            options=[
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True}
            ]
        )
        mock_quiz = Quiz(
            id=1,
            duration_minutes=30,
            total_points=5,
            passing_score=3,
            questions=[mock_question]
        )
        mock_attempt = QuizAttempt(
            id=1,
            quiz_id=1,
            student_id=1,
            is_completed=False,
            started_at=datetime.now(timezone.utc) - timedelta(minutes=10)
        )

        answers = {"1": "4"}  # Correct answer

        with patch.object(tuition_service, 'get_quiz_attempt_by_id', return_value=mock_attempt):
            with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
                result = await tuition_service.submit_quiz_attempt(attempt_id=1, answers=answers)

        assert mock_attempt.is_completed
        assert mock_attempt.score == 5
        assert mock_attempt.passed
        assert mock_db.commit.called


class TestStudyMaterials:
    """Tests for study material methods"""

    @pytest.mark.asyncio
    async def test_create_study_material_success(self, tuition_service, mock_db):
        """Test creating study material successfully"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        material_data = StudyMaterialCreate(
            course_id=1,
            title="Study Material",
            description="Description",
            material_type="pdf",
            file_url="https://example.com/material.pdf"
        )

        result = await tuition_service.create_study_material(material_data, teacher_id=1)

        assert mock_db.add.called
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_list_study_materials_with_access_control(self, tuition_service, mock_db):
        """Test listing study materials with access control"""
        mock_materials = [StudyMaterial(id=1), StudyMaterial(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_materials

        # Mock enrolled courses query for student
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = [(1,), (2,)]
        mock_db.execute.side_effect = [mock_enrollment_result, mock_result]

        result = await tuition_service.list_study_materials(
            user_id=1,
            user_role="student"
        )

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_increment_material_view_count(self, tuition_service, mock_db):
        """Test incrementing material view count"""
        mock_material = StudyMaterial(id=1, view_count=5)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            result = await tuition_service.increment_material_view_count(1)

        assert result is True
        assert mock_material.view_count == 6
        assert mock_db.commit.called


class TestProgressReports:
    """Tests for progress report methods"""

    @pytest.mark.asyncio
    async def test_generate_progress_report(self, tuition_service, mock_db):
        """Test generating progress report"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        # Mock stats calculations
        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 8,
            "attendance_percentage": 80.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 4,
                "average_score": 85.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 3,
                    "average_score": 90.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called
        assert mock_db.commit.called


class TestAnalytics:
    """Tests for analytics methods"""

    @pytest.mark.asyncio
    async def test_get_course_analytics(self, tuition_service, mock_db):
        """Test getting course analytics"""
        # Mock session stats
        mock_session_result = MagicMock()
        mock_session_result.first.return_value = MagicMock(
            total_sessions=10,
            completed_sessions=8,
            avg_duration=60
        )

        # Mock enrollment stats
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.first.return_value = MagicMock(
            total_enrollments=20,
            active_enrollments=15,
            avg_completion=75
        )

        # Mock attendance stats
        mock_attendance_result = MagicMock()
        mock_attendance_result.first.return_value = MagicMock(
            total_attendance_records=100,
            present_count=85,
            avg_participation=4.5
        )

        mock_db.execute.side_effect = [
            mock_session_result,
            mock_enrollment_result,
            mock_attendance_result
        ]

        result = await tuition_service.get_course_analytics(course_id=1)

        assert "sessions" in result
        assert "enrollments" in result
        assert "attendance" in result

    @pytest.mark.asyncio
    async def test_get_student_analytics(self, tuition_service, mock_db):
        """Test getting student analytics"""
        mock_enrollments = [
            Enrollment(id=1, status=EnrollmentStatus.ACTIVE),
            Enrollment(id=2, status=EnrollmentStatus.ACTIVE)
        ]

        # Mock enrollment query
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.scalars.return_value.all.return_value = mock_enrollments

        # Mock attendance stats
        mock_attendance_result = MagicMock()
        mock_attendance_result.first.return_value = MagicMock(
            total_sessions=10,
            attended_sessions=8,
            avg_participation=4.5
        )

        # Mock assignment stats
        mock_assignment_result = MagicMock()
        mock_assignment_result.first.return_value = MagicMock(
            total_submissions=5,
            graded_submissions=4,
            avg_points=85.0
        )

        # Mock quiz stats
        mock_quiz_result = MagicMock()
        mock_quiz_result.first.return_value = MagicMock(
            total_attempts=3,
            passed_attempts=3,
            avg_percentage=90.0
        )

        mock_db.execute.side_effect = [
            mock_enrollment_result,
            mock_attendance_result,
            mock_assignment_result,
            mock_quiz_result
        ]

        result = await tuition_service.get_student_analytics(student_id=1)

        assert "enrollments" in result
        assert "attendance" in result
        assert "assignments" in result
        assert "quizzes" in result


class TestPermissionChecks:
    """Tests for permission check methods"""

    @pytest.mark.asyncio
    async def test_check_session_access_admin(self, tuition_service, mock_db):
        """Test admin has access to all sessions"""
        mock_session = TuitionSession(id=1, teacher_id=1)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            result = await tuition_service.check_session_access(
                session_id=1,
                user_id=999,
                user_role="admin"
            )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_session_access_teacher(self, tuition_service, mock_db):
        """Test teacher has access to own sessions"""
        mock_session = TuitionSession(id=1, teacher_id=1)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            result = await tuition_service.check_session_access(
                session_id=1,
                user_id=1,
                user_role="teacher"
            )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_session_access_student_enrolled(self, tuition_service, mock_db):
        """Test enrolled student has access to session"""
        mock_session = TuitionSession(id=1, course_id=1)
        mock_enrollment = Enrollment(id=1, status=EnrollmentStatus.ACTIVE)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                result = await tuition_service.check_session_access(
                    session_id=1,
                    user_id=1,
                    user_role="student"
                )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_assignment_access(self, tuition_service, mock_db):
        """Test assignment access check"""
        mock_assignment = Assignment(id=1, teacher_id=1, is_published=True)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=1,
                user_role="teacher"
            )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_material_access(self, tuition_service, mock_db):
        """Test material access check"""
        mock_material = StudyMaterial(id=1, is_public=True)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            result = await tuition_service.check_material_access(
                material_id=1,
                user_id=1,
                user_role="student"
            )

        assert result is True


class TestHelperMethods:
    """Tests for helper methods"""

    @pytest.mark.asyncio
    async def test_check_session_conflicts_no_conflict(self, tuition_service, mock_db):
        """Test checking session conflicts with no conflicts"""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await tuition_service._check_session_conflicts(
            teacher_id=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_get_student_enrollment_by_course(self, tuition_service, mock_db):
        """Test getting student enrollment by course"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1, status=EnrollmentStatus.ACTIVE)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_enrollment
        mock_db.execute.return_value = mock_result

        result = await tuition_service._get_student_enrollment_by_course(student_id=1, course_id=1)

        assert result == mock_enrollment

    @pytest.mark.asyncio
    async def test_calculate_attendance_stats(self, tuition_service, mock_db):
        """Test calculating attendance stats"""
        mock_result = MagicMock()
        mock_result.first.return_value = MagicMock(
            total_sessions=10,
            attended_sessions=8
        )
        mock_db.execute.return_value = mock_result

        result = await tuition_service._calculate_attendance_stats(
            student_id=1,
            course_id=1,
            start_date=datetime.now(timezone.utc) - timedelta(days=30),
            end_date=datetime.now(timezone.utc)
        )

        assert result["total_sessions"] == 10
        assert result["attended_sessions"] == 8
        assert result["attendance_percentage"] == 80.0

    @pytest.mark.asyncio
    async def test_calculate_assignment_stats(self, tuition_service, mock_db):
        """Test calculating assignment stats"""
        mock_result = MagicMock()
        mock_result.first.return_value = MagicMock(
            total_submissions=5,
            graded_submissions=4,
            avg_points=85.0
        )
        mock_db.execute.return_value = mock_result

        result = await tuition_service._calculate_assignment_stats(
            student_id=1,
            course_id=1,
            start_date=datetime.now(timezone.utc) - timedelta(days=30),
            end_date=datetime.now(timezone.utc)
        )

        assert result["total"] == 5
        assert result["completed"] == 4
        assert result["average_score"] == 85.0

    @pytest.mark.asyncio
    async def test_calculate_quiz_stats(self, tuition_service, mock_db):
        """Test calculating quiz stats"""
        mock_result = MagicMock()
        mock_result.first.return_value = MagicMock(
            total_attempts=3,
            passed_attempts=3,
            avg_percentage=90.0
        )
        mock_db.execute.return_value = mock_result

        result = await tuition_service._calculate_quiz_stats(
            student_id=1,
            course_id=1,
            start_date=datetime.now(timezone.utc) - timedelta(days=30),
            end_date=datetime.now(timezone.utc)
        )

        assert result["taken"] == 3
        assert result["passed"] == 3
        assert result["average_score"] == 90.0


class TestSessionUpdateWithConflicts:
    """Tests for session update with scheduling conflicts"""

    @pytest.mark.asyncio
    async def test_update_session_with_date_time_change_conflict(self, tuition_service, mock_db):
        """Test updating session date/time with scheduling conflict"""
        mock_session = TuitionSession(
            id=1,
            title="Old Title",
            teacher_id=1,
            scheduled_date=date.today(),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with patch.object(tuition_service, '_check_session_conflicts', return_value=True):
                session_data = TuitionSessionUpdate(start_time=time(11, 0))

                with pytest.raises(ValidationError, match="Session conflicts with existing schedule"):
                    await tuition_service.update_session(1, session_data)

    @pytest.mark.asyncio
    async def test_update_session_with_date_time_change_no_conflict(self, tuition_service, mock_db):
        """Test updating session date/time without conflict"""
        mock_session = TuitionSession(
            id=1,
            title="Old Title",
            teacher_id=1,
            scheduled_date=date.today(),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with patch.object(tuition_service, '_check_session_conflicts', return_value=False):
                session_data = TuitionSessionUpdate(scheduled_date=date.today() + timedelta(days=1))
                result = await tuition_service.update_session(1, session_data)

        assert mock_db.commit.called


class TestSessionListingEdgeCases:
    """Tests for session listing with various filters"""

    @pytest.mark.asyncio
    async def test_list_sessions_with_start_date_filter(self, tuition_service, mock_db):
        """Test listing sessions with start date filter"""
        mock_sessions = [TuitionSession(id=1)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_sessions
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_sessions(start_date=date.today())

        assert len(result) == 1
        assert mock_db.execute.called

    @pytest.mark.asyncio
    async def test_list_sessions_with_end_date_filter(self, tuition_service, mock_db):
        """Test listing sessions with end date filter"""
        mock_sessions = [TuitionSession(id=1)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_sessions
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_sessions(end_date=date.today())

        assert len(result) == 1


class TestStudentSessions:
    """Tests for student session methods"""

    @pytest.mark.asyncio
    async def test_get_student_sessions_no_enrollments(self, tuition_service, mock_db):
        """Test getting student sessions when student has no enrollments"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = []
        mock_db.execute.return_value = mock_enrollment_result

        result = await tuition_service.get_student_sessions(student_id=1)

        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_student_sessions_with_filters(self, tuition_service, mock_db):
        """Test getting student sessions with filters"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = [(1,), (2,)]

        mock_sessions = [TuitionSession(id=1), TuitionSession(id=2)]
        mock_session_result = MagicMock()
        mock_session_result.scalars.return_value.all.return_value = mock_sessions

        mock_db.execute.side_effect = [mock_enrollment_result, mock_session_result]

        result = await tuition_service.get_student_sessions(
            student_id=1,
            course_id=1,
            status=SessionStatus.SCHEDULED,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_student_upcoming_sessions(self, tuition_service, mock_db):
        """Test getting upcoming sessions for student"""
        with patch.object(tuition_service, 'get_student_sessions', return_value=[TuitionSession(id=1)]) as mock_get:
            result = await tuition_service.get_student_upcoming_sessions(student_id=1, limit=5)

            mock_get.assert_called_once()
            assert len(result) == 1


class TestTeacherSessions:
    """Tests for teacher session methods"""

    @pytest.mark.asyncio
    async def test_get_teacher_sessions(self, tuition_service, mock_db):
        """Test getting teacher sessions"""
        with patch.object(tuition_service, 'list_sessions', return_value=[TuitionSession(id=1)]) as mock_list:
            result = await tuition_service.get_teacher_sessions(
                teacher_id=1,
                course_id=1,
                status=SessionStatus.SCHEDULED
            )

            mock_list.assert_called_once()
            assert len(result) == 1

    @pytest.mark.asyncio
    async def test_get_teacher_upcoming_sessions(self, tuition_service, mock_db):
        """Test getting upcoming sessions for teacher"""
        with patch.object(tuition_service, 'get_teacher_sessions', return_value=[TuitionSession(id=1)]) as mock_get:
            result = await tuition_service.get_teacher_upcoming_sessions(teacher_id=1, limit=5)

            mock_get.assert_called_once()
            assert len(result) == 1


class TestUpcomingSessions:
    """Tests for upcoming sessions"""

    @pytest.mark.asyncio
    async def test_get_upcoming_sessions(self, tuition_service, mock_db):
        """Test getting upcoming sessions"""
        mock_sessions = [TuitionSession(id=1), TuitionSession(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_sessions
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_upcoming_sessions(limit=10)

        assert len(result) == 2
        assert mock_db.execute.called


class TestStartEndSessionErrors:
    """Tests for start/end session error cases"""

    @pytest.mark.asyncio
    async def test_start_session_not_found(self, tuition_service, mock_db):
        """Test starting non-existent session"""
        with patch.object(tuition_service, 'get_session_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Session not found"):
                await tuition_service.start_session(1, teacher_id=1)

    @pytest.mark.asyncio
    async def test_end_session_not_found(self, tuition_service, mock_db):
        """Test ending non-existent session"""
        with patch.object(tuition_service, 'get_session_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Session not found"):
                await tuition_service.end_session(1, teacher_id=1)

    @pytest.mark.asyncio
    async def test_end_session_unauthorized(self, tuition_service, mock_db):
        """Test ending session with unauthorized teacher"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.IN_PROGRESS
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with pytest.raises(ValidationError, match="Not authorized"):
                await tuition_service.end_session(1, teacher_id=2)

    @pytest.mark.asyncio
    async def test_end_session_invalid_status(self, tuition_service, mock_db):
        """Test ending session with invalid status"""
        mock_session = TuitionSession(
            id=1,
            teacher_id=1,
            status=SessionStatus.SCHEDULED
        )

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with pytest.raises(ValidationError, match="Session is not in progress"):
                await tuition_service.end_session(1, teacher_id=1)


class TestAttendanceEdgeCases:
    """Tests for attendance edge cases"""

    @pytest.mark.asyncio
    async def test_get_student_attendance_with_filters(self, tuition_service, mock_db):
        """Test getting student attendance with various filters"""
        mock_attendance = [SessionAttendance(id=1), SessionAttendance(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_attendance
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_student_attendance(
            student_id=1,
            course_id=1,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today()
        )

        assert len(result) == 2


class TestAssignmentEdgeCases:
    """Tests for assignment edge cases"""

    @pytest.mark.asyncio
    async def test_create_assignment_course_not_found(self, tuition_service, mock_db):
        """Test creating assignment with non-existent course"""
        mock_db.get.return_value = None

        assignment_data = AssignmentCreate(
            course_id=999,
            title="Test Assignment",
            description="Description",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            max_points=100
        )

        with pytest.raises(NotFoundError, match="Course not found"):
            await tuition_service.create_assignment(assignment_data, teacher_id=1)

    @pytest.mark.asyncio
    async def test_get_assignment_by_id(self, tuition_service, mock_db):
        """Test getting assignment by ID"""
        mock_assignment = Assignment(id=1, title="Test Assignment")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_assignment
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_assignment_by_id(1)

        assert result == mock_assignment

    @pytest.mark.asyncio
    async def test_list_assignments_with_filters(self, tuition_service, mock_db):
        """Test listing assignments with filters"""
        mock_assignments = [Assignment(id=1), Assignment(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_assignments
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_assignments(
            course_id=1,
            teacher_id=1,
            published_only=False
        )

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_student_assignments_no_enrollments(self, tuition_service, mock_db):
        """Test getting student assignments when not enrolled"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = []
        mock_db.execute.return_value = mock_enrollment_result

        result = await tuition_service.get_student_assignments(student_id=1)

        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_student_assignments_with_course_filter(self, tuition_service, mock_db):
        """Test getting student assignments with course filter"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = [(1,)]

        mock_assignments = [Assignment(id=1)]
        mock_assignment_result = MagicMock()
        mock_assignment_result.scalars.return_value.all.return_value = mock_assignments

        mock_db.execute.side_effect = [mock_enrollment_result, mock_assignment_result]

        result = await tuition_service.get_student_assignments(student_id=1, course_id=1)

        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_get_teacher_assignments(self, tuition_service, mock_db):
        """Test getting teacher assignments"""
        with patch.object(tuition_service, 'list_assignments', return_value=[Assignment(id=1)]) as mock_list:
            result = await tuition_service.get_teacher_assignments(teacher_id=1)

            mock_list.assert_called_once()
            assert len(result) == 1

    @pytest.mark.asyncio
    async def test_submit_assignment_not_found(self, tuition_service, mock_db):
        """Test submitting non-existent assignment"""
        with patch.object(tuition_service, 'get_assignment_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Assignment not found"):
                await tuition_service.submit_assignment(
                    assignment_id=999,
                    student_id=1,
                    submission_text="Test"
                )

    @pytest.mark.asyncio
    async def test_submit_assignment_student_not_enrolled(self, tuition_service, mock_db):
        """Test submitting assignment when student not enrolled"""
        mock_assignment = Assignment(id=1, course_id=1, is_published=True)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=None):
                with pytest.raises(ValidationError, match="Student not enrolled"):
                    await tuition_service.submit_assignment(
                        assignment_id=1,
                        student_id=1,
                        submission_text="Test"
                    )

    @pytest.mark.asyncio
    async def test_submit_assignment_late_not_allowed(self, tuition_service, mock_db):
        """Test submitting late assignment when not allowed"""
        mock_assignment = Assignment(
            id=1,
            course_id=1,
            is_published=True,
            allow_late_submission=False,
            due_date=datetime.now(timezone.utc) - timedelta(days=1)
        )
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                with patch.object(tuition_service, 'get_student_assignment_submission', return_value=None):
                    with pytest.raises(ValidationError, match="Assignment deadline has passed"):
                        await tuition_service.submit_assignment(
                            assignment_id=1,
                            student_id=1,
                            submission_text="Test"
                        )

    @pytest.mark.asyncio
    async def test_get_assignment_submissions(self, tuition_service, mock_db):
        """Test getting assignment submissions"""
        mock_submissions = [AssignmentSubmission(id=1), AssignmentSubmission(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_submissions
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_assignment_submissions(assignment_id=1, skip=0, limit=10)

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_student_assignment_submission(self, tuition_service, mock_db):
        """Test getting specific student assignment submission"""
        mock_submission = AssignmentSubmission(id=1)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_submission
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_student_assignment_submission(assignment_id=1, student_id=1)

        assert result == mock_submission

    @pytest.mark.asyncio
    async def test_get_submission_by_id(self, tuition_service, mock_db):
        """Test getting submission by ID"""
        mock_submission = AssignmentSubmission(id=1)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_submission
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_submission_by_id(1)

        assert result == mock_submission

    @pytest.mark.asyncio
    async def test_grade_submission_not_found(self, tuition_service, mock_db):
        """Test grading non-existent submission"""
        with patch.object(tuition_service, 'get_submission_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Submission not found"):
                await tuition_service.grade_submission(
                    submission_id=999,
                    points=85,
                    grade="B+"
                )


class TestStudyMaterialEdgeCases:
    """Tests for study material edge cases"""

    @pytest.mark.asyncio
    async def test_create_study_material_course_not_found(self, tuition_service, mock_db):
        """Test creating study material with non-existent course"""
        mock_db.get.return_value = None

        material_data = StudyMaterialCreate(
            course_id=999,
            title="Material",
            description="Description",
            material_type="pdf",
            file_url="https://example.com/file.pdf"
        )

        with pytest.raises(NotFoundError, match="Course not found"):
            await tuition_service.create_study_material(material_data, teacher_id=1)

    @pytest.mark.asyncio
    async def test_create_study_material_unauthorized(self, tuition_service, mock_db):
        """Test creating study material with unauthorized teacher"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        material_data = StudyMaterialCreate(
            course_id=1,
            title="Material",
            description="Description",
            material_type="pdf",
            file_url="https://example.com/file.pdf"
        )

        with pytest.raises(ValidationError, match="Teacher not authorized"):
            await tuition_service.create_study_material(material_data, teacher_id=2)

    @pytest.mark.asyncio
    async def test_get_study_material_by_id(self, tuition_service, mock_db):
        """Test getting study material by ID"""
        mock_material = StudyMaterial(id=1, title="Material")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_material
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_study_material_by_id(1)

        assert result == mock_material

    @pytest.mark.asyncio
    async def test_list_study_materials_teacher_access(self, tuition_service, mock_db):
        """Test listing study materials with teacher access control"""
        mock_materials = [StudyMaterial(id=1)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_materials
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_study_materials(
            user_id=1,
            user_role="teacher"
        )

        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_list_study_materials_with_all_filters(self, tuition_service, mock_db):
        """Test listing study materials with all filters"""
        mock_materials = [StudyMaterial(id=1)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_materials
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_study_materials(
            course_id=1,
            session_id=1,
            category="notes",
            material_type="pdf"
        )

        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_increment_material_view_count_not_found(self, tuition_service, mock_db):
        """Test incrementing view count for non-existent material"""
        with patch.object(tuition_service, 'get_study_material_by_id', return_value=None):
            result = await tuition_service.increment_material_view_count(999)

        assert result is False


class TestQuizEdgeCases:
    """Tests for quiz edge cases"""

    @pytest.mark.asyncio
    async def test_create_quiz_course_not_found(self, tuition_service, mock_db):
        """Test creating quiz with non-existent course"""
        mock_db.get.return_value = None

        quiz_data = QuizCreate(
            course_id=999,
            title="Quiz",
            description="Description",
            duration_minutes=30,
            available_from=datetime.now(timezone.utc),
            available_until=datetime.now(timezone.utc) + timedelta(days=7),
            questions=[]
        )

        with pytest.raises(NotFoundError, match="Course not found"):
            await tuition_service.create_quiz(quiz_data, teacher_id=1)

    @pytest.mark.asyncio
    async def test_create_quiz_unauthorized(self, tuition_service, mock_db):
        """Test creating quiz with unauthorized teacher"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        quiz_data = QuizCreate(
            course_id=1,
            title="Quiz",
            description="Description",
            duration_minutes=30,
            available_from=datetime.now(timezone.utc),
            available_until=datetime.now(timezone.utc) + timedelta(days=7),
            questions=[]
        )

        with pytest.raises(ValidationError, match="Teacher not authorized"):
            await tuition_service.create_quiz(quiz_data, teacher_id=2)

    @pytest.mark.asyncio
    async def test_get_quiz_by_id(self, tuition_service, mock_db):
        """Test getting quiz by ID"""
        mock_quiz = Quiz(id=1, title="Quiz")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_quiz
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_quiz_by_id(1)

        assert result == mock_quiz

    @pytest.mark.asyncio
    async def test_list_quizzes_with_filters(self, tuition_service, mock_db):
        """Test listing quizzes with filters"""
        mock_quizzes = [Quiz(id=1), Quiz(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_quizzes
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_quizzes(
            course_id=1,
            published_only=True,
            skip=0,
            limit=10
        )

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_student_available_quizzes_no_enrollments(self, tuition_service, mock_db):
        """Test getting available quizzes when student not enrolled"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = []
        mock_db.execute.return_value = mock_enrollment_result

        result = await tuition_service.get_student_available_quizzes(student_id=1)

        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_student_available_quizzes_with_course_filter(self, tuition_service, mock_db):
        """Test getting available quizzes with course filter"""
        mock_enrollment_result = MagicMock()
        mock_enrollment_result.fetchall.return_value = [(1,)]

        mock_quizzes = [Quiz(id=1)]
        mock_quiz_result = MagicMock()
        mock_quiz_result.scalars.return_value.all.return_value = mock_quizzes

        mock_db.execute.side_effect = [mock_enrollment_result, mock_quiz_result]

        result = await tuition_service.get_student_available_quizzes(student_id=1, course_id=1)

        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_get_teacher_quizzes(self, tuition_service, mock_db):
        """Test getting teacher quizzes"""
        mock_quizzes = [Quiz(id=1), Quiz(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_quizzes
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_teacher_quizzes(
            teacher_id=1,
            course_id=1,
            published_only=True
        )

        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_start_quiz_attempt_not_found(self, tuition_service, mock_db):
        """Test starting quiz attempt for non-existent quiz"""
        with patch.object(tuition_service, 'get_quiz_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Quiz not found"):
                await tuition_service.start_quiz_attempt(quiz_id=999, student_id=1)

    @pytest.mark.asyncio
    async def test_start_quiz_attempt_not_available(self, tuition_service, mock_db):
        """Test starting quiz attempt when quiz not available"""
        mock_quiz = Quiz(
            id=1,
            course_id=1,
            is_published=False,
            max_attempts=3,
            available_from=datetime.now(timezone.utc) - timedelta(hours=1),
            available_until=datetime.now(timezone.utc) + timedelta(hours=1)
        )

        with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
            with pytest.raises(ValidationError, match="Quiz is not available"):
                await tuition_service.start_quiz_attempt(quiz_id=1, student_id=1)

    @pytest.mark.asyncio
    async def test_start_quiz_attempt_student_not_enrolled(self, tuition_service, mock_db):
        """Test starting quiz attempt when student not enrolled"""
        mock_quiz = Quiz(
            id=1,
            course_id=1,
            is_published=True,
            max_attempts=3,
            available_from=datetime.now(timezone.utc) - timedelta(hours=1),
            available_until=datetime.now(timezone.utc) + timedelta(hours=1)
        )

        with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=None):
                with pytest.raises(ValidationError, match="Student not enrolled"):
                    await tuition_service.start_quiz_attempt(quiz_id=1, student_id=1)

    @pytest.mark.asyncio
    async def test_submit_quiz_attempt_not_found(self, tuition_service, mock_db):
        """Test submitting non-existent quiz attempt"""
        with patch.object(tuition_service, 'get_quiz_attempt_by_id', return_value=None):
            with pytest.raises(NotFoundError, match="Quiz attempt not found"):
                await tuition_service.submit_quiz_attempt(attempt_id=999, answers={})

    @pytest.mark.asyncio
    async def test_submit_quiz_attempt_already_submitted(self, tuition_service, mock_db):
        """Test submitting already completed quiz attempt"""
        mock_attempt = QuizAttempt(id=1, is_completed=True)

        with patch.object(tuition_service, 'get_quiz_attempt_by_id', return_value=mock_attempt):
            with pytest.raises(ValidationError, match="Quiz attempt already submitted"):
                await tuition_service.submit_quiz_attempt(attempt_id=1, answers={})

    @pytest.mark.asyncio
    async def test_submit_quiz_attempt_time_limit_exceeded(self, tuition_service, mock_db):
        """Test submitting quiz attempt with time limit exceeded"""
        mock_quiz = Quiz(id=1, duration_minutes=30, total_points=10, questions=[])
        mock_attempt = QuizAttempt(
            id=1,
            quiz_id=1,
            is_completed=False,
            started_at=datetime.now(timezone.utc) - timedelta(minutes=60)
        )

        with patch.object(tuition_service, 'get_quiz_attempt_by_id', return_value=mock_attempt):
            with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
                with pytest.raises(ValidationError, match="Time limit exceeded"):
                    await tuition_service.submit_quiz_attempt(attempt_id=1, answers={})

    @pytest.mark.asyncio
    async def test_submit_quiz_attempt_true_false_question(self, tuition_service, mock_db):
        """Test submitting quiz with true/false question"""
        mock_question = QuizQuestion(
            id=1,
            quiz_id=1,
            question_text="Is this true?",
            question_type="true_false",
            points=5,
            correct_answer="True"
        )
        mock_quiz = Quiz(
            id=1,
            duration_minutes=0,
            total_points=5,
            passing_score=3,
            questions=[mock_question]
        )
        mock_attempt = QuizAttempt(
            id=1,
            quiz_id=1,
            is_completed=False,
            started_at=datetime.now(timezone.utc)
        )

        answers = {"1": "true"}

        with patch.object(tuition_service, 'get_quiz_attempt_by_id', return_value=mock_attempt):
            with patch.object(tuition_service, 'get_quiz_by_id', return_value=mock_quiz):
                result = await tuition_service.submit_quiz_attempt(attempt_id=1, answers=answers)

        assert mock_attempt.is_completed
        assert mock_db.commit.called

    @pytest.mark.asyncio
    async def test_get_quiz_attempt_by_id(self, tuition_service, mock_db):
        """Test getting quiz attempt by ID"""
        mock_attempt = QuizAttempt(id=1)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_attempt
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_quiz_attempt_by_id(1)

        assert result == mock_attempt

    @pytest.mark.asyncio
    async def test_get_quiz_attempt_count(self, tuition_service, mock_db):
        """Test getting quiz attempt count"""
        mock_result = MagicMock()
        mock_result.scalar.return_value = 2
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_quiz_attempt_count(quiz_id=1, student_id=1)

        assert result == 2


class TestProgressReportsEdgeCases:
    """Tests for progress report edge cases"""

    @pytest.mark.asyncio
    async def test_generate_progress_report_not_found(self, tuition_service, mock_db):
        """Test generating progress report for non-existent enrollment"""
        mock_db.get.return_value = None

        with pytest.raises(NotFoundError, match="Enrollment not found"):
            await tuition_service.generate_progress_report(
                enrollment_id=999,
                report_period="monthly",
                start_date=datetime.now(timezone.utc) - timedelta(days=30),
                end_date=datetime.now(timezone.utc),
                teacher_id=1
            )

    @pytest.mark.asyncio
    async def test_generate_progress_report_grade_B(self, tuition_service, mock_db):
        """Test generating progress report with B grade"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 8,
            "attendance_percentage": 80.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 4,
                "average_score": 85.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 3,
                    "average_score": 85.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called

    @pytest.mark.asyncio
    async def test_generate_progress_report_grade_C(self, tuition_service, mock_db):
        """Test generating progress report with C grade"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 7,
            "attendance_percentage": 70.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 3,
                "average_score": 75.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 2,
                    "average_score": 75.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called

    @pytest.mark.asyncio
    async def test_generate_progress_report_grade_D(self, tuition_service, mock_db):
        """Test generating progress report with D grade"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 6,
            "attendance_percentage": 60.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 3,
                "average_score": 65.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 2,
                    "average_score": 65.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called

    @pytest.mark.asyncio
    async def test_generate_progress_report_grade_F(self, tuition_service, mock_db):
        """Test generating progress report with F grade"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 5,
            "attendance_percentage": 50.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 2,
                "average_score": 50.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 1,
                    "average_score": 50.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called

    @pytest.mark.asyncio
    async def test_get_progress_reports_with_filters(self, tuition_service, mock_db):
        """Test getting progress reports with filters"""
        mock_reports = [ProgressReport(id=1), ProgressReport(id=2)]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_reports
        mock_db.execute.return_value = mock_result

        result = await tuition_service.get_progress_reports(
            student_id=1,
            course_id=1,
            report_period="monthly"
        )

        assert len(result) == 2


class TestAnalyticsEdgeCases:
    """Tests for analytics edge cases"""

    @pytest.mark.asyncio
    async def test_get_course_analytics_with_date_filters(self, tuition_service, mock_db):
        """Test getting course analytics with date filters"""
        mock_session_result = MagicMock()
        mock_session_result.first.return_value = MagicMock(
            total_sessions=10,
            completed_sessions=8,
            avg_duration=60
        )

        mock_enrollment_result = MagicMock()
        mock_enrollment_result.first.return_value = MagicMock(
            total_enrollments=20,
            active_enrollments=15,
            avg_completion=75
        )

        mock_attendance_result = MagicMock()
        mock_attendance_result.first.return_value = MagicMock(
            total_attendance_records=100,
            present_count=85,
            avg_participation=4.5
        )

        mock_db.execute.side_effect = [
            mock_session_result,
            mock_enrollment_result,
            mock_attendance_result
        ]

        result = await tuition_service.get_course_analytics(
            course_id=1,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today()
        )

        assert "sessions" in result
        assert "enrollments" in result
        assert "attendance" in result

    @pytest.mark.asyncio
    async def test_get_student_analytics_with_course_filter(self, tuition_service, mock_db):
        """Test getting student analytics with course filter"""
        mock_enrollments = [Enrollment(id=1, status=EnrollmentStatus.ACTIVE)]

        mock_enrollment_result = MagicMock()
        mock_enrollment_result.scalars.return_value.all.return_value = mock_enrollments

        mock_attendance_result = MagicMock()
        mock_attendance_result.first.return_value = MagicMock(
            total_sessions=10,
            attended_sessions=8,
            avg_participation=4.5
        )

        mock_assignment_result = MagicMock()
        mock_assignment_result.first.return_value = MagicMock(
            total_submissions=5,
            graded_submissions=4,
            avg_points=85.0
        )

        mock_quiz_result = MagicMock()
        mock_quiz_result.first.return_value = MagicMock(
            total_attempts=3,
            passed_attempts=3,
            avg_percentage=90.0
        )

        mock_db.execute.side_effect = [
            mock_enrollment_result,
            mock_attendance_result,
            mock_assignment_result,
            mock_quiz_result
        ]

        result = await tuition_service.get_student_analytics(student_id=1, course_id=1)

        assert "enrollments" in result
        assert "attendance" in result


class TestPermissionChecksEdgeCases:
    """Tests for permission checks edge cases"""

    @pytest.mark.asyncio
    async def test_check_session_access_session_not_found(self, tuition_service, mock_db):
        """Test checking access to non-existent session"""
        with patch.object(tuition_service, 'get_session_by_id', return_value=None):
            result = await tuition_service.check_session_access(
                session_id=999,
                user_id=1,
                user_role="student"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_session_access_student_not_enrolled(self, tuition_service, mock_db):
        """Test student access when not enrolled"""
        mock_session = TuitionSession(id=1, course_id=1)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=None):
                result = await tuition_service.check_session_access(
                    session_id=1,
                    user_id=1,
                    user_role="student"
                )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_session_access_unknown_role(self, tuition_service, mock_db):
        """Test checking session access with unknown role"""
        mock_session = TuitionSession(id=1, teacher_id=1)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            result = await tuition_service.check_session_access(
                session_id=1,
                user_id=1,
                user_role="unknown"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_assignment_access_not_found(self, tuition_service, mock_db):
        """Test checking access to non-existent assignment"""
        with patch.object(tuition_service, 'get_assignment_by_id', return_value=None):
            result = await tuition_service.check_assignment_access(
                assignment_id=999,
                user_id=1,
                user_role="student"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_assignment_access_student_unpublished(self, tuition_service, mock_db):
        """Test student access to unpublished assignment"""
        mock_assignment = Assignment(id=1, teacher_id=1, is_published=False, course_id=1)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=1,
                user_role="student"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_assignment_access_student_not_enrolled(self, tuition_service, mock_db):
        """Test student access to assignment when not enrolled"""
        mock_assignment = Assignment(id=1, teacher_id=1, is_published=True, course_id=1)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=None):
                result = await tuition_service.check_assignment_access(
                    assignment_id=1,
                    user_id=1,
                    user_role="student"
                )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_assignment_access_unknown_role(self, tuition_service, mock_db):
        """Test checking assignment access with unknown role"""
        mock_assignment = Assignment(id=1, teacher_id=1)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=1,
                user_role="unknown"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_material_access_not_found(self, tuition_service, mock_db):
        """Test checking access to non-existent material"""
        with patch.object(tuition_service, 'get_study_material_by_id', return_value=None):
            result = await tuition_service.check_material_access(
                material_id=999,
                user_id=1,
                user_role="student"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_material_access_teacher_private(self, tuition_service, mock_db):
        """Test teacher access to private material"""
        mock_material = StudyMaterial(id=1, teacher_id=1, is_public=False)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            result = await tuition_service.check_material_access(
                material_id=1,
                user_id=1,
                user_role="teacher"
            )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_material_access_student_requires_enrollment(self, tuition_service, mock_db):
        """Test student access to material requiring enrollment"""
        mock_material = StudyMaterial(
            id=1,
            course_id=1,
            is_public=False,
            requires_enrollment=True
        )
        mock_enrollment = Enrollment(id=1, status=EnrollmentStatus.ACTIVE)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                result = await tuition_service.check_material_access(
                    material_id=1,
                    user_id=1,
                    user_role="student"
                )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_material_access_student_not_enrolled(self, tuition_service, mock_db):
        """Test student access when not enrolled"""
        mock_material = StudyMaterial(
            id=1,
            course_id=1,
            is_public=False,
            requires_enrollment=True
        )

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=None):
                result = await tuition_service.check_material_access(
                    material_id=1,
                    user_id=1,
                    user_role="student"
                )

        assert result is False

    @pytest.mark.asyncio
    async def test_check_material_access_unknown_role(self, tuition_service, mock_db):
        """Test checking material access with unknown role"""
        mock_material = StudyMaterial(id=1, is_public=False)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            result = await tuition_service.check_material_access(
                material_id=1,
                user_id=1,
                user_role="unknown"
            )

        assert result is False

    @pytest.mark.asyncio
    async def test_can_teacher_create_session(self, tuition_service, mock_db):
        """Test if teacher can create session"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        result = await tuition_service.can_teacher_create_session(teacher_id=1, course_id=1)

        assert result is True

    @pytest.mark.asyncio
    async def test_can_teacher_create_assignment(self, tuition_service, mock_db):
        """Test if teacher can create assignment"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        result = await tuition_service.can_teacher_create_assignment(teacher_id=1, course_id=1)

        assert result is True

    @pytest.mark.asyncio
    async def test_can_teacher_view_course(self, tuition_service, mock_db):
        """Test if teacher can view course"""
        course = Course(id=1, teacher_id=1)
        mock_db.get.return_value = course

        result = await tuition_service.can_teacher_view_course(teacher_id=1, course_id=1)

        assert result is True


class TestHelperMethodsEdgeCases:
    """Tests for helper methods edge cases"""

    @pytest.mark.asyncio
    async def test_check_session_conflicts_with_conflict(self, tuition_service, mock_db):
        """Test checking session conflicts when conflict exists"""
        mock_session = TuitionSession(id=1)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_session
        mock_db.execute.return_value = mock_result

        result = await tuition_service._check_session_conflicts(
            teacher_id=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_check_session_conflicts_exclude_session(self, tuition_service, mock_db):
        """Test checking conflicts with exclude_session_id"""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await tuition_service._check_session_conflicts(
            teacher_id=1,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0),
            exclude_session_id=1
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_get_student_enrollment_session_not_found(self, tuition_service, mock_db):
        """Test getting student enrollment for non-existent session"""
        with patch.object(tuition_service, 'get_session_by_id', return_value=None):
            result = await tuition_service._get_student_enrollment(student_id=1, session_id=999)

        assert result is None

    @pytest.mark.asyncio
    async def test_get_student_enrollment_success(self, tuition_service, mock_db):
        """Test getting student enrollment successfully"""
        mock_session = TuitionSession(id=1, course_id=1)
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)

        with patch.object(tuition_service, 'get_session_by_id', return_value=mock_session):
            with patch.object(tuition_service, '_get_student_enrollment_by_course', return_value=mock_enrollment):
                result = await tuition_service._get_student_enrollment(student_id=1, session_id=1)

        assert result == mock_enrollment


class TestTuitionServiceEdgeCases:
    """Tests for edge cases to achieve 100% coverage"""

    @pytest.mark.asyncio
    async def test_list_assignments_with_published_only_filter(self, tuition_service, mock_db):
        """Test listing assignments with published_only=True filter"""
        mock_assignments = [
            Assignment(id=1, title="Published Assignment", is_published=True),
            Assignment(id=2, title="Another Published", is_published=True)
        ]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_assignments
        mock_db.execute.return_value = mock_result

        result = await tuition_service.list_assignments(
            published_only=True
        )

        assert len(result) == 2
        # Verify the query includes the is_published filter
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_check_assignment_access_as_teacher(self, tuition_service, mock_db):
        """Test assignment access check for teacher role"""
        mock_assignment = Assignment(id=1, teacher_id=5, is_published=True)
        
        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            # Teacher accessing their own assignment
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=5,
                user_role="teacher"
            )
            assert result is True

            # Teacher accessing someone else's assignment
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=999,
                user_role="teacher"
            )
            assert result is False

    @pytest.mark.asyncio
    async def test_check_material_access_as_teacher(self, tuition_service, mock_db):
        """Test material access check for teacher role"""
        # Teacher's own material
        mock_material = StudyMaterial(id=1, teacher_id=5, is_public=False)
        
        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            result = await tuition_service.check_material_access(
                material_id=1,
                user_id=5,
                user_role="teacher"
            )
            assert result is True

        # Teacher accessing public material from another teacher
        mock_public_material = StudyMaterial(id=2, teacher_id=10, is_public=True)
        
        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_public_material):
            result = await tuition_service.check_material_access(
                material_id=2,
                user_id=5,
                user_role="teacher"
            )
            assert result is True

    @pytest.mark.asyncio
    async def test_generate_progress_report_grade_A(self, tuition_service, mock_db):
        """Test generating progress report with A grade (>= 90%)"""
        mock_enrollment = Enrollment(id=1, student_id=1, course_id=1)
        mock_db.get.return_value = mock_enrollment

        with patch.object(tuition_service, '_calculate_attendance_stats', return_value={
            "total_sessions": 10,
            "attended_sessions": 9,
            "attendance_percentage": 90.0
        }):
            with patch.object(tuition_service, '_calculate_assignment_stats', return_value={
                "total": 5,
                "completed": 5,
                "average_score": 95.0
            }):
                with patch.object(tuition_service, '_calculate_quiz_stats', return_value={
                    "taken": 3,
                    "passed": 3,
                    "average_score": 92.0
                }):
                    result = await tuition_service.generate_progress_report(
                        enrollment_id=1,
                        report_period="monthly",
                        start_date=datetime.now(timezone.utc) - timedelta(days=30),
                        end_date=datetime.now(timezone.utc),
                        teacher_id=1
                    )

        assert mock_db.add.called
        # This test covers line 1008: report.overall_grade = "A"

    @pytest.mark.asyncio
    async def test_check_assignment_access_as_admin(self, tuition_service, mock_db):
        """Test assignment access check for admin role"""
        mock_assignment = Assignment(id=1, teacher_id=5, is_published=True)

        with patch.object(tuition_service, 'get_assignment_by_id', return_value=mock_assignment):
            # Admin should have access to any assignment
            result = await tuition_service.check_assignment_access(
                assignment_id=1,
                user_id=999,
                user_role="admin"
            )
            assert result is True
        # This test covers line 1218: return True for admin role

    @pytest.mark.asyncio
    async def test_check_material_access_as_admin(self, tuition_service, mock_db):
        """Test material access check for admin role"""
        mock_material = StudyMaterial(id=1, teacher_id=5, is_public=False)

        with patch.object(tuition_service, 'get_study_material_by_id', return_value=mock_material):
            # Admin should have access to any material
            result = await tuition_service.check_material_access(
                material_id=1,
                user_id=999,
                user_role="admin"
            )
            assert result is True
        # This test covers line 1237: return True for admin role
