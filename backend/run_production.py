#!/usr/bin/env python3
"""
Production-grade Echo API startup script.
Initializes database, runs migrations, and starts the server.
"""
import asyncio
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def init_database():
    """Initialize database tables."""
    from app.config.database import init_db, engine, Base
    from app.auth import models  # Import models to register them

    print("🔧 Initializing database...")

    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Database initialized successfully")


async def main():
    """Main startup function."""
    try:
        # Initialize database
        await init_database()

        print("🚀 Starting Echo API server...")
        print("📚 API docs will be available at http://localhost:8000/docs")
        print("🔐 Auth endpoints at http://localhost:8000/api/auth")

        # Start server
        import uvicorn
        from app.config.settings import settings

        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level=settings.log_level.lower()
        )

    except Exception as e:
        print(f"❌ Startup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
