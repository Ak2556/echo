"""
User repository interface defining data access contracts.
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from ..entities.user import User, UserStatus, UserRole


class UserRepository(ABC):
    """
    Abstract user repository interface.
    
    This interface defines the contract for user data access operations.
    Implementations should handle the specific data storage technology.
    """
    
    @abstractmethod
    async def create(self, user: User) -> User:
        """
        Create a new user.
        
        Args:
            user: User entity to create
            
        Returns:
            Created user with generated ID
            
        Raises:
            UserAlreadyExistsError: If user with email/username already exists
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User entity or None if not found
        """
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.
        
        Args:
            email: Email address
            
        Returns:
            User entity or None if not found
        """
        pass
    
    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.
        
        Args:
            username: Username
            
        Returns:
            User entity or None if not found
        """
        pass
    
    @abstractmethod
    async def update(self, user: User) -> User:
        """
        Update existing user.
        
        Args:
            user: User entity with updates
            
        Returns:
            Updated user entity
            
        Raises:
            UserNotFoundError: If user doesn't exist
        """
        pass
    
    @abstractmethod
    async def delete(self, user_id: str) -> bool:
        """
        Delete user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            True if user was deleted, False if not found
        """
        pass
    
    @abstractmethod
    async def list_users(self, 
                         offset: int = 0, 
                         limit: int = 100,
                         status: Optional[UserStatus] = None,
                         role: Optional[UserRole] = None,
                         search: Optional[str] = None) -> List[User]:
        """
        List users with filtering and pagination.
        
        Args:
            offset: Number of users to skip
            limit: Maximum number of users to return
            status: Filter by user status
            role: Filter by user role
            search: Search term for username/email/display_name
            
        Returns:
            List of user entities
        """
        pass
    
    @abstractmethod
    async def count_users(self, 
                          status: Optional[UserStatus] = None,
                          role: Optional[UserRole] = None,
                          search: Optional[str] = None) -> int:
        """
        Count users with filtering.
        
        Args:
            status: Filter by user status
            role: Filter by user role
            search: Search term for username/email/display_name
            
        Returns:
            Total number of users matching criteria
        """
        pass
    
    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        """
        Check if user exists by email.
        
        Args:
            email: Email address
            
        Returns:
            True if user exists, False otherwise
        """
        pass
    
    @abstractmethod
    async def exists_by_username(self, username: str) -> bool:
        """
        Check if user exists by username.
        
        Args:
            username: Username
            
        Returns:
            True if user exists, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_users_by_ids(self, user_ids: List[str]) -> List[User]:
        """
        Get multiple users by their IDs.
        
        Args:
            user_ids: List of user IDs
            
        Returns:
            List of user entities (may be fewer than requested if some don't exist)
        """
        pass
    
    @abstractmethod
    async def search_users(self, 
                           query: str, 
                           limit: int = 20,
                           exclude_user_id: Optional[str] = None) -> List[User]:
        """
        Search users by username, display name, or email.
        
        Args:
            query: Search query
            limit: Maximum number of results
            exclude_user_id: User ID to exclude from results
            
        Returns:
            List of matching user entities
        """
        pass
    
    @abstractmethod
    async def get_followers(self, user_id: str, offset: int = 0, limit: int = 100) -> List[User]:
        """
        Get users following the specified user.
        
        Args:
            user_id: User ID
            offset: Number of followers to skip
            limit: Maximum number of followers to return
            
        Returns:
            List of follower user entities
        """
        pass
    
    @abstractmethod
    async def get_following(self, user_id: str, offset: int = 0, limit: int = 100) -> List[User]:
        """
        Get users that the specified user is following.
        
        Args:
            user_id: User ID
            offset: Number of following to skip
            limit: Maximum number of following to return
            
        Returns:
            List of user entities being followed
        """
        pass
    
    @abstractmethod
    async def is_following(self, follower_id: str, following_id: str) -> bool:
        """
        Check if one user is following another.
        
        Args:
            follower_id: ID of potential follower
            following_id: ID of potential user being followed
            
        Returns:
            True if follower_id is following following_id, False otherwise
        """
        pass
    
    @abstractmethod
    async def follow_user(self, follower_id: str, following_id: str) -> bool:
        """
        Create a follow relationship.
        
        Args:
            follower_id: ID of user doing the following
            following_id: ID of user being followed
            
        Returns:
            True if relationship was created, False if already exists
        """
        pass
    
    @abstractmethod
    async def unfollow_user(self, follower_id: str, following_id: str) -> bool:
        """
        Remove a follow relationship.
        
        Args:
            follower_id: ID of user doing the unfollowing
            following_id: ID of user being unfollowed
            
        Returns:
            True if relationship was removed, False if didn't exist
        """
        pass
    
    @abstractmethod
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive user statistics.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with user statistics
        """
        pass
    
    @abstractmethod
    async def update_last_activity(self, user_id: str) -> None:
        """
        Update user's last activity timestamp.
        
        Args:
            user_id: User ID
        """
        pass
    
    @abstractmethod
    async def get_active_users(self, 
                               since_hours: int = 24,
                               limit: int = 100) -> List[User]:
        """
        Get users active within specified time period.
        
        Args:
            since_hours: Hours to look back for activity
            limit: Maximum number of users to return
            
        Returns:
            List of active user entities
        """
        pass
    
    @abstractmethod
    async def bulk_update_stats(self, user_stats: Dict[str, Dict[str, Any]]) -> None:
        """
        Bulk update user statistics.
        
        Args:
            user_stats: Dictionary mapping user_id to stats updates
        """
        pass