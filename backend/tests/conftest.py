"""
Pytest configuration and fixtures for the Echo backend tests.
"""

import asyncio
import os
import warnings
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

# Suppress Pydantic V2 deprecation warnings from unittest.mock
# These warnings occur when Mock(spec=PydanticModel) introspects the model
warnings.filterwarnings("ignore", category=DeprecationWarning, module="unittest.mock")
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pydantic._internal._model_construction")
try:
    from pydantic.warnings import PydanticDeprecatedSince20
    warnings.filterwarnings("ignore", category=PydanticDeprecatedSince20)
except ImportError:
    pass

# Test database URL - using temporary file-based SQLite for tests
# Set this BEFORE importing app to ensure it uses the test database
import tempfile
TEST_DB_FILE = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE.name}"

# Set test environment variables BEFORE importing app
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

# Now import app and dependencies
from app.main import app
from app.core.database import Base, get_db
from app.core.security import security_manager
from app.core.cache import cache_manager
from app.auth.redis_service import init_redis_service
from app.auth.dependencies import get_current_active_user, get_current_user

# Import all models to register them with metadata
from app.auth import models as auth_models  # noqa
# Note: infrastructure.database.models has naming conflicts, skipping for now

# Import SQLModel for auth tables
from sqlmodel import SQLModel

# Create async engine for tests
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,  # Disable connection pooling for tests
    echo=False,  # Disable SQL logging for cleaner test output
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Bind SQLModel metadata to test engine
SQLModel.metadata.bind = test_engine

# Create async session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()

    # Initialize Redis service with fakeredis for tests
    async def setup_redis():
        await init_redis_service("fakeredis://localhost")

    loop.run_until_complete(setup_redis())

    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.
    Rolls back changes after each test.
    """
    # Create all tables (including SQLModel tables from auth)
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

    # Drop all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async test client with database session override.
    """
    # Override database dependency
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Reset rate limiter for tests - skip for now as it's not critical for basic tests
    # from app.core.rate_limiter import get_rate_limiter
    # rate_limiter = get_rate_limiter()
    # await rate_limiter.reset()  # Clear any existing rate limit state

    async with AsyncClient(app=app, base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def override_auth():
    """Helper fixture to override authentication in tests"""
    from contextlib import contextmanager

    @contextmanager
    def _override(user):
        """Override get_current_active_user to return the specified user"""
        app.dependency_overrides[get_current_active_user] = lambda: user
        app.dependency_overrides[get_current_user] = lambda: user
        try:
            yield
        finally:
            app.dependency_overrides.pop(get_current_active_user, None)
            app.dependency_overrides.pop(get_current_user, None)

    return _override


@pytest.fixture(scope="function")
def test_user_data() -> dict:
    """Test user data fixture."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestP@ssw0rd!2024#UniqueForTesting",  # Strong password unlikely to be in breach databases
        "full_name": "Test User"
    }


@pytest.fixture(scope="function")
def test_admin_data() -> dict:
    """Test admin user data fixture."""
    return {
        "email": "admin@example.com",
        "username": "adminuser",
        "password": "Admin123!@#",
        "full_name": "Admin User",
        "is_admin": True
    }


async def verify_test_user_email(db_session: AsyncSession, email: str):
    """Helper to verify a test user's email."""
    from app.auth.models import User
    from sqlalchemy import select
    from datetime import datetime, timezone

    result = await db_session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        user.email_verified = True
        user.email_verified_at = datetime.now(timezone.utc)
        await db_session.commit()


@pytest_asyncio.fixture(scope="function")
async def authenticated_user(client: AsyncClient, test_user_data: dict, db_session: AsyncSession) -> dict:
    """
    Create and authenticate a test user, return tokens.
    """
    # Register user
    response = await client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201

    # Manually verify email for testing (bypass verification requirement)
    await verify_test_user_email(db_session, test_user_data["email"])

    # Login with email (not username)
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200

    return response.json()


@pytest_asyncio.fixture(scope="function")
async def auth_headers(authenticated_user: dict) -> dict:
    """Create authorization headers for authenticated requests."""
    return {
        "Authorization": f"Bearer {authenticated_user['access_token']}"
    }


@pytest_asyncio.fixture(scope="function")
async def redis_client():
    """Create a test Redis client."""
    await cache_manager.connect()
    yield cache_manager
    await cache_manager.disconnect()


@pytest.fixture(scope="function")
def mock_openai_response():
    """Mock OpenAI API response."""
    return {
        "id": "chatcmpl-test123",
        "object": "chat.completion",
        "created": 1677652288,
        "model": "gpt-4",
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "This is a test response from the AI."
            },
            "finish_reason": "stop"
        }],
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 20,
            "total_tokens": 30
        }
    }


@pytest.fixture(scope="function")
def test_post_data() -> dict:
    """Test post data fixture."""
    return {
        "title": "Test Post",
        "content": "This is a test post content.",
        "tags": ["test", "pytest"],
        "is_public": True
    }


@pytest.fixture(scope="function")
def test_course_data() -> dict:
    """Test course data fixture."""
    return {
        "title": "Test Course",
        "description": "This is a test course description.",
        "category": "programming",
        "difficulty": "beginner",
        "price": 99.99,
        "is_published": True
    }


# Markers for different test types
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "e2e: End-to-end tests")
    config.addinivalue_line("markers", "slow: Slow running tests")
    config.addinivalue_line("markers", "security: Security-related tests")
    config.addinivalue_line("markers", "performance: Performance tests")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to skip experimental features."""
    skip_experimental = pytest.mark.skip(reason="Experimental feature - tests under development")

    for item in items:
        # Skip shop and tuition integration tests (experimental features)
        if "test_shop_endpoints" in str(item.fspath) or "test_tuition_endpoints" in str(item.fspath):
            item.add_marker(skip_experimental)
