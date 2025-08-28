'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;

  // Privacy & Security
  publicProfile: boolean;
  showOnlineStatus: boolean;
  analyticsSharing: boolean;
  twoFactorAuth: boolean;

  // General
  language: string;
  timezone: string;
  autoSave: boolean;

  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  dataUsage: 'low' | 'balanced' | 'high';

  // Communication
  whoCanMessage: 'everyone' | 'friends' | 'nobody';
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
  showLastSeen: boolean;
  allowVoiceCalls: boolean;
  allowVideoCalls: boolean;

  // Content Preferences
  autoPlayVideos: boolean;
  showNSFWContent: boolean;
  enableContentRecommendations: boolean;
  showTrendingContent: boolean;
  muteWords: string[];

  // Feed & Discovery
  feedAlgorithm: 'chronological' | 'recommended' | 'mixed';
  showSuggestedPosts: boolean;
  hideSeen: boolean;
  showReposts: boolean;

  // Shopping
  currency: string;
  wishlistNotifications: boolean;
  priceDropAlerts: boolean;
  orderNotifications: boolean;
  savePaymentMethods: boolean;

  // Live Streams
  streamQuality: 'auto' | 'low' | 'medium' | 'high' | '4k';
  showStreamChat: boolean;
  showViewerCount: boolean;
  liveStreamNotifications: boolean;

  // Learning/Tuition
  studyReminders: boolean;
  courseProgressNotifications: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  playbackSpeed: number;
  autoPlayNextLesson: boolean;

  // Backup & Sync
  cloudBackup: boolean;
  syncAcrossDevices: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';

  // Developer Options
  debugMode: boolean;
  showPerformanceMetrics: boolean;
  errorLogging: boolean;
  apiEndpoint: 'production' | 'staging' | 'development';
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean | string | number | string[]) => void;
  updateMultipleSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
  playSound: () => void;
  formatDate: (date: Date) => string;
  shouldShowAnimation: () => boolean;
  getImageQuality: () => number;
}

const defaultSettings: Settings = {
  // Notifications
  emailNotifications: true,
  pushNotifications: false,
  soundEffects: true,

  // Privacy & Security
  publicProfile: true,
  showOnlineStatus: true,
  analyticsSharing: true,
  twoFactorAuth: false,

  // General
  language: 'en',
  timezone: 'Asia/Kolkata',
  autoSave: true,

  // Accessibility
  highContrast: false,
  reducedMotion: false,
  dataUsage: 'balanced',

  // Communication
  whoCanMessage: 'everyone',
  showReadReceipts: true,
  showTypingIndicator: true,
  showLastSeen: true,
  allowVoiceCalls: true,
  allowVideoCalls: true,

  // Content Preferences
  autoPlayVideos: true,
  showNSFWContent: false,
  enableContentRecommendations: true,
  showTrendingContent: true,
  muteWords: [],

  // Feed & Discovery
  feedAlgorithm: 'recommended',
  showSuggestedPosts: true,
  hideSeen: false,
  showReposts: true,

  // Shopping
  currency: 'INR',
  wishlistNotifications: true,
  priceDropAlerts: true,
  orderNotifications: true,
  savePaymentMethods: false,

  // Live Streams
  streamQuality: 'auto',
  showStreamChat: true,
  showViewerCount: true,
  liveStreamNotifications: true,

  // Learning/Tuition
  studyReminders: true,
  courseProgressNotifications: true,
  downloadQuality: 'medium',
  playbackSpeed: 1.0,
  autoPlayNextLesson: true,

  // Backup & Sync
  cloudBackup: false,
  syncAcrossDevices: false,
  backupFrequency: 'weekly',

  // Developer Options
  debugMode: false,
  showPerformanceMetrics: false,
  errorLogging: true,
  apiEndpoint: 'production'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('echo-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure new settings are included
        setSettings({ ...defaultSettings, ...parsed });
        applySettings({ ...defaultSettings, ...parsed });
      } catch (error) {

      }
    }
  }, []);

  // Apply settings globally
  const applySettings = (settingsToApply: Settings) => {
    // Apply accessibility settings
    if (settingsToApply.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (settingsToApply.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Apply sound effects indicator
    if (settingsToApply.soundEffects) {
      document.body.classList.add('sound-effects-enabled');
    } else {
      document.body.classList.remove('sound-effects-enabled');
    }

    // Apply data usage settings
    document.documentElement.setAttribute('data-usage', settingsToApply.dataUsage);

    // Apply language settings
    document.documentElement.setAttribute('lang', settingsToApply.language);

    // Apply debug mode
    if (settingsToApply.debugMode) {
      document.body.classList.add('debug-mode');

    } else {
      document.body.classList.remove('debug-mode');
    }

    // Store timezone for date formatting
    localStorage.setItem('echo-timezone', settingsToApply.timezone);

    // Store currency preference
    localStorage.setItem('echo-currency', settingsToApply.currency);
  };

  const updateSetting = (key: keyof Settings, value: boolean | string | number | string[]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (newSettings.autoSave) {
      localStorage.setItem('echo-settings', JSON.stringify(newSettings));
      applySettings(newSettings);
    }

    // Play sound effect if enabled
    if (settings.soundEffects && key !== 'soundEffects') {
      playSound();
    }
  };

  const updateMultipleSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (newSettings.autoSave) {
      localStorage.setItem('echo-settings', JSON.stringify(newSettings));
      applySettings(newSettings);
    }

    if (settings.soundEffects) {
      playSound();
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('echo-settings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
  };

  const exportSettings = (): string => {
    return JSON.stringify({
      settings,
      exportDate: new Date().toISOString(),
      version: '2.1.0'
    }, null, 2);
  };

  const importSettings = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      const importedSettings = parsed.settings || parsed;
      const mergedSettings = { ...defaultSettings, ...importedSettings };
      setSettings(mergedSettings);
      localStorage.setItem('echo-settings', JSON.stringify(mergedSettings));
      applySettings(mergedSettings);
      return true;
    } catch (error) {

      return false;
    }
  };

  const playSound = () => {
    if (!settings.soundEffects) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {

    }
  };

  const formatDate = (date: Date): string => {
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'pa': 'pa-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'as': 'as-IN',
      'ur': 'ur-PK'
    };

    const locale = localeMap[settings.language] || 'en-US';

    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone: settings.timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  };

  const shouldShowAnimation = (): boolean => {
    return !settings.reducedMotion;
  };

  const getImageQuality = (): number => {
    switch (settings.dataUsage) {
      case 'low': return 0.7;
      case 'balanced': return 0.85;
      case 'high': return 1.0;
      default: return 0.85;
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    exportSettings,
    importSettings,
    playSound,
    formatDate,
    shouldShowAnimation,
    getImageQuality
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
