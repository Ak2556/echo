"""Fix vector compatibility

Revision ID: fix_vector_compatibility
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_vector_compatibility'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade database schema with vector compatibility."""
    # This migration is designed to work with both PostgreSQL and SQLite
    # The actual vector column type will be handled by our compatibility layer
    pass


def downgrade() -> None:
    """Downgrade database schema."""
    pass