"""
Production-grade database configuration with connection pooling and monitoring.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from sqlmodel import SQLModel
import structlog
from typing import AsyncGenerator

from .settings import settings

logger = structlog.get_logger(__name__)

# Create async engine with production-grade configuration
# Note: For async engines, poolclass is automatically set to AsyncAdaptedQueuePool
# Handle SQLite vs PostgreSQL differences
engine_kwargs = {
    "echo": settings.debug,  # Log SQL queries in debug mode
    "future": True,
}

# Only add pool settings for PostgreSQL (not SQLite)
if "sqlite" not in settings.database_url.lower():
    engine_kwargs.update({
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
        "pool_timeout": settings.database_pool_timeout,
        "pool_recycle": settings.database_pool_recycle,
        "pool_pre_ping": True,  # Validate connections before use
    })
else:
    # SQLite-specific settings
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(settings.database_url, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Base class for all models
Base = declarative_base()


# Database connection monitoring
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set database connection parameters."""
    logger.info("Database connection established", 
                connection_id=id(dbapi_connection))


@event.listens_for(engine.sync_engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    """Monitor connection checkout."""
    logger.debug("Database connection checked out",
                 connection_id=id(dbapi_connection))


@event.listens_for(engine.sync_engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    """Monitor connection checkin."""
    logger.debug("Database connection checked in",
                 connection_id=id(dbapi_connection))


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Alias for compatibility
get_session = get_db


async def init_db():
    """Initialize database tables."""
    # Import all models to ensure they are registered with SQLModel
    from ..auth.models import User, Credential, OAuthAccount, RefreshToken, Session, VerificationCode, AuditLog, MagicLink
    from ..models.teacher import Teacher
    from ..models.course import Course
    from ..models.enrollment import Enrollment
    from ..models.payment import Payment
    from ..models.review import Review
    from ..models.shop import Product, Order, Cart, CartItem, OrderItem, ProductReview
    from ..models.tuition import (
        TuitionSession, SessionAttendance, Assignment, AssignmentSubmission,
        StudyMaterial, Quiz, QuizQuestion, QuizAttempt, ProgressReport
    )
    from ..models.chat import ChatRoom, ChatMessage
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    logger.info("Database tables initialized")


async def close_db():
    """Close database connections."""
    await engine.dispose()
    logger.info("Database connections closed")