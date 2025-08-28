"""
Post domain entity with rich business logic.
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Set
from dataclasses import dataclass, field
from enum import Enum
import uuid


class PostType(Enum):
    """Post content types."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    LINK = "link"
    POLL = "poll"
    AI_GENERATED = "ai_generated"


class PostStatus(Enum):
    """Post status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DELETED = "deleted"
    MODERATED = "moderated"


class PostVisibility(Enum):
    """Post visibility levels."""
    PUBLIC = "public"
    FOLLOWERS = "followers"
    FRIENDS = "friends"
    PRIVATE = "private"


@dataclass
class PostMetrics:
    """Post engagement metrics."""
    views: int = 0
    likes: int = 0
    dislikes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    reports: int = 0
    
    @property
    def engagement_rate(self) -> float:
        """Calculate engagement rate."""
        if self.views == 0:
            return 0.0
        
        total_engagement = self.likes + self.comments + self.shares + self.saves
        return round((total_engagement / self.views) * 100, 2)
    
    @property
    def sentiment_score(self) -> float:
        """Calculate sentiment score based on likes/dislikes."""
        total_reactions = self.likes + self.dislikes
        if total_reactions == 0:
            return 0.0
        
        return round((self.likes - self.dislikes) / total_reactions, 2)


@dataclass
class PostContent:
    """Post content with rich text support."""
    text: str = ""
    html: str = ""
    media_urls: List[str] = field(default_factory=list)
    attachments: List[Dict[str, Any]] = field(default_factory=list)
    mentions: List[str] = field(default_factory=list)  # User IDs mentioned
    hashtags: List[str] = field(default_factory=list)
    links: List[Dict[str, str]] = field(default_factory=list)  # {url, title, description}
    
    def extract_hashtags(self) -> None:
        """Extract hashtags from text content."""
        import re
        hashtag_pattern = r'#(\w+)'
        self.hashtags = list(set(re.findall(hashtag_pattern, self.text.lower())))
    
    def extract_mentions(self) -> None:
        """Extract user mentions from text content."""
        import re
        mention_pattern = r'@(\w+)'
        mentions = re.findall(mention_pattern, self.text.lower())
        # Note: In real implementation, you'd resolve usernames to user IDs
        self.mentions = list(set(mentions))
    
    def get_word_count(self) -> int:
        """Get word count of text content."""
        return len(self.text.split()) if self.text else 0
    
    def get_reading_time(self) -> int:
        """Estimate reading time in minutes (assuming 200 WPM)."""
        word_count = self.get_word_count()
        return max(1, round(word_count / 200))


@dataclass
class Post:
    """
    Post domain entity with rich business logic.
    
    This entity encapsulates all post-related business rules and behaviors.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str = ""
    title: Optional[str] = None
    content: PostContent = field(default_factory=PostContent)
    
    # Post metadata
    post_type: PostType = PostType.TEXT
    status: PostStatus = PostStatus.DRAFT
    visibility: PostVisibility = PostVisibility.PUBLIC
    
    # Categorization
    tags: List[str] = field(default_factory=list)
    category: Optional[str] = None
    language: str = "en"
    
    # Timestamps
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    
    # Engagement
    metrics: PostMetrics = field(default_factory=PostMetrics)
    liked_by: Set[str] = field(default_factory=set)  # User IDs who liked
    disliked_by: Set[str] = field(default_factory=set)  # User IDs who disliked
    saved_by: Set[str] = field(default_factory=set)  # User IDs who saved
    
    # Moderation
    is_pinned: bool = False
    is_featured: bool = False
    is_nsfw: bool = False
    content_warnings: List[str] = field(default_factory=list)
    
    # AI-related
    ai_generated: bool = False
    ai_model_used: Optional[str] = None
    ai_prompt: Optional[str] = None
    
    # Additional metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Post-initialization processing."""
        if self.content.text:
            self.content.extract_hashtags()
            self.content.extract_mentions()
    
    @property
    def is_published(self) -> bool:
        """Check if post is published."""
        return self.status == PostStatus.PUBLISHED
    
    @property
    def is_scheduled(self) -> bool:
        """Check if post is scheduled for future publication."""
        return (
            self.scheduled_at is not None and
            self.scheduled_at > datetime.now(timezone.utc) and
            self.status == PostStatus.DRAFT
        )
    
    @property
    def can_be_edited(self) -> bool:
        """Check if post can be edited."""
        return self.status in [PostStatus.DRAFT, PostStatus.PUBLISHED]
    
    @property
    def engagement_score(self) -> float:
        """Calculate overall engagement score."""
        if self.metrics.views == 0:
            return 0.0
        
        # Weighted engagement score
        score = (
            self.metrics.likes * 2 +
            self.metrics.comments * 3 +
            self.metrics.shares * 4 +
            self.metrics.saves * 5 -
            self.metrics.dislikes * 1 -
            self.metrics.reports * 10
        ) / max(self.metrics.views, 1)
        
        return round(max(0, score), 2)
    
    def publish(self) -> None:
        """Publish the post."""
        if self.status != PostStatus.DRAFT:
            raise ValueError("Only draft posts can be published")

        self.status = PostStatus.PUBLISHED
        self.published_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
    
    def schedule(self, scheduled_time: datetime) -> None:
        """Schedule post for future publication."""
        if scheduled_time <= datetime.now(timezone.utc):
            raise ValueError("Scheduled time must be in the future")

        self.scheduled_at = scheduled_time
        self.updated_at = datetime.now(timezone.utc)
    
    def archive(self) -> None:
        """Archive the post."""
        if self.status == PostStatus.DELETED:
            raise ValueError("Cannot archive deleted post")

        self.status = PostStatus.ARCHIVED
        self.updated_at = datetime.now(timezone.utc)
    
    def delete(self) -> None:
        """Soft delete the post."""
        self.status = PostStatus.DELETED
        self.updated_at = datetime.now(timezone.utc)
    
    def like(self, user_id: str) -> bool:
        """
        Like the post.
        
        Args:
            user_id: ID of user liking the post
            
        Returns:
            True if like was added, False if already liked
        """
        if user_id in self.liked_by:
            return False
        
        # Remove dislike if exists
        self.disliked_by.discard(user_id)
        
        self.liked_by.add(user_id)
        self.metrics.likes = len(self.liked_by)
        self.metrics.dislikes = len(self.disliked_by)
        self.updated_at = datetime.now(timezone.utc)

        return True
    
    def unlike(self, user_id: str) -> bool:
        """
        Remove like from the post.
        
        Args:
            user_id: ID of user removing like
            
        Returns:
            True if like was removed, False if not liked
        """
        if user_id not in self.liked_by:
            return False
        
        self.liked_by.remove(user_id)
        self.metrics.likes = len(self.liked_by)
        self.updated_at = datetime.now(timezone.utc)

        return True
    
    def dislike(self, user_id: str) -> bool:
        """
        Dislike the post.
        
        Args:
            user_id: ID of user disliking the post
            
        Returns:
            True if dislike was added, False if already disliked
        """
        if user_id in self.disliked_by:
            return False
        
        # Remove like if exists
        self.liked_by.discard(user_id)
        
        self.disliked_by.add(user_id)
        self.metrics.likes = len(self.liked_by)
        self.metrics.dislikes = len(self.disliked_by)
        self.updated_at = datetime.now(timezone.utc)

        return True
    
    def save(self, user_id: str) -> bool:
        """
        Save the post.
        
        Args:
            user_id: ID of user saving the post
            
        Returns:
            True if post was saved, False if already saved
        """
        if user_id in self.saved_by:
            return False
        
        self.saved_by.add(user_id)
        self.metrics.saves = len(self.saved_by)
        self.updated_at = datetime.now(timezone.utc)

        return True
    
    def unsave(self, user_id: str) -> bool:
        """
        Remove save from the post.
        
        Args:
            user_id: ID of user removing save
            
        Returns:
            True if save was removed, False if not saved
        """
        if user_id not in self.saved_by:
            return False
        
        self.saved_by.remove(user_id)
        self.metrics.saves = len(self.saved_by)
        self.updated_at = datetime.now(timezone.utc)

        return True
    
    def increment_views(self, count: int = 1) -> None:
        """Increment view count."""
        self.metrics.views += count
    
    def increment_comments(self, count: int = 1) -> None:
        """Increment comment count."""
        self.metrics.comments += count
    
    def increment_shares(self, count: int = 1) -> None:
        """Increment share count."""
        self.metrics.shares += count
    
    def report(self, reason: str, reporter_id: str) -> None:
        """
        Report the post.
        
        Args:
            reason: Reason for reporting
            reporter_id: ID of user reporting
        """
        self.metrics.reports += 1
        
        # Store report details in metadata
        if "reports" not in self.metadata:
            self.metadata["reports"] = []
        
        self.metadata["reports"].append({
            "reason": reason,
            "reporter_id": reporter_id,
            "reported_at": datetime.now(timezone.utc).isoformat()
        })

        self.updated_at = datetime.now(timezone.utc)
    
    def pin(self) -> None:
        """Pin the post."""
        self.is_pinned = True
        self.updated_at = datetime.now(timezone.utc)
    
    def unpin(self) -> None:
        """Unpin the post."""
        self.is_pinned = False
        self.updated_at = datetime.now(timezone.utc)
    
    def feature(self) -> None:
        """Feature the post."""
        self.is_featured = True
        self.updated_at = datetime.now(timezone.utc)
    
    def unfeature(self) -> None:
        """Remove feature status."""
        self.is_featured = False
        self.updated_at = datetime.now(timezone.utc)
    
    def add_content_warning(self, warning: str) -> None:
        """Add content warning."""
        if warning not in self.content_warnings:
            self.content_warnings.append(warning)
            self.updated_at = datetime.now(timezone.utc)
    
    def remove_content_warning(self, warning: str) -> bool:
        """
        Remove content warning.
        
        Args:
            warning: Warning to remove
            
        Returns:
            True if warning was removed, False if not found
        """
        if warning in self.content_warnings:
            self.content_warnings.remove(warning)
            self.updated_at = datetime.now(timezone.utc)
            return True
        return False
    
    def update_content(self, new_content: PostContent) -> None:
        """
        Update post content.
        
        Args:
            new_content: New content for the post
        """
        if not self.can_be_edited:
            raise ValueError("Post cannot be edited in current status")
        
        self.content = new_content
        self.content.extract_hashtags()
        self.content.extract_mentions()
        self.updated_at = datetime.now(timezone.utc)
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """
        Convert post to dictionary.
        
        Args:
            include_sensitive: Whether to include sensitive data
            
        Returns:
            Dictionary representation of post
        """
        data = {
            "id": self.id,
            "author_id": self.author_id,
            "title": self.title,
            "content": {
                "text": self.content.text,
                "html": self.content.html,
                "media_urls": self.content.media_urls,
                "attachments": self.content.attachments,
                "mentions": self.content.mentions,
                "hashtags": self.content.hashtags,
                "links": self.content.links,
                "word_count": self.content.get_word_count(),
                "reading_time": self.content.get_reading_time()
            },
            "post_type": self.post_type.value,
            "status": self.status.value,
            "visibility": self.visibility.value,
            "tags": self.tags,
            "category": self.category,
            "language": self.language,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "metrics": {
                "views": self.metrics.views,
                "likes": self.metrics.likes,
                "dislikes": self.metrics.dislikes,
                "comments": self.metrics.comments,
                "shares": self.metrics.shares,
                "saves": self.metrics.saves,
                "reports": self.metrics.reports,
                "engagement_rate": self.metrics.engagement_rate,
                "sentiment_score": self.metrics.sentiment_score
            },
            "is_pinned": self.is_pinned,
            "is_featured": self.is_featured,
            "is_nsfw": self.is_nsfw,
            "content_warnings": self.content_warnings,
            "ai_generated": self.ai_generated,
            "ai_model_used": self.ai_model_used,
            "engagement_score": self.engagement_score
        }
        
        if include_sensitive:
            data.update({
                "liked_by": list(self.liked_by),
                "disliked_by": list(self.disliked_by),
                "saved_by": list(self.saved_by),
                "ai_prompt": self.ai_prompt,
                "metadata": self.metadata
            })
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Post':
        """
        Create post from dictionary.
        
        Args:
            data: Dictionary with post data
            
        Returns:
            Post instance
        """
        # Handle datetime fields
        datetime_fields = ["created_at", "updated_at", "published_at", "scheduled_at"]
        for field in datetime_fields:
            if field in data and data[field]:
                if isinstance(data[field], str):
                    data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        # Handle enum fields
        if "post_type" in data:
            data["post_type"] = PostType(data["post_type"])
        if "status" in data:
            data["status"] = PostStatus(data["status"])
        if "visibility" in data:
            data["visibility"] = PostVisibility(data["visibility"])
        
        # Handle nested objects
        if "content" in data:
            content_data = data["content"]
            data["content"] = PostContent(**{k: v for k, v in content_data.items() if hasattr(PostContent, k)})
        
        if "metrics" in data:
            metrics_data = data["metrics"]
            data["metrics"] = PostMetrics(**{k: v for k, v in metrics_data.items() if hasattr(PostMetrics, k)})
        
        # Handle sets
        if "liked_by" in data:
            data["liked_by"] = set(data["liked_by"])
        if "disliked_by" in data:
            data["disliked_by"] = set(data["disliked_by"])
        if "saved_by" in data:
            data["saved_by"] = set(data["saved_by"])
        
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})