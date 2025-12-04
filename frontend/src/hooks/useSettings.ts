'use client';

import { useState, useEffect } from 'react';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  updates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showActivity: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    email: true,
    push: false,
    marketing: false,
    updates: true,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('echo-user-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('echo-user-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, loading]);

  // Update notification settings
  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  };

  // Update privacy settings
  const updatePrivacy = (updates: Partial<PrivacySettings>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates },
    }));
  };

  // Update security settings
  const updateSecurity = (updates: Partial<SecuritySettings>) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, ...updates },
    }));
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('echo-user-settings');
  };

  return {
    settings,
    loading,
    updateNotifications,
    updatePrivacy,
    updateSecurity,
    resetSettings,
  };
}
