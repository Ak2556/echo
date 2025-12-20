'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

interface SocialContextType {
  // Social actions
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  muteUser: (userId: string) => Promise<boolean>;
  unmuteUser: (userId: string) => Promise<boolean>;
  reportUser: (userId: string, reason: string) => Promise<boolean>;

  // User lists
  following: Set<string>;
  followers: Set<string>;
  blocked: Set<string>;
  muted: Set<string>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [following, setFollowing] = useState<Set<string>>(
    new Set(['user_002', 'user_003', 'user_005'])
  );
  const [followers, setFollowers] = useState<Set<string>>(
    new Set(['user_002', 'user_004', 'user_006'])
  );
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());

  // Load from localStorage
  useEffect(() => {
    const savedFollowing = localStorage.getItem('echo-following');
    const savedBlocked = localStorage.getItem('echo-blocked');
    const savedMuted = localStorage.getItem('echo-muted');

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
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('echo-following', JSON.stringify([...following]));
  }, [following]);

  useEffect(() => {
    localStorage.setItem('echo-blocked', JSON.stringify([...blocked]));
  }, [blocked]);

  useEffect(() => {
    localStorage.setItem('echo-muted', JSON.stringify([...muted]));
  }, [muted]);

  const followUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setFollowing((prev) => new Set([...prev, userId]));
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const blockUser = useCallback(async (userId: string): Promise<boolean> => {
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
  }, []);

  const unblockUser = useCallback(async (userId: string): Promise<boolean> => {
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
  }, []);

  const muteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setMuted((prev) => new Set([...prev, userId]));
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const unmuteUser = useCallback(async (userId: string): Promise<boolean> => {
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
  }, []);

  const reportUser = useCallback(
    async (userId: string, reason: string): Promise<boolean> => {
      try {
        // In real app, send to moderation system

        return true;
      } catch (error) {
        return false;
      }
    },
    []
  );

  const contextValue: SocialContextType = {
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser,
    reportUser,
    following,
    followers,
    blocked,
    muted,
  };

  return (
    <SocialContext.Provider value={contextValue}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = (): SocialContextType => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
