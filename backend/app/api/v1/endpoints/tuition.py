"""
Tuition API endpoints for educational functionality.
"""

from datetime import date, datetime, time
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ....auth.dependencies import get_current_active_user, get_current_user
from ....auth.models import User
from ....core.database import get_db
from ....models.course import Course, CourseLevel
from ....models.tuition import (
    Assignment,
    AssignmentCreate,
    AssignmentSubmission,
    AssignmentSubmissionCreate,
    AttendanceCreate,
    AttendanceStatus,
    ProgressReport,
    Quiz,
    QuizAttempt,
    QuizCreate,
    SessionAttendance,
    SessionStatus,
    StudyMaterial,
    StudyMaterialCreate,
    TuitionSession,
    TuitionSessionCreate,
    TuitionSessionUpdate,
)
from ....services.file_service import FileService
from ....services.tuition_service import TuitionService

router = APIRouter()
security = HTTPBearer()


# Session endpoints
@router.get("/sessions", response_model=List[Dict])
async def list_sessions(
    course_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    status: Optional[SessionStatus] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List tuition sessions"""
    tuition_service = TuitionService(db)

    # Filter based on user role
    if current_user.role == "student":
        # Students can only see sessions for courses they're enrolled in
        sessions = await tuition_service.get_student_sessions(
            student_id=current_user.id,
            course_id=course_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
        )
    elif current_user.role == "teacher":
        # Teachers can see their own sessions
        sessions = await tuition_service.get_teacher_sessions(
            teacher_id=current_user.id,
            course_id=course_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
        )
    else:
        # Admins can see all sessions
        sessions = await tuition_service.list_sessions(
            course_id=course_id,
            teacher_id=teacher_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
        )

    return sessions


@router.get("/sessions/upcoming")
async def get_upcoming_sessions(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get upcoming sessions for the user"""
    tuition_service = TuitionService(db)

    if current_user.role == "student":
        sessions = await tuition_service.get_student_upcoming_sessions(
            student_id=current_user.id, limit=limit
        )
    elif current_user.role == "teacher":
        sessions = await tuition_service.get_teacher_upcoming_sessions(
            teacher_id=current_user.id, limit=limit
        )
    else:
        sessions = await tuition_service.get_upcoming_sessions(limit=limit)

    return sessions


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get session by ID"""
    tuition_service = TuitionService(db)

    session = await tuition_service.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Check access permissions
    has_access = await tuition_service.check_session_access(
        session_id=session_id, user_id=current_user.id, user_role=current_user.role
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this session"
        )

    return session


@router.post("/sessions")
async def create_session(
    session_data: TuitionSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new session (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create sessions",
        )

    tuition_service = TuitionService(db)

    # For teachers, ensure they can only create sessions for their courses
    if current_user.role == "teacher":
        can_create = await tuition_service.can_teacher_create_session(
            teacher_id=current_user.id, course_id=session_data.course_id
        )
        if not can_create:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create sessions for this course",
            )

    session = await tuition_service.create_session(
        session_data=session_data, teacher_id=current_user.id
    )

    return {"message": "Session created successfully", "session": session}


@router.put("/sessions/{session_id}")
async def update_session(
    session_id: int,
    session_data: TuitionSessionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update session (teacher/admin only)"""
    tuition_service = TuitionService(db)

    # Check ownership/permissions
    session = await tuition_service.get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if current_user.role == "teacher" and session.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this session"
        )
    elif current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update sessions"
        )

    updated_session = await tuition_service.update_session(session_id, session_data)
    return {"message": "Session updated successfully", "session": updated_session}


@router.post("/sessions/{session_id}/start")
async def start_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a session (teacher only)"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can start sessions"
        )

    tuition_service = TuitionService(db)

    session = await tuition_service.start_session(session_id=session_id, teacher_id=current_user.id)

    return {"message": "Session started", "session": session}


@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: int,
    summary: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """End a session (teacher only)"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can end sessions"
        )

    tuition_service = TuitionService(db)

    session = await tuition_service.end_session(
        session_id=session_id, teacher_id=current_user.id, summary=summary
    )

    return {"message": "Session ended", "session": session}


# Attendance endpoints
@router.get("/sessions/{session_id}/attendance")
async def get_session_attendance(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get attendance for a session"""
    tuition_service = TuitionService(db)

    # Check access permissions
    has_access = await tuition_service.check_session_access(
        session_id=session_id, user_id=current_user.id, user_role=current_user.role
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view attendance for this session",
        )

    attendance = await tuition_service.get_session_attendance(session_id)
    return attendance


@router.post("/sessions/{session_id}/attendance")
async def mark_attendance(
    session_id: int,
    attendance_data: List[AttendanceCreate],
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark attendance for students (teacher only)"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can mark attendance"
        )

    tuition_service = TuitionService(db)

    # Verify teacher owns the session
    session = await tuition_service.get_session_by_id(session_id)
    if not session or session.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark attendance for this session",
        )

    attendance_records = await tuition_service.mark_bulk_attendance(
        session_id=session_id, attendance_data=attendance_data
    )

    return {"message": "Attendance marked", "attendance": attendance_records}


@router.get("/students/{student_id}/attendance")
async def get_student_attendance(
    student_id: str,
    course_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get attendance for a student"""
    tuition_service = TuitionService(db)

    # Check permissions
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students can only view their own attendance",
        )

    attendance = await tuition_service.get_student_attendance(
        student_id=student_id, course_id=course_id, start_date=start_date, end_date=end_date
    )

    return attendance


# Assignment endpoints
@router.get("/assignments")
async def list_assignments(
    course_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    published_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List assignments"""
    tuition_service = TuitionService(db)

    if current_user.role == "student":
        assignments = await tuition_service.get_student_assignments(
            student_id=current_user.id, course_id=course_id, skip=skip, limit=limit
        )
    elif current_user.role == "teacher":
        assignments = await tuition_service.get_teacher_assignments(
            teacher_id=current_user.id,
            course_id=course_id,
            published_only=published_only,
            skip=skip,
            limit=limit,
        )
    else:
        assignments = await tuition_service.list_assignments(
            course_id=course_id,
            teacher_id=teacher_id,
            published_only=published_only,
            skip=skip,
            limit=limit,
        )

    return assignments


@router.get("/assignments/{assignment_id}")
async def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get assignment by ID"""
    tuition_service = TuitionService(db)

    assignment = await tuition_service.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    # Check access permissions
    has_access = await tuition_service.check_assignment_access(
        assignment_id=assignment_id, user_id=current_user.id, user_role=current_user.role
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this assignment"
        )

    return assignment


@router.post("/assignments")
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new assignment (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create assignments",
        )

    tuition_service = TuitionService(db)

    # For teachers, ensure they can only create assignments for their courses
    if current_user.role == "teacher":
        can_create = await tuition_service.can_teacher_create_assignment(
            teacher_id=current_user.id, course_id=assignment_data.course_id
        )
        if not can_create:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create assignments for this course",
            )

    assignment = await tuition_service.create_assignment(
        assignment_data=assignment_data, teacher_id=current_user.id
    )

    return {"message": "Assignment created successfully", "assignment": assignment}


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    submission_data: AssignmentSubmissionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit an assignment (student only)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only students can submit assignments"
        )

    tuition_service = TuitionService(db)

    submission = await tuition_service.submit_assignment(
        assignment_id=assignment_id,
        student_id=current_user.id,
        submission_text=submission_data.submission_text,
        attachments=submission_data.attachments,
    )

    return {"message": "Assignment submitted successfully", "submission": submission}


@router.get("/assignments/{assignment_id}/submissions")
async def get_assignment_submissions(
    assignment_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get submissions for an assignment (teacher/admin only)"""
    tuition_service = TuitionService(db)

    # Check if user can view submissions
    assignment = await tuition_service.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    if current_user.role == "teacher" and assignment.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view submissions for this assignment",
        )
    elif current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view assignment submissions",
        )

    submissions = await tuition_service.get_assignment_submissions(
        assignment_id=assignment_id, skip=skip, limit=limit
    )

    return submissions


@router.post("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    points: float,
    grade: str,
    feedback: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Grade a submission (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can grade submissions",
        )

    tuition_service = TuitionService(db)

    # Check if teacher owns the assignment
    submission = await tuition_service.get_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    assignment = await tuition_service.get_assignment_by_id(submission.assignment_id)
    if current_user.role == "teacher" and assignment.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to grade this submission"
        )

    graded_submission = await tuition_service.grade_submission(
        submission_id=submission_id, points=points, grade=grade, feedback=feedback
    )

    return {"message": "Submission graded successfully", "submission": graded_submission}


# Study Material endpoints
@router.get("/materials")
async def list_study_materials(
    course_id: Optional[int] = None,
    session_id: Optional[int] = None,
    category: Optional[str] = None,
    material_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List study materials"""
    tuition_service = TuitionService(db)

    materials = await tuition_service.list_study_materials(
        course_id=course_id,
        session_id=session_id,
        category=category,
        material_type=material_type,
        user_id=current_user.id,
        user_role=current_user.role,
        skip=skip,
        limit=limit,
    )

    return materials


@router.get("/materials/{material_id}")
async def get_study_material(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get study material by ID"""
    tuition_service = TuitionService(db)

    material = await tuition_service.get_study_material_by_id(material_id)
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study material not found"
        )

    # Check access permissions
    has_access = await tuition_service.check_material_access(
        material_id=material_id, user_id=current_user.id, user_role=current_user.role
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this material"
        )

    # Increment view count
    await tuition_service.increment_material_view_count(material_id)

    return material


@router.post("/materials")
async def create_study_material(
    material_data: StudyMaterialCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create study material (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create study materials",
        )

    tuition_service = TuitionService(db)

    material = await tuition_service.create_study_material(
        material_data=material_data, teacher_id=current_user.id
    )

    return {"message": "Study material created successfully", "material": material}


@router.post("/materials/upload")
async def upload_study_material(
    file: UploadFile = File(...),
    course_id: int = Query(...),
    title: str = Query(...),
    description: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload study material file (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can upload study materials",
        )

    file_service = FileService()
    tuition_service = TuitionService(db)

    # Upload file
    file_url = await file_service.upload_file(
        file=file, folder="study_materials", user_id=current_user.id
    )

    # Create material record
    material_data = StudyMaterialCreate(
        course_id=course_id,
        title=title,
        description=description,
        material_type=file.content_type or "file",
        file_url=file_url,
        category=category,
    )

    material = await tuition_service.create_study_material(
        material_data=material_data, teacher_id=current_user.id
    )

    return {"message": "Study material uploaded successfully", "material": material}


# Quiz endpoints
@router.get("/quizzes")
async def list_quizzes(
    course_id: Optional[int] = None,
    published_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List quizzes"""
    tuition_service = TuitionService(db)

    if current_user.role == "student":
        quizzes = await tuition_service.get_student_available_quizzes(
            student_id=current_user.id, course_id=course_id, skip=skip, limit=limit
        )
    elif current_user.role == "teacher":
        quizzes = await tuition_service.get_teacher_quizzes(
            teacher_id=current_user.id,
            course_id=course_id,
            published_only=published_only,
            skip=skip,
            limit=limit,
        )
    else:
        quizzes = await tuition_service.list_quizzes(
            course_id=course_id, published_only=published_only, skip=skip, limit=limit
        )

    return quizzes


@router.post("/quizzes")
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new quiz (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create quizzes",
        )

    tuition_service = TuitionService(db)

    quiz = await tuition_service.create_quiz(quiz_data=quiz_data, teacher_id=current_user.id)

    return {"message": "Quiz created successfully", "quiz": quiz}


@router.post("/quizzes/{quiz_id}/start")
async def start_quiz_attempt(
    quiz_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a quiz attempt (student only)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only students can take quizzes"
        )

    tuition_service = TuitionService(db)

    attempt = await tuition_service.start_quiz_attempt(quiz_id=quiz_id, student_id=current_user.id)

    return {"message": "Quiz attempt started", "attempt": attempt}


@router.post("/quiz-attempts/{attempt_id}/submit")
async def submit_quiz_attempt(
    attempt_id: int,
    answers: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a quiz attempt (student only)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only students can submit quiz attempts"
        )

    tuition_service = TuitionService(db)

    # Verify attempt belongs to user
    attempt = await tuition_service.get_quiz_attempt_by_id(attempt_id)
    if not attempt or attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit this quiz attempt",
        )

    submitted_attempt = await tuition_service.submit_quiz_attempt(
        attempt_id=attempt_id, answers=answers
    )

    return {"message": "Quiz submitted successfully", "attempt": submitted_attempt}


# Progress Report endpoints
@router.get("/progress-reports")
async def get_progress_reports(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    report_period: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get progress reports"""
    tuition_service = TuitionService(db)

    # Students can only view their own reports
    if current_user.role == "student":
        student_id = current_user.id

    reports = await tuition_service.get_progress_reports(
        student_id=student_id,
        course_id=course_id,
        report_period=report_period,
        skip=skip,
        limit=limit,
    )

    return reports


@router.post("/progress-reports/generate")
async def generate_progress_report(
    enrollment_id: int,
    report_period: str,
    start_date: datetime,
    end_date: datetime,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate progress report (teacher/admin only)"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can generate progress reports",
        )

    tuition_service = TuitionService(db)

    report = await tuition_service.generate_progress_report(
        enrollment_id=enrollment_id,
        report_period=report_period,
        start_date=start_date,
        end_date=end_date,
        teacher_id=current_user.id,
    )

    return {"message": "Progress report generated successfully", "report": report}


# Analytics endpoints
@router.get("/analytics/course/{course_id}")
async def get_course_analytics(
    course_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get course analytics (teacher/admin only)"""
    tuition_service = TuitionService(db)

    # Check permissions
    if current_user.role == "teacher":
        can_view = await tuition_service.can_teacher_view_course(
            teacher_id=current_user.id, course_id=course_id
        )
        if not can_view:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view analytics for this course",
            )
    elif current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view course analytics"
        )

    analytics = await tuition_service.get_course_analytics(
        course_id=course_id, start_date=start_date, end_date=end_date
    )

    return analytics


@router.get("/analytics/student/{student_id}")
async def get_student_analytics(
    student_id: str,
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get student analytics"""
    tuition_service = TuitionService(db)

    # Students can only view their own analytics
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students can only view their own analytics",
        )

    analytics = await tuition_service.get_student_analytics(
        student_id=student_id, course_id=course_id
    )

    return analytics
