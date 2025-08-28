'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'message' | 'system';
  from: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  relatedId?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'follow',
    from: {
      id: 'user_002',
      username: 'priya_sharma',
      displayName: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=c0aede',
      verified: true
    },
    content: 'started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false
  },
  {
    id: 'notif_002',
    type: 'like',
    from: {
      id: 'user_003',
      username: 'arjun_tech',
      displayName: 'Arjun Kumar',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=ffd5dc',
      verified: false
    },
    content: 'liked your post',
    relatedId: 'post_123',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false
  }
];

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Load from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('echo-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {

      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('echo-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const contextValue: NotificationsContextType = {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    addNotification
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
