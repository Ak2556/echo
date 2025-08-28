"""
SQLAlchemy database models with optimized indexing and relationships.
"""
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, 
    ForeignKey, Table, Index, JSON, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from enum import Enum

from ...config.database import Base
from ...domain.entities.user import UserStatus, UserRole
from ...domain.entities.post import PostType, PostStatus, PostVisibility


# Association tables for many-to-many relationships
user_followers = Table(
    'user_followers',
    Base.metadata,
    Column('follower_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('following_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_user_followers_follower', 'follower_id'),
    Index('idx_user_followers_following', 'following_id'),
    UniqueConstraint('follower_id', 'following_id', name='uq_user_followers')
)

post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('post_id', UUID(as_uuid=True), ForeignKey('posts.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_post_likes_user', 'user_id'),
    Index('idx_post_likes_post', 'post_id'),
    UniqueConstraint('user_id', 'post_id', name='uq_post_likes')
)

post_dislikes = Table(
    'post_dislikes',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('post_id', UUID(as_uuid=True), ForeignKey('posts.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_post_dislikes_user', 'user_id'),
    Index('idx_post_dislikes_post', 'post_id'),
    UniqueConstraint('user_id', 'post_id', name='uq_post_dislikes')
)

post_saves = Table(
    'post_saves',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('post_id', UUID(as_uuid=True), ForeignKey('posts.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    Index('idx_post_saves_user', 'user_id'),
    Index('idx_post_saves_post', 'post_id'),
    UniqueConstraint('user_id', 'post_id', name='uq_post_saves')
)


class UserModel(Base):
    """User database model with optimized indexing."""
    
    __tablename__ = 'users'
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Profile fields
    avatar_url = Column(String(500))
    bio = Column(Text)
    website = Column(String(255))
    location = Column(String(100))
    
    # Account management
    status = Column(SQLEnum(UserStatus), nullable=False, default=UserStatus.PENDING_VERIFICATION, index=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.USER, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    phone_verified = Column(Boolean, default=False, nullable=False)
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), index=True)
    last_password_change = Column(DateTime(timezone=True))
    last_active = Column(DateTime(timezone=True), index=True)
    
    # User preferences (stored as JSON)
    preferences = Column(JSON, default={})
    
    # Statistics
    posts_count = Column(Integer, default=0, nullable=False)
    likes_given = Column(Integer, default=0, nullable=False)
    likes_received = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    followers_count = Column(Integer, default=0, nullable=False, index=True)
    following_count = Column(Integer, default=0, nullable=False)
    ai_interactions = Column(Integer, default=0, nullable=False)
    
    # Security
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True))
    api_keys = Column(ARRAY(String), default=[])
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Relationships
    posts = relationship("PostModel", back_populates="author", lazy="dynamic")
    comments = relationship("CommentModel", back_populates="author", lazy="dynamic")
    
    # Following relationships
    following = relationship(
        "UserModel",
        secondary=user_followers,
        primaryjoin=id == user_followers.c.follower_id,
        secondaryjoin=id == user_followers.c.following_id,
        back_populates="followers",
        lazy="dynamic"
    )
    
    followers = relationship(
        "UserModel",
        secondary=user_followers,
        primaryjoin=id == user_followers.c.following_id,
        secondaryjoin=id == user_followers.c.follower_id,
        back_populates="following",
        lazy="dynamic"
    )
    
    # Post interactions
    liked_posts = relationship(
        "PostModel",
        secondary=post_likes,
        back_populates="liked_by_users",
        lazy="dynamic"
    )
    
    disliked_posts = relationship(
        "PostModel",
        secondary=post_dislikes,
        back_populates="disliked_by_users",
        lazy="dynamic"
    )
    
    saved_posts = relationship(
        "PostModel",
        secondary=post_saves,
        back_populates="saved_by_users",
        lazy="dynamic"
    )
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_users_email_verified', 'email_verified'),
        Index('idx_users_status_role', 'status', 'role'),
        Index('idx_users_created_at_desc', 'created_at', postgresql_using='btree'),
        Index('idx_users_last_active_desc', 'last_active', postgresql_using='btree'),
        Index('idx_users_followers_count_desc', 'followers_count', postgresql_using='btree'),
        Index('idx_users_search', 'username', 'display_name', 'email', postgresql_using='gin'),
    )


class PostModel(Base):
    """Post database model with optimized indexing."""
    
    __tablename__ = 'posts'
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String(255))
    
    # Content fields
    content_text = Column(Text)
    content_html = Column(Text)
    media_urls = Column(ARRAY(String), default=[])
    attachments = Column(JSON, default=[])
    mentions = Column(ARRAY(String), default=[])  # User IDs
    hashtags = Column(ARRAY(String), default=[], index=True)
    links = Column(JSON, default=[])
    
    # Post metadata
    post_type = Column(SQLEnum(PostType), nullable=False, default=PostType.TEXT, index=True)
    status = Column(SQLEnum(PostStatus), nullable=False, default=PostStatus.DRAFT, index=True)
    visibility = Column(SQLEnum(PostVisibility), nullable=False, default=PostVisibility.PUBLIC, index=True)
    
    # Categorization
    tags = Column(ARRAY(String), default=[], index=True)
    category = Column(String(50), index=True)
    language = Column(String(10), default='en', index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), index=True)
    scheduled_at = Column(DateTime(timezone=True), index=True)
    
    # Engagement metrics
    views = Column(Integer, default=0, nullable=False, index=True)
    likes = Column(Integer, default=0, nullable=False, index=True)
    dislikes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False, index=True)
    shares = Column(Integer, default=0, nullable=False)
    saves = Column(Integer, default=0, nullable=False)
    reports = Column(Integer, default=0, nullable=False)
    
    # Moderation
    is_pinned = Column(Boolean, default=False, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    is_nsfw = Column(Boolean, default=False, nullable=False)
    content_warnings = Column(ARRAY(String), default=[])
    
    # AI-related
    ai_generated = Column(Boolean, default=False, nullable=False, index=True)
    ai_model_used = Column(String(100))
    ai_prompt = Column(Text)
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Calculated fields (updated by triggers or background jobs)
    engagement_score = Column(Float, default=0.0, index=True)
    trending_score = Column(Float, default=0.0, index=True)
    
    # Relationships
    author = relationship("UserModel", back_populates="posts")
    comments_rel = relationship("CommentModel", back_populates="post", lazy="dynamic")
    
    # User interactions
    liked_by_users = relationship(
        "UserModel",
        secondary=post_likes,
        back_populates="liked_posts",
        lazy="dynamic"
    )
    
    disliked_by_users = relationship(
        "UserModel",
        secondary=post_dislikes,
        back_populates="disliked_posts",
        lazy="dynamic"
    )
    
    saved_by_users = relationship(
        "UserModel",
        secondary=post_saves,
        back_populates="saved_posts",
        lazy="dynamic"
    )
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_posts_author_status', 'author_id', 'status'),
        Index('idx_posts_status_visibility', 'status', 'visibility'),
        Index('idx_posts_published_at_desc', 'published_at', postgresql_using='btree'),
        Index('idx_posts_engagement_score_desc', 'engagement_score', postgresql_using='btree'),
        Index('idx_posts_trending_score_desc', 'trending_score', postgresql_using='btree'),
        Index('idx_posts_hashtags_gin', 'hashtags', postgresql_using='gin'),
        Index('idx_posts_tags_gin', 'tags', postgresql_using='gin'),
        Index('idx_posts_mentions_gin', 'mentions', postgresql_using='gin'),
        Index('idx_posts_content_search', 'title', 'content_text', postgresql_using='gin'),
        Index('idx_posts_scheduled', 'scheduled_at', 'status'),
        Index('idx_posts_featured_pinned', 'is_featured', 'is_pinned'),
    )


class CommentModel(Base):
    """Comment database model."""
    
    __tablename__ = 'comments'
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey('posts.id'), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('comments.id'), index=True)  # For nested comments
    
    # Content
    content = Column(Text, nullable=False)
    mentions = Column(ARRAY(String), default=[])  # User IDs mentioned
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Engagement
    likes = Column(Integer, default=0, nullable=False)
    dislikes = Column(Integer, default=0, nullable=False)
    reports = Column(Integer, default=0, nullable=False)
    
    # Moderation
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    
    # Additional metadata
    metadata = Column(JSON, default={})
    
    # Relationships
    post = relationship("PostModel", back_populates="comments_rel")
    author = relationship("UserModel", back_populates="comments")
    parent = relationship("CommentModel", remote_side=[id], backref="replies")
    
    # Indexes
    __table_args__ = (
        Index('idx_comments_post_created', 'post_id', 'created_at'),
        Index('idx_comments_author_created', 'author_id', 'created_at'),
        Index('idx_comments_parent_created', 'parent_id', 'created_at'),
        Index('idx_comments_likes_desc', 'likes', postgresql_using='btree'),
    )


class APIKeyModel(Base):
    """API key database model."""
    
    __tablename__ = 'api_keys'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    permissions = Column(ARRAY(String), default=[])
    
    # Usage tracking
    last_used = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0, nullable=False)
    rate_limit = Column(Integer, default=1000)  # Requests per hour
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Metadata
    metadata = Column(JSON, default={})
    
    # Indexes
    __table_args__ = (
        Index('idx_api_keys_user_active', 'user_id', 'is_active'),
        Index('idx_api_keys_expires_at', 'expires_at'),
    )


class SessionModel(Base):
    """User session database model."""
    
    __tablename__ = 'sessions'
    
    id = Column(String(255), primary_key=True)  # Session token
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    # Session data
    data = Column(JSON, default={})
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Indexes
    __table_args__ = (
        Index('idx_sessions_user_active', 'user_id', 'is_active'),
        Index('idx_sessions_expires_at', 'expires_at'),
        Index('idx_sessions_last_accessed', 'last_accessed'),
    )


class AuditLogModel(Base):
    """Audit log for tracking important actions."""
    
    __tablename__ = 'audit_logs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    
    # Action details
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False, index=True)
    resource_id = Column(String(255), index=True)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    details = Column(JSON, default={})
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_logs_user_action', 'user_id', 'action'),
        Index('idx_audit_logs_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_logs_created_at_desc', 'created_at', postgresql_using='btree'),
    )