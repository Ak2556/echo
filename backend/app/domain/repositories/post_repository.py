"""
Post repository interface defining data access contracts.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..entities.post import Post, PostStatus, PostType, PostVisibility


class PostRepository(ABC):
    """
    Abstract post repository interface.

    This interface defines the contract for post data access operations.
    Implementations should handle the specific data storage technology.
    """

    @abstractmethod
    async def create(self, post: Post) -> Post:
        """
        Create a new post.

        Args:
            post: Post entity to create

        Returns:
            Created post with generated ID
        """
        pass

    @abstractmethod
    async def get_by_id(self, post_id: str) -> Optional[Post]:
        """
        Get post by ID.

        Args:
            post_id: Post ID

        Returns:
            Post entity or None if not found
        """
        pass

    @abstractmethod
    async def update(self, post: Post) -> Post:
        """
        Update existing post.

        Args:
            post: Post entity with updates

        Returns:
            Updated post entity

        Raises:
            PostNotFoundError: If post doesn't exist
        """
        pass

    @abstractmethod
    async def delete(self, post_id: str) -> bool:
        """
        Delete post by ID.

        Args:
            post_id: Post ID

        Returns:
            True if post was deleted, False if not found
        """
        pass

    @abstractmethod
    async def list_posts(
        self,
        offset: int = 0,
        limit: int = 20,
        author_id: Optional[str] = None,
        status: Optional[PostStatus] = None,
        post_type: Optional[PostType] = None,
        visibility: Optional[PostVisibility] = None,
        tags: Optional[List[str]] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> List[Post]:
        """
        List posts with filtering, searching, and pagination.

        Args:
            offset: Number of posts to skip
            limit: Maximum number of posts to return
            author_id: Filter by author ID
            status: Filter by post status
            post_type: Filter by post type
            visibility: Filter by visibility level
            tags: Filter by tags (posts must have all specified tags)
            category: Filter by category
            search: Search term for title/content
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)

        Returns:
            List of post entities
        """
        pass

    @abstractmethod
    async def count_posts(
        self,
        author_id: Optional[str] = None,
        status: Optional[PostStatus] = None,
        post_type: Optional[PostType] = None,
        visibility: Optional[PostVisibility] = None,
        tags: Optional[List[str]] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> int:
        """
        Count posts with filtering.

        Args:
            author_id: Filter by author ID
            status: Filter by post status
            post_type: Filter by post type
            visibility: Filter by visibility level
            tags: Filter by tags
            category: Filter by category
            search: Search term for title/content

        Returns:
            Total number of posts matching criteria
        """
        pass

    @abstractmethod
    async def get_posts_by_ids(self, post_ids: List[str]) -> List[Post]:
        """
        Get multiple posts by their IDs.

        Args:
            post_ids: List of post IDs

        Returns:
            List of post entities (may be fewer than requested if some don't exist)
        """
        pass

    @abstractmethod
    async def get_user_feed(
        self,
        user_id: str,
        following_ids: List[str],
        offset: int = 0,
        limit: int = 20,
        include_own_posts: bool = True,
    ) -> List[Post]:
        """
        Get personalized feed for user.

        Args:
            user_id: User ID requesting the feed
            following_ids: List of user IDs that the user follows
            offset: Number of posts to skip
            limit: Maximum number of posts to return
            include_own_posts: Whether to include user's own posts

        Returns:
            List of post entities for the feed
        """
        pass

    @abstractmethod
    async def get_trending_posts(
        self, time_window_hours: int = 24, limit: int = 20, min_engagement: int = 5
    ) -> List[Post]:
        """
        Get trending posts based on engagement.

        Args:
            time_window_hours: Time window to consider for trending
            limit: Maximum number of posts to return
            min_engagement: Minimum engagement score required

        Returns:
            List of trending post entities
        """
        pass

    @abstractmethod
    async def get_featured_posts(self, limit: int = 10) -> List[Post]:
        """
        Get featured posts.

        Args:
            limit: Maximum number of posts to return

        Returns:
            List of featured post entities
        """
        pass

    @abstractmethod
    async def get_posts_by_hashtag(
        self, hashtag: str, offset: int = 0, limit: int = 20
    ) -> List[Post]:
        """
        Get posts containing a specific hashtag.

        Args:
            hashtag: Hashtag to search for (without #)
            offset: Number of posts to skip
            limit: Maximum number of posts to return

        Returns:
            List of post entities containing the hashtag
        """
        pass

    @abstractmethod
    async def get_posts_mentioning_user(
        self, user_id: str, offset: int = 0, limit: int = 20
    ) -> List[Post]:
        """
        Get posts that mention a specific user.

        Args:
            user_id: User ID being mentioned
            offset: Number of posts to skip
            limit: Maximum number of posts to return

        Returns:
            List of post entities mentioning the user
        """
        pass

    @abstractmethod
    async def search_posts(
        self,
        query: str,
        offset: int = 0,
        limit: int = 20,
        post_type: Optional[PostType] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Post]:
        """
        Full-text search posts.

        Args:
            query: Search query
            offset: Number of posts to skip
            limit: Maximum number of posts to return
            post_type: Filter by post type
            date_from: Filter posts from this date
            date_to: Filter posts until this date

        Returns:
            List of matching post entities
        """
        pass

    @abstractmethod
    async def get_scheduled_posts(self, before: datetime) -> List[Post]:
        """
        Get posts scheduled to be published before specified time.

        Args:
            before: Get posts scheduled before this time

        Returns:
            List of scheduled post entities
        """
        pass

    @abstractmethod
    async def increment_view_count(self, post_id: str, count: int = 1) -> None:
        """
        Increment post view count.

        Args:
            post_id: Post ID
            count: Number of views to add
        """
        pass

    @abstractmethod
    async def update_engagement_metrics(self, post_id: str, metrics: Dict[str, int]) -> None:
        """
        Update post engagement metrics.

        Args:
            post_id: Post ID
            metrics: Dictionary of metric updates
        """
        pass

    @abstractmethod
    async def get_post_analytics(self, post_id: str, time_range: int = 30) -> Dict[str, Any]:
        """
        Get detailed analytics for a post.

        Args:
            post_id: Post ID
            time_range: Number of days to analyze

        Returns:
            Dictionary with post analytics
        """
        pass

    @abstractmethod
    async def get_user_post_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get post statistics for a user.

        Args:
            user_id: User ID

        Returns:
            Dictionary with user's post statistics
        """
        pass

    @abstractmethod
    async def bulk_update_posts(self, updates: List[Dict[str, Any]]) -> None:
        """
        Bulk update multiple posts.

        Args:
            updates: List of update dictionaries with post_id and fields to update
        """
        pass

    @abstractmethod
    async def get_popular_hashtags(
        self, limit: int = 20, time_window_hours: int = 24
    ) -> List[Dict[str, Any]]:
        """
        Get popular hashtags within time window.

        Args:
            limit: Maximum number of hashtags to return
            time_window_hours: Time window to consider

        Returns:
            List of dictionaries with hashtag and usage count
        """
        pass

    @abstractmethod
    async def get_related_posts(self, post_id: str, limit: int = 5) -> List[Post]:
        """
        Get posts related to the specified post.

        Args:
            post_id: Post ID to find related posts for
            limit: Maximum number of related posts to return

        Returns:
            List of related post entities
        """
        pass

    @abstractmethod
    async def archive_old_posts(self, older_than_days: int, batch_size: int = 100) -> int:
        """
        Archive posts older than specified days.

        Args:
            older_than_days: Archive posts older than this many days
            batch_size: Number of posts to process in each batch

        Returns:
            Number of posts archived
        """
        pass
