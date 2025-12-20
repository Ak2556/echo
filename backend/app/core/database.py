"""
Production-grade database configuration with connection pooling,
health checks, and async support.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

import structlog
from sqlalchemy import event, pool, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import QueuePool

from app.core.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

# Global engine and session factory
engine: Optional[AsyncEngine] = None
async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


def create_database_engine() -> AsyncEngine:
    """Create database engine with production-grade configuration."""

    # Connection pool configuration for high concurrency
    # Note: For async engines, don't use QueuePool - use NullPool or omit poolclass
    pool_config = {
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
        "pool_timeout": settings.database_pool_timeout,
        "pool_recycle": settings.database_pool_recycle,
        "pool_pre_ping": True,  # Validate connections before use
    }

    # For SQLite with async, use NullPool (no connection pooling)
    if "sqlite" in settings.database_url:
        pool_config = {"poolclass": pool.NullPool}

    # Engine configuration
    engine_config = {
        "url": settings.database_url,
        "echo": settings.database_echo,
        "echo_pool": settings.debug,
        "future": True,
        **pool_config,
    }

    # Create engine
    db_engine = create_async_engine(**engine_config)

    # Add connection event listeners for monitoring
    @event.listens_for(db_engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Set SQLite pragmas for better performance (if using SQLite)."""
        if "sqlite" in settings.database_url:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA cache_size=10000")
            cursor.execute("PRAGMA temp_store=MEMORY")
            cursor.close()

    @event.listens_for(db_engine.sync_engine, "checkout")
    def receive_checkout(dbapi_connection, connection_record, connection_proxy):
        """Log connection checkout for monitoring."""
        logger.debug("Database connection checked out")

    @event.listens_for(db_engine.sync_engine, "checkin")
    def receive_checkin(dbapi_connection, connection_record):
        """Log connection checkin for monitoring."""
        logger.debug("Database connection checked in")

    return db_engine


async def init_db() -> None:
    """Initialize database connection and create tables."""
    global engine, async_session_factory

    try:
        logger.info("Initializing database connection")

        # Create engine
        engine = create_database_engine()

        # Create session factory
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,
            autocommit=False,
        )

        # Import all models to ensure they're registered
        from sqlmodel import SQLModel

        from app.auth.models import (
            AuditLog,
            Credential,
            MagicLink,
            OAuthAccount,
            RefreshToken,
            Session,
            User,
            VerificationCode,
        )
        from app.models.chat import ChatMessage, ChatRoom
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        from app.models.payment import Payment
        from app.models.review import Review
        from app.models.shop import Cart, CartItem, Order, OrderItem, Product, ProductReview
        from app.models.teacher import Teacher
        from app.models.tuition import (
            Assignment,
            AssignmentSubmission,
            ProgressReport,
            Quiz,
            QuizAttempt,
            QuizQuestion,
            SessionAttendance,
            StudyMaterial,
            TuitionSession,
        )

        # Test connection
        async with engine.begin() as conn:
            # Create tables for both Base (DeclarativeBase) and SQLModel
            await conn.run_sync(Base.metadata.create_all)
            await conn.run_sync(SQLModel.metadata.create_all)
            logger.info("Database tables created/verified")

        # Test session
        async with get_db_session() as session:
            await session.execute(text("SELECT 1"))
            logger.info("Database connection test successful")

        logger.info(
            "Database initialized successfully",
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
        )

    except Exception as e:
        logger.error("Failed to initialize database", error=str(e))
        raise


async def close_db() -> None:
    """Close database connections gracefully."""
    global engine

    if engine:
        logger.info("Closing database connections")
        await engine.dispose()
        logger.info("Database connections closed")


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session with automatic cleanup."""
    if not async_session_factory:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI to get database session."""
    async with get_db_session() as session:
        yield session


# Alias for compatibility with old imports
get_session = get_db


async def health_check() -> bool:
    """Check database health for monitoring."""
    try:
        if not engine:
            return False

        async with get_db_session() as session:
            result = await session.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        return False


class DatabaseManager:
    """Database manager for advanced operations."""

    def __init__(self):
        self.engine = engine
        self.session_factory = async_session_factory

    async def execute_raw_sql(self, sql: str, params: dict = None) -> any:
        """Execute raw SQL with parameters."""
        async with get_db_session() as session:
            result = await session.execute(text(sql), params or {})
            return result

    async def get_connection_info(self) -> dict:
        """Get database connection information."""
        if not self.engine:
            return {"status": "not_connected"}

        pool = self.engine.pool
        return {
            "status": "connected",
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid(),
        }

    async def vacuum_analyze(self) -> None:
        """Run VACUUM ANALYZE for PostgreSQL optimization."""
        if "postgresql" in settings.database_url:
            async with self.engine.begin() as conn:
                await conn.execute(text("VACUUM ANALYZE"))
                logger.info("Database vacuum analyze completed")


# Global database manager instance
db_manager = DatabaseManager()
