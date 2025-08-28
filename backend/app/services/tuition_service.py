"""
Tuition service for educational business logic.
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload

from ..models.tuition import (
    TuitionSession, TuitionSessionCreate, TuitionSessionUpdate, SessionStatus,
    SessionAttendance, AttendanceCreate, AttendanceStatus,
    Assignment, AssignmentCreate, AssignmentSubmission, AssignmentSubmissionCreate, AssignmentStatus,
    StudyMaterial, StudyMaterialCreate,
    Quiz, QuizCreate, QuizAttempt, QuizQuestion,
    ProgressReport
)
from ..models.course import Course
from ..models.enrollment import Enrollment, EnrollmentStatus
from ..models.teacher import Teacher
from ..auth.models import User
from ..core.exceptions import ValidationException, NotFoundException

# Aliases for backward compatibility
ValidationError = ValidationException
NotFoundError = NotFoundException
BusinessLogicError = ValidationException


class TuitionService:
    """Service class for tuition functionality"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # Session methods
    async def create_session(self, session_data: TuitionSessionCreate, teacher_id: int) -> TuitionSession:
        """Create a new tuition session"""
        # Validate course exists and teacher has access
        course = await self.db.get(Course, session_data.course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        if course.teacher_id != teacher_id:
            raise ValidationError("Teacher not authorized for this course")
        
        # Check for scheduling conflicts
        conflicts = await self._check_session_conflicts(
            teacher_id=teacher_id,
            scheduled_date=session_data.scheduled_date,
            start_time=session_data.start_time,
            end_time=session_data.end_time
        )
        
        if conflicts:
            raise ValidationError("Session conflicts with existing schedule")
        
        session = TuitionSession(
            teacher_id=teacher_id,
            **session_data.model_dump()
        )
        
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
    
    async def get_session_by_id(self, session_id: int) -> Optional[TuitionSession]:
        """Get session by ID"""
        result = await self.db.execute(
            select(TuitionSession)
            .options(
                selectinload(TuitionSession.attendances),
                selectinload(TuitionSession.assignments)
            )
            .where(TuitionSession.id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def update_session(self, session_id: int, session_data: TuitionSessionUpdate) -> TuitionSession:
        """Update session"""
        session = await self.get_session_by_id(session_id)
        if not session:
            raise NotFoundError("Session not found")
        
        update_data = session_data.model_dump(exclude_unset=True)
        
        # Check for scheduling conflicts if date/time is being updated
        if any(field in update_data for field in ['scheduled_date', 'start_time', 'end_time']):
            conflicts = await self._check_session_conflicts(
                teacher_id=session.teacher_id,
                scheduled_date=update_data.get('scheduled_date', session.scheduled_date),
                start_time=update_data.get('start_time', session.start_time),
                end_time=update_data.get('end_time', session.end_time),
                exclude_session_id=session_id
            )
            
            if conflicts:
                raise ValidationError("Session conflicts with existing schedule")
        
        for field, value in update_data.items():
            setattr(session, field, value)
        
        session.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
    
    async def start_session(self, session_id: int, teacher_id: int) -> TuitionSession:
        """Start a session"""
        session = await self.get_session_by_id(session_id)
        if not session:
            raise NotFoundError("Session not found")
        
        if session.teacher_id != teacher_id:
            raise ValidationError("Not authorized to start this session")
        
        if session.status != SessionStatus.SCHEDULED:
            raise ValidationError("Session cannot be started")
        
        session.status = SessionStatus.IN_PROGRESS
        session.started_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
    
    async def end_session(self, session_id: int, teacher_id: int, summary: Optional[str] = None) -> TuitionSession:
        """End a session"""
        session = await self.get_session_by_id(session_id)
        if not session:
            raise NotFoundError("Session not found")
        
        if session.teacher_id != teacher_id:
            raise ValidationError("Not authorized to end this session")
        
        if session.status != SessionStatus.IN_PROGRESS:
            raise ValidationError("Session is not in progress")
        
        session.status = SessionStatus.COMPLETED
        session.ended_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        
        if summary:
            session.session_summary = summary
        
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
    
    async def list_sessions(
        self,
        course_id: Optional[int] = None,
        teacher_id: Optional[int] = None,
        status: Optional[SessionStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TuitionSession]:
        """List sessions with filters"""
        query = select(TuitionSession)
        
        if course_id:
            query = query.where(TuitionSession.course_id == course_id)
        if teacher_id:
            query = query.where(TuitionSession.teacher_id == teacher_id)
        if status:
            query = query.where(TuitionSession.status == status)
        if start_date:
            query = query.where(TuitionSession.scheduled_date >= start_date)
        if end_date:
            query = query.where(TuitionSession.scheduled_date <= end_date)
        
        query = query.order_by(desc(TuitionSession.scheduled_date)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_student_sessions(
        self,
        student_id: int,
        course_id: Optional[int] = None,
        status: Optional[SessionStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TuitionSession]:
        """Get sessions for a student based on enrollments"""
        # Get enrolled course IDs
        enrolled_courses_query = select(Enrollment.course_id).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.status == EnrollmentStatus.ACTIVE
            )
        )
        
        if course_id:
            enrolled_courses_query = enrolled_courses_query.where(Enrollment.course_id == course_id)
        
        enrolled_courses_result = await self.db.execute(enrolled_courses_query)
        enrolled_course_ids = [row[0] for row in enrolled_courses_result.fetchall()]
        
        if not enrolled_course_ids:
            return []
        
        # Get sessions for enrolled courses
        query = select(TuitionSession).where(TuitionSession.course_id.in_(enrolled_course_ids))
        
        if status:
            query = query.where(TuitionSession.status == status)
        if start_date:
            query = query.where(TuitionSession.scheduled_date >= start_date)
        if end_date:
            query = query.where(TuitionSession.scheduled_date <= end_date)
        
        query = query.order_by(desc(TuitionSession.scheduled_date)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_teacher_sessions(
        self,
        teacher_id: int,
        course_id: Optional[int] = None,
        status: Optional[SessionStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TuitionSession]:
        """Get sessions for a teacher"""
        return await self.list_sessions(
            course_id=course_id,
            teacher_id=teacher_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    
    async def get_upcoming_sessions(self, limit: int = 10) -> List[TuitionSession]:
        """Get upcoming sessions"""
        result = await self.db.execute(
            select(TuitionSession)
            .where(
                and_(
                    TuitionSession.scheduled_date >= date.today(),
                    TuitionSession.status == SessionStatus.SCHEDULED
                )
            )
            .order_by(TuitionSession.scheduled_date, TuitionSession.start_time)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_student_upcoming_sessions(self, student_id: int, limit: int = 10) -> List[TuitionSession]:
        """Get upcoming sessions for a student"""
        return await self.get_student_sessions(
            student_id=student_id,
            status=SessionStatus.SCHEDULED,
            start_date=date.today(),
            limit=limit
        )
    
    async def get_teacher_upcoming_sessions(self, teacher_id: int, limit: int = 10) -> List[TuitionSession]:
        """Get upcoming sessions for a teacher"""
        return await self.get_teacher_sessions(
            teacher_id=teacher_id,
            status=SessionStatus.SCHEDULED,
            start_date=date.today(),
            limit=limit
        )
    
    # Attendance methods
    async def get_session_attendance(self, session_id: int) -> List[SessionAttendance]:
        """Get attendance for a session"""
        result = await self.db.execute(
            select(SessionAttendance)
            .options(selectinload(SessionAttendance.student))
            .where(SessionAttendance.session_id == session_id)
        )
        return result.scalars().all()
    
    async def mark_attendance(
        self,
        session_id: int,
        student_id: int,
        status: AttendanceStatus,
        participation_score: Optional[int] = None
    ) -> SessionAttendance:
        """Mark attendance for a student"""
        # Check if attendance already exists
        result = await self.db.execute(
            select(SessionAttendance)
            .where(
                and_(
                    SessionAttendance.session_id == session_id,
                    SessionAttendance.student_id == student_id
                )
            )
        )
        attendance = result.scalar_one_or_none()
        
        if attendance:
            # Update existing attendance
            attendance.status = status
            attendance.participation_score = participation_score
            attendance.updated_at = datetime.now(timezone.utc)
        else:
            # Get enrollment ID
            enrollment = await self._get_student_enrollment(student_id, session_id)
            if not enrollment:
                raise ValidationError("Student not enrolled in this course")
            
            # Create new attendance
            attendance = SessionAttendance(
                session_id=session_id,
                student_id=student_id,
                enrollment_id=enrollment.id,
                status=status,
                participation_score=participation_score
            )
            self.db.add(attendance)
        
        if status == AttendanceStatus.PRESENT:
            attendance.check_in_time = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(attendance)
        
        return attendance
    
    async def mark_bulk_attendance(
        self,
        session_id: int,
        attendance_data: List[AttendanceCreate]
    ) -> List[SessionAttendance]:
        """Mark attendance for multiple students"""
        attendance_records = []
        
        for data in attendance_data:
            attendance = await self.mark_attendance(
                session_id=session_id,
                student_id=data.student_id,
                status=data.status,
                participation_score=data.participation_score
            )
            attendance_records.append(attendance)
        
        return attendance_records
    
    async def get_student_attendance(
        self,
        student_id: int,
        course_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SessionAttendance]:
        """Get attendance for a student"""
        query = select(SessionAttendance).where(SessionAttendance.student_id == student_id)
        
        if course_id or start_date or end_date:
            query = query.join(TuitionSession)
            
            if course_id:
                query = query.where(TuitionSession.course_id == course_id)
            if start_date:
                query = query.where(TuitionSession.scheduled_date >= start_date)
            if end_date:
                query = query.where(TuitionSession.scheduled_date <= end_date)
        
        query = query.order_by(desc(SessionAttendance.created_at))
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    # Assignment methods
    async def create_assignment(self, assignment_data: AssignmentCreate, teacher_id: int) -> Assignment:
        """Create a new assignment"""
        # Validate course exists and teacher has access
        course = await self.db.get(Course, assignment_data.course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        if course.teacher_id != teacher_id:
            raise ValidationError("Teacher not authorized for this course")
        
        assignment = Assignment(
            teacher_id=teacher_id,
            **assignment_data.model_dump()
        )
        
        self.db.add(assignment)
        await self.db.commit()
        await self.db.refresh(assignment)
        
        return assignment
    
    async def get_assignment_by_id(self, assignment_id: int) -> Optional[Assignment]:
        """Get assignment by ID"""
        result = await self.db.execute(
            select(Assignment)
            .options(selectinload(Assignment.submissions))
            .where(Assignment.id == assignment_id)
        )
        return result.scalar_one_or_none()
    
    async def list_assignments(
        self,
        course_id: Optional[int] = None,
        teacher_id: Optional[int] = None,
        published_only: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Assignment]:
        """List assignments"""
        query = select(Assignment)
        
        if course_id:
            query = query.where(Assignment.course_id == course_id)
        if teacher_id:
            query = query.where(Assignment.teacher_id == teacher_id)
        if published_only:
            query = query.where(Assignment.is_published == True)
        
        query = query.order_by(desc(Assignment.due_date)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_student_assignments(
        self,
        student_id: int,
        course_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Assignment]:
        """Get assignments for a student based on enrollments"""
        # Get enrolled course IDs
        enrolled_courses_query = select(Enrollment.course_id).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.status == EnrollmentStatus.ACTIVE
            )
        )
        
        if course_id:
            enrolled_courses_query = enrolled_courses_query.where(Enrollment.course_id == course_id)
        
        enrolled_courses_result = await self.db.execute(enrolled_courses_query)
        enrolled_course_ids = [row[0] for row in enrolled_courses_result.fetchall()]
        
        if not enrolled_course_ids:
            return []
        
        # Get assignments for enrolled courses
        query = select(Assignment).where(
            and_(
                Assignment.course_id.in_(enrolled_course_ids),
                Assignment.is_published == True
            )
        )
        
        query = query.order_by(desc(Assignment.due_date)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_teacher_assignments(
        self,
        teacher_id: int,
        course_id: Optional[int] = None,
        published_only: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Assignment]:
        """Get assignments created by a teacher"""
        return await self.list_assignments(
            course_id=course_id,
            teacher_id=teacher_id,
            published_only=published_only,
            skip=skip,
            limit=limit
        )
    
    async def submit_assignment(
        self,
        assignment_id: int,
        student_id: int,
        submission_text: Optional[str] = None,
        attachments: List[Dict] = None
    ) -> AssignmentSubmission:
        """Submit an assignment"""
        assignment = await self.get_assignment_by_id(assignment_id)
        if not assignment:
            raise NotFoundError("Assignment not found")
        
        if not assignment.is_published:
            raise ValidationError("Assignment is not published")
        
        # Check if student is enrolled
        enrollment = await self._get_student_enrollment_by_course(student_id, assignment.course_id)
        if not enrollment:
            raise ValidationError("Student not enrolled in this course")
        
        # Check if already submitted
        existing_submission = await self.get_student_assignment_submission(assignment_id, student_id)
        if existing_submission:
            raise ValidationError("Assignment already submitted")
        
        # Check deadline
        is_late = datetime.now(timezone.utc) > assignment.due_date
        if is_late and not assignment.allow_late_submission:
            raise ValidationError("Assignment deadline has passed")
        
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student_id,
            enrollment_id=enrollment.id,
            submission_text=submission_text,
            attachments=attachments or [],
            status=AssignmentStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
            is_late=is_late
        )
        
        self.db.add(submission)
        await self.db.commit()
        await self.db.refresh(submission)
        
        return submission
    
    async def get_assignment_submissions(
        self,
        assignment_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[AssignmentSubmission]:
        """Get submissions for an assignment"""
        result = await self.db.execute(
            select(AssignmentSubmission)
            .options(selectinload(AssignmentSubmission.student))
            .where(AssignmentSubmission.assignment_id == assignment_id)
            .order_by(desc(AssignmentSubmission.submitted_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_student_assignment_submission(
        self,
        assignment_id: int,
        student_id: int
    ) -> Optional[AssignmentSubmission]:
        """Get specific student's submission for an assignment"""
        result = await self.db.execute(
            select(AssignmentSubmission)
            .where(
                and_(
                    AssignmentSubmission.assignment_id == assignment_id,
                    AssignmentSubmission.student_id == student_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_submission_by_id(self, submission_id: int) -> Optional[AssignmentSubmission]:
        """Get submission by ID"""
        result = await self.db.execute(
            select(AssignmentSubmission).where(AssignmentSubmission.id == submission_id)
        )
        return result.scalar_one_or_none()
    
    async def grade_submission(
        self,
        submission_id: int,
        points: float,
        grade: str,
        feedback: Optional[str] = None
    ) -> AssignmentSubmission:
        """Grade a submission"""
        submission = await self.get_submission_by_id(submission_id)
        if not submission:
            raise NotFoundError("Submission not found")
        
        submission.points_earned = points
        submission.grade = grade
        submission.feedback = feedback
        submission.status = AssignmentStatus.GRADED
        submission.graded_at = datetime.now(timezone.utc)
        submission.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(submission)
        
        return submission
    
    # Study Material methods
    async def create_study_material(self, material_data: StudyMaterialCreate, teacher_id: int) -> StudyMaterial:
        """Create study material"""
        # Validate course exists and teacher has access
        course = await self.db.get(Course, material_data.course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        if course.teacher_id != teacher_id:
            raise ValidationError("Teacher not authorized for this course")
        
        material = StudyMaterial(
            teacher_id=teacher_id,
            **material_data.model_dump()
        )
        
        self.db.add(material)
        await self.db.commit()
        await self.db.refresh(material)
        
        return material
    
    async def get_study_material_by_id(self, material_id: int) -> Optional[StudyMaterial]:
        """Get study material by ID"""
        result = await self.db.execute(
            select(StudyMaterial).where(StudyMaterial.id == material_id)
        )
        return result.scalar_one_or_none()
    
    async def list_study_materials(
        self,
        course_id: Optional[int] = None,
        session_id: Optional[int] = None,
        category: Optional[str] = None,
        material_type: Optional[str] = None,
        user_id: Optional[int] = None,
        user_role: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[StudyMaterial]:
        """List study materials with access control"""
        query = select(StudyMaterial)
        
        # Apply filters
        if course_id:
            query = query.where(StudyMaterial.course_id == course_id)
        if session_id:
            query = query.where(StudyMaterial.session_id == session_id)
        if category:
            query = query.where(StudyMaterial.category == category)
        if material_type:
            query = query.where(StudyMaterial.material_type == material_type)
        
        # Apply access control
        if user_role == "student":
            # Students can only see public materials or materials for courses they're enrolled in
            enrolled_courses_query = select(Enrollment.course_id).where(
                and_(
                    Enrollment.student_id == user_id,
                    Enrollment.status == EnrollmentStatus.ACTIVE
                )
            )
            enrolled_courses_result = await self.db.execute(enrolled_courses_query)
            enrolled_course_ids = [row[0] for row in enrolled_courses_result.fetchall()]
            
            query = query.where(
                or_(
                    StudyMaterial.is_public == True,
                    and_(
                        StudyMaterial.requires_enrollment == True,
                        StudyMaterial.course_id.in_(enrolled_course_ids)
                    )
                )
            )
        elif user_role == "teacher":
            # Teachers can see their own materials and public materials
            query = query.where(
                or_(
                    StudyMaterial.teacher_id == user_id,
                    StudyMaterial.is_public == True
                )
            )
        
        query = query.order_by(desc(StudyMaterial.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def increment_material_view_count(self, material_id: int) -> bool:
        """Increment material view count"""
        material = await self.get_study_material_by_id(material_id)
        if material:
            material.view_count += 1
            await self.db.commit()
            return True
        return False
    
    # Quiz methods
    async def create_quiz(self, quiz_data: QuizCreate, teacher_id: int) -> Quiz:
        """Create a new quiz"""
        # Validate course exists and teacher has access
        course = await self.db.get(Course, quiz_data.course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        if course.teacher_id != teacher_id:
            raise ValidationError("Teacher not authorized for this course")
        
        quiz = Quiz(
            teacher_id=teacher_id,
            **quiz_data.model_dump(exclude={"questions"})
        )
        
        self.db.add(quiz)
        await self.db.flush()  # Get quiz ID
        
        # Add questions
        total_points = 0
        for i, question_data in enumerate(quiz_data.questions):
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=question_data["question_text"],
                question_type=question_data.get("question_type", "multiple_choice"),
                points=question_data.get("points", 1),
                order_index=i,
                options=question_data.get("options", []),
                correct_answer=question_data.get("correct_answer")
            )
            self.db.add(question)
            total_points += question.points
        
        quiz.total_points = total_points
        
        await self.db.commit()
        await self.db.refresh(quiz)
        
        return quiz
    
    async def get_quiz_by_id(self, quiz_id: int) -> Optional[Quiz]:
        """Get quiz by ID"""
        result = await self.db.execute(
            select(Quiz)
            .options(selectinload(Quiz.questions))
            .where(Quiz.id == quiz_id)
        )
        return result.scalar_one_or_none()
    
    async def list_quizzes(
        self,
        course_id: Optional[int] = None,
        published_only: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Quiz]:
        """List quizzes"""
        query = select(Quiz)
        
        if course_id:
            query = query.where(Quiz.course_id == course_id)
        if published_only:
            query = query.where(Quiz.is_published == True)
        
        query = query.order_by(desc(Quiz.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_student_available_quizzes(
        self,
        student_id: int,
        course_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Quiz]:
        """Get available quizzes for a student"""
        # Get enrolled course IDs
        enrolled_courses_query = select(Enrollment.course_id).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.status == EnrollmentStatus.ACTIVE
            )
        )
        
        if course_id:
            enrolled_courses_query = enrolled_courses_query.where(Enrollment.course_id == course_id)
        
        enrolled_courses_result = await self.db.execute(enrolled_courses_query)
        enrolled_course_ids = [row[0] for row in enrolled_courses_result.fetchall()]
        
        if not enrolled_course_ids:
            return []
        
        # Get available quizzes
        now = datetime.now(timezone.utc)
        query = select(Quiz).where(
            and_(
                Quiz.course_id.in_(enrolled_course_ids),
                Quiz.is_published == True,
                Quiz.available_from <= now,
                Quiz.available_until >= now
            )
        )
        
        query = query.order_by(desc(Quiz.available_until)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_teacher_quizzes(
        self,
        teacher_id: int,
        course_id: Optional[int] = None,
        published_only: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Quiz]:
        """Get quizzes created by a teacher"""
        query = select(Quiz).where(Quiz.teacher_id == teacher_id)
        
        if course_id:
            query = query.where(Quiz.course_id == course_id)
        if published_only:
            query = query.where(Quiz.is_published == True)
        
        query = query.order_by(desc(Quiz.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def start_quiz_attempt(self, quiz_id: int, student_id: int) -> QuizAttempt:
        """Start a quiz attempt"""
        quiz = await self.get_quiz_by_id(quiz_id)
        if not quiz:
            raise NotFoundError("Quiz not found")
        
        # Check if quiz is available
        now = datetime.now(timezone.utc)
        if not (quiz.is_published and quiz.available_from <= now <= quiz.available_until):
            raise ValidationError("Quiz is not available")
        
        # Check enrollment
        enrollment = await self._get_student_enrollment_by_course(student_id, quiz.course_id)
        if not enrollment:
            raise ValidationError("Student not enrolled in this course")
        
        # Check attempt limit
        attempt_count = await self.get_quiz_attempt_count(quiz_id, student_id)
        if attempt_count >= quiz.max_attempts:
            raise ValidationError("Maximum attempts reached")
        
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student_id,
            enrollment_id=enrollment.id,
            attempt_number=attempt_count + 1
        )
        
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        
        return attempt
    
    async def submit_quiz_attempt(self, attempt_id: int, answers: Dict[str, Any]) -> QuizAttempt:
        """Submit a quiz attempt"""
        attempt = await self.get_quiz_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundError("Quiz attempt not found")
        
        if attempt.is_completed:
            raise ValidationError("Quiz attempt already submitted")
        
        quiz = await self.get_quiz_by_id(attempt.quiz_id)
        
        # Check time limit
        if quiz.duration_minutes > 0:
            elapsed = datetime.now(timezone.utc) - attempt.started_at
            if elapsed.total_seconds() / 60 > quiz.duration_minutes:
                raise ValidationError("Time limit exceeded")
        
        # Calculate score
        correct_answers = 0
        for question in quiz.questions:
            question_id = str(question.id)
            if question_id in answers:
                student_answer = answers[question_id]
                if question.question_type == "multiple_choice":
                    # Check if selected option is correct
                    for option in question.options:
                        if option.get("text") == student_answer and option.get("is_correct"):
                            correct_answers += question.points
                            break
                elif question.question_type in ["true_false", "short_answer"]:
                    if student_answer.lower().strip() == question.correct_answer.lower().strip():
                        correct_answers += question.points
        
        # Update attempt
        attempt.answers = answers
        attempt.score = correct_answers
        attempt.percentage = (correct_answers / quiz.total_points * 100) if quiz.total_points > 0 else 0
        attempt.passed = attempt.score >= (quiz.passing_score or 0)
        attempt.submitted_at = datetime.now(timezone.utc)
        attempt.is_completed = True
        
        # Calculate time taken
        time_taken = attempt.submitted_at - attempt.started_at
        attempt.time_taken_minutes = int(time_taken.total_seconds() / 60)
        
        await self.db.commit()
        await self.db.refresh(attempt)
        
        return attempt
    
    async def get_quiz_attempt_by_id(self, attempt_id: int) -> Optional[QuizAttempt]:
        """Get quiz attempt by ID"""
        result = await self.db.execute(
            select(QuizAttempt).where(QuizAttempt.id == attempt_id)
        )
        return result.scalar_one_or_none()
    
    async def get_quiz_attempt_count(self, quiz_id: int, student_id: int) -> int:
        """Get number of attempts by student for a quiz"""
        result = await self.db.execute(
            select(func.count(QuizAttempt.id))
            .where(
                and_(
                    QuizAttempt.quiz_id == quiz_id,
                    QuizAttempt.student_id == student_id
                )
            )
        )
        return result.scalar() or 0
    
    # Progress Report methods
    async def generate_progress_report(
        self,
        enrollment_id: int,
        report_period: str,
        start_date: datetime,
        end_date: datetime,
        teacher_id: int
    ) -> ProgressReport:
        """Generate a progress report"""
        enrollment = await self.db.get(Enrollment, enrollment_id)
        if not enrollment:
            raise NotFoundError("Enrollment not found")
        
        # Calculate attendance metrics
        attendance_stats = await self._calculate_attendance_stats(
            enrollment.student_id,
            enrollment.course_id,
            start_date,
            end_date
        )
        
        # Calculate assignment metrics
        assignment_stats = await self._calculate_assignment_stats(
            enrollment.student_id,
            enrollment.course_id,
            start_date,
            end_date
        )
        
        # Calculate quiz metrics
        quiz_stats = await self._calculate_quiz_stats(
            enrollment.student_id,
            enrollment.course_id,
            start_date,
            end_date
        )
        
        # Calculate overall performance
        overall_percentage = (
            (attendance_stats["attendance_percentage"] * 0.3) +
            (assignment_stats["average_score"] * 0.4) +
            (quiz_stats["average_score"] * 0.3)
        )
        
        report = ProgressReport(
            enrollment_id=enrollment_id,
            student_id=enrollment.student_id,
            course_id=enrollment.course_id,
            teacher_id=teacher_id,
            report_period=report_period,
            start_date=start_date,
            end_date=end_date,
            total_sessions=attendance_stats["total_sessions"],
            attended_sessions=attendance_stats["attended_sessions"],
            attendance_percentage=attendance_stats["attendance_percentage"],
            assignments_completed=assignment_stats["completed"],
            assignments_total=assignment_stats["total"],
            average_assignment_score=assignment_stats["average_score"],
            quizzes_taken=quiz_stats["taken"],
            quizzes_passed=quiz_stats["passed"],
            average_quiz_score=quiz_stats["average_score"],
            overall_percentage=overall_percentage
        )
        
        # Determine overall grade
        if overall_percentage >= 90:
            report.overall_grade = "A"
        elif overall_percentage >= 80:
            report.overall_grade = "B"
        elif overall_percentage >= 70:
            report.overall_grade = "C"
        elif overall_percentage >= 60:
            report.overall_grade = "D"
        else:
            report.overall_grade = "F"
        
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        
        return report
    
    async def get_progress_reports(
        self,
        student_id: Optional[int] = None,
        course_id: Optional[int] = None,
        report_period: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProgressReport]:
        """Get progress reports"""
        query = select(ProgressReport)
        
        if student_id:
            query = query.where(ProgressReport.student_id == student_id)
        if course_id:
            query = query.where(ProgressReport.course_id == course_id)
        if report_period:
            query = query.where(ProgressReport.report_period == report_period)
        
        query = query.order_by(desc(ProgressReport.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    # Analytics methods
    async def get_course_analytics(
        self,
        course_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get course analytics"""
        # Session analytics
        session_query = select(
            func.count(TuitionSession.id).label("total_sessions"),
            func.count(TuitionSession.id).filter(TuitionSession.status == SessionStatus.COMPLETED).label("completed_sessions"),
            func.avg(TuitionSession.duration_minutes).label("avg_duration")
        ).where(TuitionSession.course_id == course_id)
        
        if start_date:
            session_query = session_query.where(TuitionSession.scheduled_date >= start_date)
        if end_date:
            session_query = session_query.where(TuitionSession.scheduled_date <= end_date)
        
        session_result = await self.db.execute(session_query)
        session_stats = session_result.first()
        
        # Enrollment analytics
        enrollment_query = select(
            func.count(Enrollment.id).label("total_enrollments"),
            func.count(Enrollment.id).filter(Enrollment.status == EnrollmentStatus.ACTIVE).label("active_enrollments"),
            func.avg(Enrollment.completion_percentage).label("avg_completion")
        ).where(Enrollment.course_id == course_id)
        
        enrollment_result = await self.db.execute(enrollment_query)
        enrollment_stats = enrollment_result.first()
        
        # Attendance analytics
        attendance_query = select(
            func.count(SessionAttendance.id).label("total_attendance_records"),
            func.count(SessionAttendance.id).filter(SessionAttendance.status == AttendanceStatus.PRESENT).label("present_count"),
            func.avg(SessionAttendance.participation_score).label("avg_participation")
        ).join(TuitionSession).where(TuitionSession.course_id == course_id)
        
        if start_date:
            attendance_query = attendance_query.where(TuitionSession.scheduled_date >= start_date)
        if end_date:
            attendance_query = attendance_query.where(TuitionSession.scheduled_date <= end_date)
        
        attendance_result = await self.db.execute(attendance_query)
        attendance_stats = attendance_result.first()
        
        return {
            "sessions": {
                "total": session_stats.total_sessions or 0,
                "completed": session_stats.completed_sessions or 0,
                "completion_rate": (session_stats.completed_sessions / session_stats.total_sessions * 100) if session_stats.total_sessions else 0,
                "average_duration": float(session_stats.avg_duration or 0)
            },
            "enrollments": {
                "total": enrollment_stats.total_enrollments or 0,
                "active": enrollment_stats.active_enrollments or 0,
                "average_completion": float(enrollment_stats.avg_completion or 0)
            },
            "attendance": {
                "total_records": attendance_stats.total_attendance_records or 0,
                "present_count": attendance_stats.present_count or 0,
                "attendance_rate": (attendance_stats.present_count / attendance_stats.total_attendance_records * 100) if attendance_stats.total_attendance_records else 0,
                "average_participation": float(attendance_stats.avg_participation or 0)
            }
        }
    
    async def get_student_analytics(
        self,
        student_id: int,
        course_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get student analytics"""
        # Enrollment analytics
        enrollment_query = select(Enrollment).where(Enrollment.student_id == student_id)
        if course_id:
            enrollment_query = enrollment_query.where(Enrollment.course_id == course_id)
        
        enrollment_result = await self.db.execute(enrollment_query)
        enrollments = enrollment_result.scalars().all()
        
        # Attendance analytics
        attendance_query = select(
            func.count(SessionAttendance.id).label("total_sessions"),
            func.count(SessionAttendance.id).filter(SessionAttendance.status == AttendanceStatus.PRESENT).label("attended_sessions"),
            func.avg(SessionAttendance.participation_score).label("avg_participation")
        ).where(SessionAttendance.student_id == student_id)
        
        if course_id:
            attendance_query = attendance_query.join(TuitionSession).where(TuitionSession.course_id == course_id)
        
        attendance_result = await self.db.execute(attendance_query)
        attendance_stats = attendance_result.first()
        
        # Assignment analytics
        assignment_query = select(
            func.count(AssignmentSubmission.id).label("total_submissions"),
            func.count(AssignmentSubmission.id).filter(AssignmentSubmission.status == AssignmentStatus.GRADED).label("graded_submissions"),
            func.avg(AssignmentSubmission.points_earned).label("avg_points")
        ).where(AssignmentSubmission.student_id == student_id)
        
        if course_id:
            assignment_query = assignment_query.join(Assignment).where(Assignment.course_id == course_id)
        
        assignment_result = await self.db.execute(assignment_query)
        assignment_stats = assignment_result.first()
        
        # Quiz analytics
        quiz_query = select(
            func.count(QuizAttempt.id).label("total_attempts"),
            func.count(QuizAttempt.id).filter(QuizAttempt.passed == True).label("passed_attempts"),
            func.avg(QuizAttempt.percentage).label("avg_percentage")
        ).where(QuizAttempt.student_id == student_id)
        
        if course_id:
            quiz_query = quiz_query.join(Quiz).where(Quiz.course_id == course_id)
        
        quiz_result = await self.db.execute(quiz_query)
        quiz_stats = quiz_result.first()
        
        return {
            "enrollments": {
                "total": len(enrollments),
                "active": len([e for e in enrollments if e.status == EnrollmentStatus.ACTIVE]),
                "completed": len([e for e in enrollments if e.status == EnrollmentStatus.COMPLETED])
            },
            "attendance": {
                "total_sessions": attendance_stats.total_sessions or 0,
                "attended_sessions": attendance_stats.attended_sessions or 0,
                "attendance_rate": (attendance_stats.attended_sessions / attendance_stats.total_sessions * 100) if attendance_stats.total_sessions else 0,
                "average_participation": float(attendance_stats.avg_participation or 0)
            },
            "assignments": {
                "total_submissions": assignment_stats.total_submissions or 0,
                "graded_submissions": assignment_stats.graded_submissions or 0,
                "average_points": float(assignment_stats.avg_points or 0)
            },
            "quizzes": {
                "total_attempts": quiz_stats.total_attempts or 0,
                "passed_attempts": quiz_stats.passed_attempts or 0,
                "pass_rate": (quiz_stats.passed_attempts / quiz_stats.total_attempts * 100) if quiz_stats.total_attempts else 0,
                "average_percentage": float(quiz_stats.avg_percentage or 0)
            }
        }
    
    # Permission check methods
    async def check_session_access(self, session_id: int, user_id: int, user_role: str) -> bool:
        """Check if user has access to a session"""
        session = await self.get_session_by_id(session_id)
        if not session:
            return False
        
        if user_role == "admin":
            return True
        elif user_role == "teacher":
            return session.teacher_id == user_id
        elif user_role == "student":
            # Check if student is enrolled in the course
            enrollment = await self._get_student_enrollment_by_course(user_id, session.course_id)
            return enrollment is not None and enrollment.status == EnrollmentStatus.ACTIVE
        
        return False
    
    async def check_assignment_access(self, assignment_id: int, user_id: int, user_role: str) -> bool:
        """Check if user has access to an assignment"""
        assignment = await self.get_assignment_by_id(assignment_id)
        if not assignment:
            return False
        
        if user_role == "admin":
            return True
        elif user_role == "teacher":
            return assignment.teacher_id == user_id
        elif user_role == "student":
            # Check if student is enrolled in the course and assignment is published
            if not assignment.is_published:
                return False
            enrollment = await self._get_student_enrollment_by_course(user_id, assignment.course_id)
            return enrollment is not None and enrollment.status == EnrollmentStatus.ACTIVE
        
        return False
    
    async def check_material_access(self, material_id: int, user_id: int, user_role: str) -> bool:
        """Check if user has access to study material"""
        material = await self.get_study_material_by_id(material_id)
        if not material:
            return False
        
        if user_role == "admin":
            return True
        elif user_role == "teacher":
            return material.teacher_id == user_id or material.is_public
        elif user_role == "student":
            if material.is_public:
                return True
            if material.requires_enrollment:
                enrollment = await self._get_student_enrollment_by_course(user_id, material.course_id)
                return enrollment is not None and enrollment.status == EnrollmentStatus.ACTIVE
        
        return False
    
    async def can_teacher_create_session(self, teacher_id: int, course_id: int) -> bool:
        """Check if teacher can create session for a course"""
        course = await self.db.get(Course, course_id)
        return course is not None and course.teacher_id == teacher_id
    
    async def can_teacher_create_assignment(self, teacher_id: int, course_id: int) -> bool:
        """Check if teacher can create assignment for a course"""
        course = await self.db.get(Course, course_id)
        return course is not None and course.teacher_id == teacher_id
    
    async def can_teacher_view_course(self, teacher_id: int, course_id: int) -> bool:
        """Check if teacher can view course analytics"""
        course = await self.db.get(Course, course_id)
        return course is not None and course.teacher_id == teacher_id
    
    # Helper methods
    async def _check_session_conflicts(
        self,
        teacher_id: int,
        scheduled_date: datetime,
        start_time: time,
        end_time: time,
        exclude_session_id: Optional[int] = None
    ) -> bool:
        """Check for session scheduling conflicts"""
        query = select(TuitionSession).where(
            and_(
                TuitionSession.teacher_id == teacher_id,
                TuitionSession.scheduled_date == scheduled_date.date(),
                TuitionSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]),
                or_(
                    and_(
                        TuitionSession.start_time <= start_time,
                        TuitionSession.end_time > start_time
                    ),
                    and_(
                        TuitionSession.start_time < end_time,
                        TuitionSession.end_time >= end_time
                    ),
                    and_(
                        TuitionSession.start_time >= start_time,
                        TuitionSession.end_time <= end_time
                    )
                )
            )
        )
        
        if exclude_session_id:
            query = query.where(TuitionSession.id != exclude_session_id)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def _get_student_enrollment(self, student_id: int, session_id: int) -> Optional[Enrollment]:
        """Get student enrollment for a session"""
        session = await self.get_session_by_id(session_id)
        if not session:
            return None
        
        return await self._get_student_enrollment_by_course(student_id, session.course_id)
    
    async def _get_student_enrollment_by_course(self, student_id: int, course_id: int) -> Optional[Enrollment]:
        """Get student enrollment for a course"""
        result = await self.db.execute(
            select(Enrollment).where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.course_id == course_id,
                    Enrollment.status == EnrollmentStatus.ACTIVE
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def _calculate_attendance_stats(
        self,
        student_id: int,
        course_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate attendance statistics"""
        query = select(
            func.count(SessionAttendance.id).label("total_sessions"),
            func.count(SessionAttendance.id).filter(SessionAttendance.status == AttendanceStatus.PRESENT).label("attended_sessions")
        ).join(TuitionSession).where(
            and_(
                SessionAttendance.student_id == student_id,
                TuitionSession.course_id == course_id,
                TuitionSession.scheduled_date >= start_date.date(),
                TuitionSession.scheduled_date <= end_date.date()
            )
        )
        
        result = await self.db.execute(query)
        stats = result.first()
        
        total = stats.total_sessions or 0
        attended = stats.attended_sessions or 0
        
        return {
            "total_sessions": total,
            "attended_sessions": attended,
            "attendance_percentage": (attended / total * 100) if total > 0 else 0
        }
    
    async def _calculate_assignment_stats(
        self,
        student_id: int,
        course_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate assignment statistics"""
        query = select(
            func.count(AssignmentSubmission.id).label("total_submissions"),
            func.count(AssignmentSubmission.id).filter(AssignmentSubmission.status == AssignmentStatus.GRADED).label("graded_submissions"),
            func.avg(AssignmentSubmission.points_earned).label("avg_points")
        ).join(Assignment).where(
            and_(
                AssignmentSubmission.student_id == student_id,
                Assignment.course_id == course_id,
                AssignmentSubmission.created_at >= start_date,
                AssignmentSubmission.created_at <= end_date
            )
        )
        
        result = await self.db.execute(query)
        stats = result.first()
        
        return {
            "total": stats.total_submissions or 0,
            "completed": stats.graded_submissions or 0,
            "average_score": float(stats.avg_points or 0)
        }
    
    async def _calculate_quiz_stats(
        self,
        student_id: int,
        course_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate quiz statistics"""
        query = select(
            func.count(QuizAttempt.id).label("total_attempts"),
            func.count(QuizAttempt.id).filter(QuizAttempt.passed == True).label("passed_attempts"),
            func.avg(QuizAttempt.percentage).label("avg_percentage")
        ).join(Quiz).where(
            and_(
                QuizAttempt.student_id == student_id,
                Quiz.course_id == course_id,
                QuizAttempt.created_at >= start_date,
                QuizAttempt.created_at <= end_date
            )
        )
        
        result = await self.db.execute(query)
        stats = result.first()
        
        return {
            "taken": stats.total_attempts or 0,
            "passed": stats.passed_attempts or 0,
            "average_score": float(stats.avg_percentage or 0)
        }