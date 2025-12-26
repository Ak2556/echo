'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// User data types
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  verified: boolean;
  createdAt: Date;
  stats: {
    followers: number;
    following: number;
    posts: number;
    likes: number;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

export interface Notification {
  id: string;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'mention'
    | 'repost'
    | 'message'
    | 'system';
  from: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  relatedId?: string; // post id, comment id, etc.
  timestamp: Date;
  read: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  media?: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  }>;
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    views: number;
  };
  userInteractions: {
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
  };
  timestamp: Date;
  language: string;
  location?: string;
  hashtags: string[];
  mentions: string[];
}

interface UserContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Social actions
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  muteUser: (userId: string) => Promise<boolean>;
  unmuteUser: (userId: string) => Promise<boolean>;
  reportUser: (userId: string, reason: string) => Promise<boolean>;

  // Content actions
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
  repostPost: (postId: string) => Promise<boolean>;
  unrepostPost: (postId: string) => Promise<boolean>;
  bookmarkPost: (postId: string) => Promise<boolean>;
  unbookmarkPost: (postId: string) => Promise<boolean>;
  pinPost: (postId: string) => Promise<boolean>;
  unpinPost: (postId: string) => Promise<boolean>;
  reportPost: (postId: string, reason: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;

  // User lists
  following: Set<string>;
  followers: Set<string>;
  blocked: Set<string>;
  muted: Set<string>;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // User data
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;

  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for demo
const mockUser: User = {
  id: 'user_001',
  username: 'demo_user',
  displayName: 'Demo User',
  email: 'demo@echo.app',
  avatar:
    'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser&backgroundColor=b6e3f4',
  bio: 'Tech enthusiast | Content creator | Building awesome things 🚀',
  location: 'Mumbai, India',
  website: 'https://echo.app',
  verified: true,
  createdAt: new Date('2024-01-15'),
  stats: {
    followers: 12453,
    following: 543,
    posts: 1234,
    likes: 45678,
  },
  preferences: {
    language: 'en',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  },
};

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'follow',
    from: {
      id: 'user_002',
      username: 'priya_sharma',
      displayName: 'Priya Sharma',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=c0aede',
      verified: true,
    },
    content: 'started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: 'notif_002',
    type: 'like',
    from: {
      id: 'user_003',
      username: 'arjun_tech',
      displayName: 'Arjun Kumar',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=ffd5dc',
      verified: false,
    },
    content: 'liked your post',
    relatedId: 'post_123',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: 'notif_003',
    type: 'comment',
    from: {
      id: 'user_004',
      username: 'ravi_dev',
      displayName: 'Ravi Singh',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi&backgroundColor=ffe6d5',
      verified: false,
    },
    content: 'commented on your post: "Great content! 🔥"',
    relatedId: 'post_456',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: true,
  },
  {
    id: 'notif_004',
    type: 'mention',
    from: {
      id: 'user_005',
      username: 'anjali_writes',
      displayName: 'Anjali Reddy',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali&backgroundColor=d1f5d3',
      verified: true,
    },
    content: 'mentioned you in a post',
    relatedId: 'post_789',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: 'notif_005',
    type: 'repost',
    from: {
      id: 'user_006',
      username: 'techguru',
      displayName: 'Tech Guru',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech&backgroundColor=e6f3ff',
      verified: true,
    },
    content: 'reposted your post',
    relatedId: 'post_321',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
  },
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(
    new Set(['user_002', 'user_003', 'user_005'])
  );
  const [followers, setFollowers] = useState<Set<string>>(
    new Set(['user_002', 'user_004', 'user_006'])
  );
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  // Cleanup localStorage on mount
  useEffect(() => {
    try {
      // Check and clean up large items
      const checkAndCleanItem = (
        key: string,
        maxSize: number = 1024 * 1024
      ) => {
        const item = localStorage.getItem(key);
        if (item && item.length > maxSize) {
          console.warn(
            `Removing oversized localStorage item: ${key} (${(item.length / 1024).toFixed(2)}KB)`
          );
          localStorage.removeItem(key);
        }
      };

      checkAndCleanItem('echo-user', 100 * 1024); // 100KB max for user
      checkAndCleanItem('echo-notifications', 500 * 1024); // 500KB max for notifications
      checkAndCleanItem('echo-following', 50 * 1024); // 50KB max
      checkAndCleanItem('echo-blocked', 50 * 1024); // 50KB max
      checkAndCleanItem('echo-muted', 50 * 1024); // 50KB max
    } catch (error) {
      console.error('Error during localStorage cleanup:', error);
    }
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('echo-user');
    const savedFollowing = localStorage.getItem('echo-following');
    const savedBlocked = localStorage.getItem('echo-blocked');
    const savedMuted = localStorage.getItem('echo-muted');
    const savedNotifications = localStorage.getItem('echo-notifications');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {}
    }

    if (savedFollowing) {
      try {
        setFollowing(new Set(JSON.parse(savedFollowing)));
      } catch (error) {}
    }

    if (savedBlocked) {
      try {
        setBlocked(new Set(JSON.parse(savedBlocked)));
      } catch (error) {}
    }

    if (savedMuted) {
      try {
        setMuted(new Set(JSON.parse(savedMuted)));
      } catch (error) {}
    }

    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      } catch (error) {}
    }
  }, []);

  // Helper function to safely store data in localStorage
  const safeLocalStorageSet = (key: string, value: any) => {
    try {
      const stringValue = JSON.stringify(value);
      // Check if value is too large (> 2MB to leave room for other data)
      if (stringValue.length > 2 * 1024 * 1024) {
        console.warn(`localStorage: ${key} exceeds 2MB, skipping save`);
        return false;
      }
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn(
          `localStorage quota exceeded for ${key}, attempting cleanup`
        );
        // Try to clear some space by removing old notifications
        try {
          localStorage.removeItem('echo-notifications');
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error(
            'Failed to save to localStorage even after cleanup:',
            retryError
          );
          return false;
        }
      }
      console.error(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (user) {
      // Only store essential user data to reduce size
      const essentialUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        verified: user.verified,
        createdAt: user.createdAt,
        stats: user.stats,
        preferences: user.preferences,
      };
      safeLocalStorageSet('echo-user', essentialUser);
    }
  }, [user]);

  useEffect(() => {
    safeLocalStorageSet('echo-following', [...following]);
  }, [following]);

  useEffect(() => {
    safeLocalStorageSet('echo-blocked', [...blocked]);
  }, [blocked]);

  useEffect(() => {
    safeLocalStorageSet('echo-muted', [...muted]);
  }, [muted]);

  useEffect(() => {
    // Limit notifications to last 50 to prevent quota issues
    const limitedNotifications = notifications.slice(-50);
    safeLocalStorageSet('echo-notifications', limitedNotifications);
  }, [notifications]);

  // Social actions
  const followUser = async (userId: string): Promise<boolean> => {
    try {
      setFollowing((prev) => new Set([...prev, userId]));
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, following: user.stats.following + 1 },
        });
      }

      // Add notification (simulated)
      setTimeout(() => {
        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          type: 'system',
          from: {
            id: 'system',
            username: 'echo',
            displayName: 'Echo',
            avatar: '/favicon.ico',
            verified: true,
          },
          content: `You are now following user ${userId}`,
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }, 500);

      return true;
    } catch (error) {
      return false;
    }
  };

  const unfollowUser = async (userId: string): Promise<boolean> => {
    try {
      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, following: user.stats.following - 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const blockUser = async (userId: string): Promise<boolean> => {
    try {
      setBlocked((prev) => new Set([...prev, userId]));
      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setFollowers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const unblockUser = async (userId: string): Promise<boolean> => {
    try {
      setBlocked((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const muteUser = async (userId: string): Promise<boolean> => {
    try {
      setMuted((prev) => new Set([...prev, userId]));
      return true;
    } catch (error) {
      return false;
    }
  };

  const unmuteUser = async (userId: string): Promise<boolean> => {
    try {
      setMuted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const reportUser = async (
    userId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      // In real app, send to moderation system
      console.log(`Reporting user ${userId} for reason: ${reason}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Content actions
  const likePost = async (postId: string): Promise<boolean> => {
    try {
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, likes: user.stats.likes + 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const unlikePost = async (postId: string): Promise<boolean> => {
    try {
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, likes: user.stats.likes - 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const repostPost = async (postId: string): Promise<boolean> => {
    try {
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, posts: user.stats.posts + 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const unrepostPost = async (postId: string): Promise<boolean> => {
    try {
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, posts: user.stats.posts - 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const bookmarkPost = async (postId: string): Promise<boolean> => {
    try {
      return true;
    } catch (error) {
      return false;
    }
  };

  const unbookmarkPost = async (postId: string): Promise<boolean> => {
    try {
      return true;
    } catch (error) {
      return false;
    }
  };

  const reportPost = async (
    postId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      // In real app, would send to moderation system
      console.log(`Reporting post ${postId} for reason: ${reason}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  const pinPost = async (postId: string): Promise<boolean> => {
    try {
      // In real app, would call API to pin/unpin post
      // For now, just simulate success
      return true;
    } catch (error) {
      return false;
    }
  };

  const unpinPost = async (postId: string): Promise<boolean> => {
    try {
      // In real app, would call API to unpin post
      return true;
    } catch (error) {
      return false;
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      if (user) {
        setUser({
          ...user,
          stats: { ...user.stats, posts: user.stats.posts - 1 },
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // User data
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (user) {
        setUser({ ...user, ...updates });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('echo-user');
      localStorage.removeItem('echo-following');
      localStorage.removeItem('echo-blocked');
      localStorage.removeItem('echo-muted');
      localStorage.removeItem('echo-notifications');
      return true;
    } catch (error) {
      return false;
    }
  };

  // Auth
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate login
      setUser(mockUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('echo-user');
  };

  const signup = async (data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }): Promise<boolean> => {
    try {
      const newUser: User = {
        ...mockUser,
        id: `user_${Date.now()}`,
        email: data.email,
        username: data.username,
        displayName: data.displayName,
        createdAt: new Date(),
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
          likes: 0,
        },
      };
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser,
    reportUser,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    bookmarkPost,
    unbookmarkPost,
    pinPost,
    unpinPost,
    reportPost,
    deletePost,
    following,
    followers,
    blocked,
    muted,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    updateProfile,
    deleteAccount,
    login,
    logout,
    signup,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
