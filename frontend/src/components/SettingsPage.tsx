'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { SettingsGrid } from './settings/SettingsGrid';

type SettingsSection =
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'accessibility'
  | 'communication'
  | 'content'
  | 'feed'
  | 'shopping'
  | 'live'
  | 'learning'
  | 'backup'
  | 'developer';

export default function SettingsPage() {
  const { colorMode, toggleColorMode, colorPalette, setColorPalette } =
    useTheme();
  const { mode: backgroundMode, setMode: setBackgroundMode } = useBackground();
  const {
    settings: contextSettings,
    updateSetting: contextUpdateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    playSound,
    formatDate,
    getImageQuality,
  } = useSettings();

  const [settings, setSettings] = useState(contextSettings);
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with context settings
  useEffect(() => {
    setSettings(contextSettings);
  }, [contextSettings]);

  // Check notification permission status
  useEffect(() => {
    const checkNotificationStatus = () => {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
      } else {
        setNotificationStatus(Notification.permission);
      }
    };

    checkNotificationStatus();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkNotificationStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Calculate storage usage
  useEffect(() => {
    const calculateStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageUsage({
            used: estimate.usage || 0,
            total: estimate.quota || 0,
          });
        } catch (error) {}
      }
    };

    calculateStorage();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave) {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    }
  }, [settings]);

  const updateSetting = async (
    key: string,
    value: string | boolean | number | string[]
  ) => {
    if (key === 'pushNotifications' && value === true) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        alert('Notification permission is required for push notifications.');
        return;
      }
    }

    contextUpdateSetting(key as any, value);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (settings.soundEffects && key !== 'soundEffects') {
      playSound();
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return false;
    }

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      alert(
        'Notifications are blocked. Please enable them in your browser settings.'
      );
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Echo Notifications Enabled!', {
          body: 'You will now receive updates and alerts.',
          icon: '/favicon.ico',
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCache = async () => {
    if (confirm('Are you sure you want to clear the cache?')) {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          alert('Cache cleared successfully!');
          if (settings.soundEffects) playSound();
        }
      } catch (error) {
        alert('Failed to clear cache.');
      }
    }
  };

  const handleExport = () => {
    const dataStr = exportSettings();
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `echo-settings-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    if (settings.soundEffects) playSound();
    alert('Settings exported successfully!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = importSettings(event.target?.result as string);
          if (success) {
            if (settings.soundEffects) playSound();
            alert('Settings imported successfully!');
            window.location.reload();
          } else {
            alert('Failed to import settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all settings? This cannot be undone.'
      )
    ) {
      resetSettings();
      if (settings.soundEffects) playSound();
      alert('Settings reset to defaults!');
      window.location.reload();
    }
  };

  // Toggle Component
  const Toggle = ({
    checked,
    onChange,
    label,
    description,
    icon,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
    icon?: string;
  }) => (
    <div
      style={{
        padding: '18px',
        marginBottom: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
        borderRadius: '12px',
        border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
      }}
      onClick={() => onChange(!checked)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          colorMode === 'dark' ? '#222' : '#f8f8f8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          colorMode === 'dark' ? '#1a1a1a' : '#fff';
      }}
    >
      {icon && (
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: checked
              ? 'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)'
              : colorMode === 'dark'
                ? '#252525'
                : '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 600 }}
        >
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{description}</div>
      </div>
      <div
        style={{
          width: '48px',
          height: '28px',
          background: checked
            ? 'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)'
            : colorMode === 'dark'
              ? '#333'
              : '#ddd',
          borderRadius: '14px',
          position: 'relative',
          transition: 'all 0.3s ease',
          boxShadow: checked ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  );

  // Select Component
  const Select = ({
    value,
    onChange,
    options,
    label,
    description,
    icon,
  }: {
    value: string | number;
    onChange: (value: string) => void;
    options: {
      value: string | number;
      label: string;
      icon?: string;
      description?: string;
    }[];
    label: string;
    description: string;
    icon?: string;
  }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '12px',
        }}
      >
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background:
                'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <div
            style={{ fontSize: '1rem', marginBottom: '2px', fontWeight: 600 }}
          >
            {label}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{description}</div>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '8px',
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onChange(String(option.value));
              if (settings.soundEffects) playSound();
            }}
            style={{
              padding: '10px',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              border:
                value === option.value
                  ? '2px solid var(--accent)'
                  : `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
              background:
                value === option.value
                  ? colorMode === 'dark'
                    ? 'rgba(124, 58, 237, 0.15)'
                    : 'rgba(124, 58, 237, 0.08)'
                  : colorMode === 'dark'
                    ? '#1a1a1a'
                    : '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {option.icon && (
              <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
            )}
            <span style={{ fontWeight: value === option.value ? 600 : 400 }}>
              {option.label}
            </span>
            {option.description && value === option.value && (
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Section Navigation
  const sections = [
    { id: 'appearance' as const, icon: '🎨', label: 'Appearance' },
    { id: 'notifications' as const, icon: '🔔', label: 'Notifications' },
    { id: 'privacy' as const, icon: '🔒', label: 'Privacy' },
    { id: 'accessibility' as const, icon: '♿', label: 'Accessibility' },
    { id: 'communication' as const, icon: '💬', label: 'Communication' },
    { id: 'content' as const, icon: '📺', label: 'Content' },
    { id: 'feed' as const, icon: '📰', label: 'Feed' },
    { id: 'shopping' as const, icon: '🛒', label: 'Shopping' },
    { id: 'live' as const, icon: '🎥', label: 'Live Streams' },
    { id: 'learning' as const, icon: '📚', label: 'Learning' },
    { id: 'backup' as const, icon: '☁️', label: 'Backup' },
    { id: 'developer' as const, icon: '🔧', label: 'Developer' },
  ];

  return (
    <section id="settings" data-route="settings" className="active">
      <div
        className="container"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            padding: '2rem',
            background:
              colorMode === 'dark'
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
            borderRadius: '20px',
            border: `1px solid ${colorMode === 'dark' ? '#333' : '#eee'}`,
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              fontWeight: 700,
              background:
                'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ⚙️ Settings
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: colorMode === 'dark' ? '#999' : '#666',
              marginBottom: '1rem',
            }}
          >
            Comprehensive settings for your Echo experience
          </p>
          {saveStatus !== 'idle' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background:
                  saveStatus === 'saved'
                    ? 'rgba(52, 211, 153, 0.1)'
                    : 'rgba(124, 58, 237, 0.1)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: saveStatus === 'saved' ? '#34D399' : 'var(--accent)',
              }}
            >
              {saveStatus === 'saving' ? '⏱️ Saving...' : '✅ Saved!'}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="search"
            placeholder="🔍 Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
              borderRadius: '14px',
              background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
              color: 'var(--fg)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(124, 58, 237, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                colorMode === 'dark' ? '#333' : '#ddd';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Modern Settings Grid */}
        <div style={{ marginBottom: '3rem' }}>
          <SettingsGrid onSectionClick={(section) => setActiveSection(section as SettingsSection)} />
        </div>

        {/* Detailed Settings Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '2rem',
          }}
        >
          {/* Sidebar Navigation */}
          <div
            style={{
              position: 'sticky',
              top: '20px',
              height: 'fit-content',
            }}
          >
            <div
              style={{
                background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                borderRadius: '16px',
                border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                padding: '0.5rem',
                overflow: 'hidden',
              }}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background:
                      activeSection === section.id
                        ? colorMode === 'dark'
                          ? 'rgba(124, 58, 237, 0.15)'
                          : 'rgba(124, 58, 237, 0.08)'
                        : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.9rem',
                    fontWeight: activeSection === section.id ? 600 : 400,
                    color:
                      activeSection === section.id
                        ? 'var(--accent)'
                        : 'var(--fg)',
                    textAlign: 'left',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background =
                        colorMode === 'dark' ? '#222' : '#f8f8f8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                borderRadius: '16px',
                border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
              }}
            >
              <h4
                style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.85rem',
                  opacity: 0.7,
                }}
              >
                Quick Actions
              </h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <button
                  onClick={handleExport}
                  style={{
                    padding: '8px 12px',
                    background: colorMode === 'dark' ? '#252525' : '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📥 Export
                </button>
                <button
                  onClick={handleImport}
                  style={{
                    padding: '8px 12px',
                    background: colorMode === 'dark' ? '#252525' : '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📤 Import
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🔄 Reset All
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🎨 Appearance
                </h2>

                <Select
                  value={colorMode}
                  onChange={(value) => {
                    if (value !== colorMode) toggleColorMode();
                  }}
                  options={[
                    {
                      value: 'light',
                      label: 'Light',
                      icon: '☀️',
                      description: 'Bright',
                    },
                    {
                      value: 'dark',
                      label: 'Dark',
                      icon: '🌙',
                      description: 'Dark',
                    },
                  ]}
                  label="Color Mode"
                  description="Choose your preferred theme"
                  icon="💡"
                />

                <Select
                  value={colorPalette}
                  onChange={(value) => setColorPalette(value)}
                  options={[
                    { value: 'mono', label: 'Mono', icon: '⚪' },
                    { value: 'red', label: 'Red', icon: '🔴' },
                    { value: 'blue', label: 'Blue', icon: '🔵' },
                    { value: 'green', label: 'Green', icon: '🟢' },
                    { value: 'glyph', label: 'Glyph', icon: '✨' },
                    { value: 'dark', label: 'Carbon', icon: '⚫' },
                  ]}
                  label="Color Palette"
                  description="Select accent colors"
                  icon="🎨"
                />

                <Select
                  value={settings.language}
                  onChange={(value) => updateSetting('language', value)}
                  options={[
                    { value: 'en', label: 'English', icon: '🇺🇸' },
                    { value: 'hi', label: 'हिंदी', icon: '🇮🇳' },
                    { value: 'pa', label: 'ਪੰਜਾਬੀ', icon: '🇮🇳' },
                    { value: 'bn', label: 'বাংলা', icon: '🇮🇳' },
                    { value: 'te', label: 'తెలుగు', icon: '🇮🇳' },
                    { value: 'mr', label: 'मराठी', icon: '🇮🇳' },
                    { value: 'ta', label: 'தமிழ்', icon: '🇮🇳' },
                    { value: 'gu', label: 'ગુજરાતી', icon: '🇮🇳' },
                    { value: 'kn', label: 'ಕನ್ನಡ', icon: '🇮🇳' },
                    { value: 'ml', label: 'മലയാളം', icon: '🇮🇳' },
                  ]}
                  label="Language"
                  description="Select your language"
                  icon="🌐"
                />

                <Select
                  value={backgroundMode}
                  onChange={(value) =>
                    setBackgroundMode(value as 'minimal' | 'enhanced' | 'off')
                  }
                  options={[
                    {
                      value: 'minimal',
                      label: 'Minimal',
                      icon: '✨',
                      description: 'Clean & professional',
                    },
                    {
                      value: 'enhanced',
                      label: 'Enhanced',
                      icon: '🎨',
                      description: 'Rich visual effects',
                    },
                    {
                      value: 'off',
                      label: 'Off',
                      icon: '⚪',
                      description: 'No background effects',
                    },
                  ]}
                  label="Background Effects"
                  description="Choose your visual experience"
                  icon="🌌"
                />
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🔔 Notifications
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.emailNotifications}
                    onChange={(checked) =>
                      updateSetting('emailNotifications', checked)
                    }
                    label="Email Notifications"
                    description="Receive updates via email"
                    icon="📧"
                  />
                  <Toggle
                    checked={settings.pushNotifications}
                    onChange={(checked) =>
                      updateSetting('pushNotifications', checked)
                    }
                    label="Push Notifications"
                    description={`Browser notifications (${notificationStatus === 'granted' ? '✅ Enabled' : '❌ Disabled'})`}
                    icon="🔔"
                  />
                  <Toggle
                    checked={settings.soundEffects}
                    onChange={(checked) =>
                      updateSetting('soundEffects', checked)
                    }
                    label="Sound Effects"
                    description="Audio feedback for interactions"
                    icon="🔊"
                  />
                  <Toggle
                    checked={settings.liveStreamNotifications}
                    onChange={(checked) =>
                      updateSetting('liveStreamNotifications', checked)
                    }
                    label="Live Stream Alerts"
                    description="Get notified when streams start"
                    icon="🎥"
                  />
                  <Toggle
                    checked={settings.wishlistNotifications}
                    onChange={(checked) =>
                      updateSetting('wishlistNotifications', checked)
                    }
                    label="Wishlist Updates"
                    description="Notifications for wishlist items"
                    icon="💝"
                  />
                  <Toggle
                    checked={settings.priceDropAlerts}
                    onChange={(checked) =>
                      updateSetting('priceDropAlerts', checked)
                    }
                    label="Price Drop Alerts"
                    description="Get notified when prices drop"
                    icon="💰"
                  />
                  <Toggle
                    checked={settings.orderNotifications}
                    onChange={(checked) =>
                      updateSetting('orderNotifications', checked)
                    }
                    label="Order Updates"
                    description="Track your orders"
                    icon="📦"
                  />
                  <Toggle
                    checked={settings.studyReminders}
                    onChange={(checked) =>
                      updateSetting('studyReminders', checked)
                    }
                    label="Study Reminders"
                    description="Reminders for your courses"
                    icon="📚"
                  />
                  <Toggle
                    checked={settings.courseProgressNotifications}
                    onChange={(checked) =>
                      updateSetting('courseProgressNotifications', checked)
                    }
                    label="Course Progress"
                    description="Updates on your learning progress"
                    icon="📈"
                  />
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🔒 Privacy & Security
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.publicProfile}
                    onChange={(checked) =>
                      updateSetting('publicProfile', checked)
                    }
                    label="Public Profile"
                    description="Make your profile visible to everyone"
                    icon="👤"
                  />
                  <Toggle
                    checked={settings.showOnlineStatus}
                    onChange={(checked) =>
                      updateSetting('showOnlineStatus', checked)
                    }
                    label="Online Status"
                    description="Show when you're active"
                    icon="🟢"
                  />
                  <Toggle
                    checked={settings.showLastSeen}
                    onChange={(checked) =>
                      updateSetting('showLastSeen', checked)
                    }
                    label="Last Seen"
                    description="Show your last active time"
                    icon="🕒"
                  />
                  <Toggle
                    checked={settings.analyticsSharing}
                    onChange={(checked) =>
                      updateSetting('analyticsSharing', checked)
                    }
                    label="Analytics Sharing"
                    description="Help improve Echo with usage data"
                    icon="📊"
                  />
                  <Toggle
                    checked={settings.twoFactorAuth}
                    onChange={(checked) =>
                      updateSetting('twoFactorAuth', checked)
                    }
                    label="Two-Factor Authentication"
                    description="Extra security for your account"
                    icon="🔐"
                  />
                  <Toggle
                    checked={settings.savePaymentMethods}
                    onChange={(checked) =>
                      updateSetting('savePaymentMethods', checked)
                    }
                    label="Save Payment Methods"
                    description="Store payment info securely"
                    icon="💳"
                  />
                </div>
              </div>
            )}

            {/* Accessibility */}
            {activeSection === 'accessibility' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  ♿ Accessibility
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '1.5rem',
                  }}
                >
                  <Toggle
                    checked={settings.highContrast}
                    onChange={(checked) =>
                      updateSetting('highContrast', checked)
                    }
                    label="High Contrast"
                    description="Increase contrast for better visibility"
                    icon="🔆"
                  />
                  <Toggle
                    checked={settings.reducedMotion}
                    onChange={(checked) =>
                      updateSetting('reducedMotion', checked)
                    }
                    label="Reduced Motion"
                    description="Minimize animations"
                    icon="🚫"
                  />
                  <Toggle
                    checked={settings.autoSave}
                    onChange={(checked) => updateSetting('autoSave', checked)}
                    label="Auto Save"
                    description="Automatically save changes"
                    icon="💾"
                  />
                </div>

                <Select
                  value={settings.dataUsage}
                  onChange={(value) => updateSetting('dataUsage', value)}
                  options={[
                    {
                      value: 'low',
                      label: 'Low',
                      icon: '🟢',
                      description: 'Save data',
                    },
                    {
                      value: 'balanced',
                      label: 'Balanced',
                      icon: '🟡',
                      description: 'Recommended',
                    },
                    {
                      value: 'high',
                      label: 'High',
                      icon: '🔴',
                      description: 'Best quality',
                    },
                  ]}
                  label="Data Usage"
                  description="Control bandwidth consumption"
                  icon="📶"
                />
              </div>
            )}

            {/* Communication */}
            {activeSection === 'communication' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  💬 Communication
                </h2>

                <Select
                  value={settings.whoCanMessage}
                  onChange={(value) => updateSetting('whoCanMessage', value)}
                  options={[
                    { value: 'everyone', label: 'Everyone', icon: '🌐' },
                    { value: 'friends', label: 'Friends Only', icon: '👥' },
                    { value: 'nobody', label: 'Nobody', icon: '🚫' },
                  ]}
                  label="Who Can Message You"
                  description="Control who can send you messages"
                  icon="💬"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.showReadReceipts}
                    onChange={(checked) =>
                      updateSetting('showReadReceipts', checked)
                    }
                    label="Read Receipts"
                    description="Show when you've read messages"
                    icon="✅"
                  />
                  <Toggle
                    checked={settings.showTypingIndicator}
                    onChange={(checked) =>
                      updateSetting('showTypingIndicator', checked)
                    }
                    label="Typing Indicator"
                    description="Show when you're typing"
                    icon="⌨️"
                  />
                  <Toggle
                    checked={settings.allowVoiceCalls}
                    onChange={(checked) =>
                      updateSetting('allowVoiceCalls', checked)
                    }
                    label="Voice Calls"
                    description="Allow incoming voice calls"
                    icon="📞"
                  />
                  <Toggle
                    checked={settings.allowVideoCalls}
                    onChange={(checked) =>
                      updateSetting('allowVideoCalls', checked)
                    }
                    label="Video Calls"
                    description="Allow incoming video calls"
                    icon="📹"
                  />
                </div>
              </div>
            )}

            {/* Content Preferences */}
            {activeSection === 'content' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  📺 Content Preferences
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.autoPlayVideos}
                    onChange={(checked) =>
                      updateSetting('autoPlayVideos', checked)
                    }
                    label="Auto-Play Videos"
                    description="Automatically play videos in feed"
                    icon="▶️"
                  />
                  <Toggle
                    checked={settings.showNSFWContent}
                    onChange={(checked) =>
                      updateSetting('showNSFWContent', checked)
                    }
                    label="Mature Content"
                    description="Show age-restricted content"
                    icon="🔞"
                  />
                  <Toggle
                    checked={settings.enableContentRecommendations}
                    onChange={(checked) =>
                      updateSetting('enableContentRecommendations', checked)
                    }
                    label="Content Recommendations"
                    description="Get personalized content suggestions"
                    icon="✨"
                  />
                  <Toggle
                    checked={settings.showTrendingContent}
                    onChange={(checked) =>
                      updateSetting('showTrendingContent', checked)
                    }
                    label="Trending Content"
                    description="Show what's popular"
                    icon="🔥"
                  />
                </div>
              </div>
            )}

            {/* Feed & Discovery */}
            {activeSection === 'feed' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  📰 Feed & Discovery
                </h2>

                <Select
                  value={settings.feedAlgorithm}
                  onChange={(value) => updateSetting('feedAlgorithm', value)}
                  options={[
                    {
                      value: 'chronological',
                      label: 'Chronological',
                      icon: '🕐',
                    },
                    { value: 'recommended', label: 'Recommended', icon: '⭐' },
                    { value: 'mixed', label: 'Mixed', icon: '🔀' },
                  ]}
                  label="Feed Algorithm"
                  description="Choose how posts are sorted"
                  icon="📊"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.showSuggestedPosts}
                    onChange={(checked) =>
                      updateSetting('showSuggestedPosts', checked)
                    }
                    label="Suggested Posts"
                    description="Show posts you might like"
                    icon="💡"
                  />
                  <Toggle
                    checked={settings.hideSeen}
                    onChange={(checked) => updateSetting('hideSeen', checked)}
                    label="Hide Seen Posts"
                    description="Don't show posts you've already seen"
                    icon="👁️"
                  />
                  <Toggle
                    checked={settings.showReposts}
                    onChange={(checked) =>
                      updateSetting('showReposts', checked)
                    }
                    label="Show Reposts"
                    description="Include reposts in your feed"
                    icon="🔁"
                  />
                </div>
              </div>
            )}

            {/* Shopping */}
            {activeSection === 'shopping' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🛒 Shopping
                </h2>

                <Select
                  value={settings.currency}
                  onChange={(value) => updateSetting('currency', value)}
                  options={[
                    { value: 'INR', label: 'INR (₹)', icon: '🇮🇳' },
                    { value: 'USD', label: 'USD ($)', icon: '🇺🇸' },
                    { value: 'EUR', label: 'EUR (€)', icon: '🇪🇺' },
                    { value: 'GBP', label: 'GBP (£)', icon: '🇬🇧' },
                    { value: 'JPY', label: 'JPY (¥)', icon: '🇯🇵' },
                  ]}
                  label="Currency"
                  description="Your preferred currency"
                  icon="💰"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.wishlistNotifications}
                    onChange={(checked) =>
                      updateSetting('wishlistNotifications', checked)
                    }
                    label="Wishlist Notifications"
                    description="Get updates on wishlist items"
                    icon="💝"
                  />
                  <Toggle
                    checked={settings.priceDropAlerts}
                    onChange={(checked) =>
                      updateSetting('priceDropAlerts', checked)
                    }
                    label="Price Drop Alerts"
                    description="Notify when prices drop"
                    icon="📉"
                  />
                  <Toggle
                    checked={settings.orderNotifications}
                    onChange={(checked) =>
                      updateSetting('orderNotifications', checked)
                    }
                    label="Order Notifications"
                    description="Track your orders"
                    icon="📦"
                  />
                  <Toggle
                    checked={settings.savePaymentMethods}
                    onChange={(checked) =>
                      updateSetting('savePaymentMethods', checked)
                    }
                    label="Save Payment Methods"
                    description="Store payment info securely"
                    icon="💳"
                  />
                </div>
              </div>
            )}

            {/* Live Streams */}
            {activeSection === 'live' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🎥 Live Streams
                </h2>

                <Select
                  value={settings.streamQuality}
                  onChange={(value) => updateSetting('streamQuality', value)}
                  options={[
                    { value: 'auto', label: 'Auto', icon: '🔄' },
                    { value: 'low', label: 'Low (360p)', icon: '📱' },
                    { value: 'medium', label: 'Medium (720p)', icon: '💻' },
                    { value: 'high', label: 'High (1080p)', icon: '📺' },
                    { value: '4k', label: '4K (2160p)', icon: '🖥️' },
                  ]}
                  label="Stream Quality"
                  description="Video quality for live streams"
                  icon="🎬"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.showStreamChat}
                    onChange={(checked) =>
                      updateSetting('showStreamChat', checked)
                    }
                    label="Show Chat"
                    description="Display live chat during streams"
                    icon="💬"
                  />
                  <Toggle
                    checked={settings.showViewerCount}
                    onChange={(checked) =>
                      updateSetting('showViewerCount', checked)
                    }
                    label="Show Viewer Count"
                    description="Display number of viewers"
                    icon="👥"
                  />
                  <Toggle
                    checked={settings.liveStreamNotifications}
                    onChange={(checked) =>
                      updateSetting('liveStreamNotifications', checked)
                    }
                    label="Stream Notifications"
                    description="Get notified when streams start"
                    icon="🔔"
                  />
                </div>
              </div>
            )}

            {/* Learning */}
            {activeSection === 'learning' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  📚 Learning
                </h2>

                <Select
                  value={settings.downloadQuality}
                  onChange={(value) => updateSetting('downloadQuality', value)}
                  options={[
                    {
                      value: 'low',
                      label: 'Low',
                      icon: '📱',
                      description: 'Save space',
                    },
                    {
                      value: 'medium',
                      label: 'Medium',
                      icon: '💻',
                      description: 'Balanced',
                    },
                    {
                      value: 'high',
                      label: 'High',
                      icon: '📺',
                      description: 'Best quality',
                    },
                  ]}
                  label="Download Quality"
                  description="Quality for offline lessons"
                  icon="⬇️"
                />

                <Select
                  value={settings.playbackSpeed}
                  onChange={(value) =>
                    updateSetting('playbackSpeed', parseFloat(value))
                  }
                  options={[
                    { value: '0.5', label: '0.5x', icon: '🐢' },
                    { value: '0.75', label: '0.75x', icon: '🚶' },
                    { value: '1', label: '1x', icon: '▶️' },
                    { value: '1.25', label: '1.25x', icon: '🏃' },
                    { value: '1.5', label: '1.5x', icon: '🚀' },
                    { value: '2', label: '2x', icon: '⚡' },
                  ]}
                  label="Playback Speed"
                  description="Default video speed"
                  icon="⏩"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <Toggle
                    checked={settings.studyReminders}
                    onChange={(checked) =>
                      updateSetting('studyReminders', checked)
                    }
                    label="Study Reminders"
                    description="Get reminded to study"
                    icon="⏰"
                  />
                  <Toggle
                    checked={settings.courseProgressNotifications}
                    onChange={(checked) =>
                      updateSetting('courseProgressNotifications', checked)
                    }
                    label="Progress Notifications"
                    description="Updates on your progress"
                    icon="📈"
                  />
                  <Toggle
                    checked={settings.autoPlayNextLesson}
                    onChange={(checked) =>
                      updateSetting('autoPlayNextLesson', checked)
                    }
                    label="Auto-Play Next Lesson"
                    description="Automatically play next lesson"
                    icon="▶️"
                  />
                </div>
              </div>
            )}

            {/* Backup & Sync */}
            {activeSection === 'backup' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  ☁️ Backup & Sync
                </h2>

                <Select
                  value={settings.backupFrequency}
                  onChange={(value) => updateSetting('backupFrequency', value)}
                  options={[
                    { value: 'daily', label: 'Daily', icon: '📅' },
                    { value: 'weekly', label: 'Weekly', icon: '📆' },
                    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
                  ]}
                  label="Backup Frequency"
                  description="How often to backup your data"
                  icon="⏱️"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '1.5rem',
                  }}
                >
                  <Toggle
                    checked={settings.cloudBackup}
                    onChange={(checked) =>
                      updateSetting('cloudBackup', checked)
                    }
                    label="Cloud Backup"
                    description="Backup data to cloud"
                    icon="☁️"
                  />
                  <Toggle
                    checked={settings.syncAcrossDevices}
                    onChange={(checked) =>
                      updateSetting('syncAcrossDevices', checked)
                    }
                    label="Sync Across Devices"
                    description="Keep data synced everywhere"
                    icon="🔄"
                  />
                </div>

                {/* Storage Info */}
                {storageUsage.total > 0 && (
                  <div
                    style={{
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: colorMode === 'dark' ? '#252525' : '#f8f8f8',
                      borderRadius: '12px',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 1rem',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                      }}
                    >
                      Storage Usage
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>Used</span>
                      <span style={{ fontWeight: 600 }}>
                        {formatBytes(storageUsage.used)} /{' '}
                        {formatBytes(storageUsage.total)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background:
                          colorMode === 'dark' ? '#1a1a1a' : '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(storageUsage.used / storageUsage.total) * 100}%`,
                          height: '100%',
                          background:
                            'linear-gradient(90deg, var(--accent) 0%, #E91E63 100%)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <button
                      onClick={clearCache}
                      style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '10px',
                        background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                        border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      🗑️ Clear Cache
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Developer Options */}
            {activeSection === 'developer' && (
              <div
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                  padding: '2rem',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  🔧 Developer Options
                </h2>

                <Select
                  value={settings.apiEndpoint}
                  onChange={(value) => updateSetting('apiEndpoint', value)}
                  options={[
                    { value: 'production', label: 'Production', icon: '🌐' },
                    { value: 'staging', label: 'Staging', icon: '🧪' },
                    { value: 'development', label: 'Development', icon: '💻' },
                  ]}
                  label="API Endpoint"
                  description="Select API environment"
                  icon="🔌"
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '1.5rem',
                  }}
                >
                  <Toggle
                    checked={settings.debugMode}
                    onChange={(checked) => updateSetting('debugMode', checked)}
                    label="Debug Mode"
                    description="Enable debugging features"
                    icon="🐛"
                  />
                  <Toggle
                    checked={settings.showPerformanceMetrics}
                    onChange={(checked) =>
                      updateSetting('showPerformanceMetrics', checked)
                    }
                    label="Performance Metrics"
                    description="Show performance indicators"
                    icon="📊"
                  />
                  <Toggle
                    checked={settings.errorLogging}
                    onChange={(checked) =>
                      updateSetting('errorLogging', checked)
                    }
                    label="Error Logging"
                    description="Log errors to console"
                    icon="📝"
                  />
                </div>

                <div
                  style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong>⚠️ Warning:</strong> Developer options are for
                  advanced users only. Changing these settings may affect app
                  stability.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            opacity: 0.7,
          }}
        >
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Echo v2.1.0 • Last updated: {formatDate(new Date())}
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            Made with ❤️ in India • {Object.keys(settings).length} settings
            available
          </div>
        </div>
      </div>
    </section>
  );
}
