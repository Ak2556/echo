'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import type { AccessibilitySettings } from '@/contexts/ModernThemeContext';
import { Card } from '@/components/ui/EnhancedCard';
import Button from '@/components/ui/EnhancedButton';
import Input from '@/components/ui/EnhancedInput';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'slider' | 'color';
  value: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export default function EnhancedSettingsPage() {
  const { 
    themeMode, 
    setThemeMode, 
    colorMode, 
    setColorMode, 
    accessibility, 
    setAccessibility,
    colors 
  } = useEnhancedTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({
    // Theme settings
    themeMode,
    colorMode,
    reducedMotion: accessibility.reducedMotion,
    highContrast: accessibility.highContrast,
    fontSize: accessibility.fontSize,
    
    // App settings
    notifications: true,
    soundEffects: true,
    autoPlay: false,
    dataUsage: 'standard',
    language: 'en',
    
    // Privacy settings
    profileVisibility: 'public',
    activityStatus: true,
    readReceipts: true,
    analytics: true,
    
    // Content settings
    contentFilter: 'moderate',
    autoDownload: 'wifi',
    videoQuality: 'auto',
    
    // Security settings
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const settingSections: SettingSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of Echo',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
      settings: [
        {
          id: 'themeMode',
          label: 'Theme Style',
          description: 'Choose your preferred visual theme',
          type: 'select',
          value: settings.themeMode,
          options: [
            { label: '⚡ Electric Purple (Neon Creator)', value: 'electric' },
            { label: '💼 Professional Blue (Clean)', value: 'professional' },
            { label: '🔥 Modern Red (Ultra)', value: 'modern' },
            { label: '🌅 Creator Sunset (Social)', value: 'creator' },
          ],
        },
        {
          id: 'colorMode',
          label: 'Color Mode',
          description: 'Light, dark, or automatic based on system',
          type: 'select',
          value: settings.colorMode,
          options: [
            { label: '☀️ Light', value: 'light' },
            { label: '🌙 Dark', value: 'dark' },
            { label: '🔄 Auto', value: 'auto' },
          ],
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Adjust text size for better readability',
          type: 'select',
          value: settings.fontSize,
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Make Echo work better for you',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.662V19a2 2 0 012-2h6a2 2 0 012 2v1.662" />
        </svg>
      ),
      settings: [
        {
          id: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimize animations and transitions',
          type: 'toggle',
          value: settings.reducedMotion,
        },
        {
          id: 'highContrast',
          label: 'High Contrast',
          description: 'Increase contrast for better visibility',
          type: 'toggle',
          value: settings.highContrast,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control how Echo notifies you',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
      settings: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          description: 'Receive notifications on this device',
          type: 'toggle',
          value: settings.notifications,
        },
        {
          id: 'soundEffects',
          label: 'Sound Effects',
          description: 'Play sounds for interactions',
          type: 'toggle',
          value: settings.soundEffects,
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      description: 'Control your privacy and safety settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      settings: [
        {
          id: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Who can see your profile',
          type: 'select',
          value: settings.profileVisibility,
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Friends Only', value: 'friends' },
            { label: 'Private', value: 'private' },
          ],
        },
        {
          id: 'activityStatus',
          label: 'Activity Status',
          description: 'Show when you\'re online',
          type: 'toggle',
          value: settings.activityStatus,
        },
        {
          id: 'readReceipts',
          label: 'Read Receipts',
          description: 'Let others know when you\'ve read their messages',
          type: 'toggle',
          value: settings.readReceipts,
        },
      ],
    },
    {
      id: 'content',
      title: 'Content & Media',
      description: 'Manage how content is displayed and downloaded',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      ),
      settings: [
        {
          id: 'autoPlay',
          label: 'Auto-play Videos',
          description: 'Automatically play videos in feed',
          type: 'toggle',
          value: settings.autoPlay,
        },
        {
          id: 'videoQuality',
          label: 'Video Quality',
          description: 'Default video playback quality',
          type: 'select',
          value: settings.videoQuality,
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'High (1080p)', value: 'high' },
            { label: 'Medium (720p)', value: 'medium' },
            { label: 'Low (480p)', value: 'low' },
          ],
        },
        {
          id: 'dataUsage',
          label: 'Data Usage',
          description: 'Control data consumption',
          type: 'select',
          value: settings.dataUsage,
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Data Saver', value: 'saver' },
            { label: 'High Quality', value: 'high' },
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Keep your account secure',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      settings: [
        {
          id: 'twoFactor',
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          type: 'toggle',
          value: settings.twoFactor,
        },
        {
          id: 'loginAlerts',
          label: 'Login Alerts',
          description: 'Get notified of new logins',
          type: 'toggle',
          value: settings.loginAlerts,
        },
        {
          id: 'sessionTimeout',
          label: 'Session Timeout (minutes)',
          description: 'Auto-logout after inactivity',
          type: 'slider',
          value: settings.sessionTimeout,
          min: 5,
          max: 120,
          step: 5,
        },
      ],
    },
  ];

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));

    // Apply theme changes immediately
    switch (settingId) {
      case 'themeMode':
        setThemeMode(value);
        break;
      case 'colorMode':
        setColorMode(value);
        break;
      case 'reducedMotion':
      case 'highContrast':
      case 'fontSize':
        setAccessibility((prev: AccessibilitySettings) => ({ ...prev, [settingId]: value }));
        break;
    }
  };

  const filteredSections = settingSections.filter(section =>
    searchQuery === '' ||
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.settings.some(setting =>
      setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderSetting = (setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="toggle-setting">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider" />
          </label>
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="select-input"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'slider':
        return (
          <div className="slider-setting">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
              className="slider-input"
            />
            <span className="slider-value">{setting.value}</span>
          </div>
        );

      case 'input':
        return (
          <Input
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            placeholder={setting.description}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="enhanced-settings">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Customize your Echo experience
          </p>
        </div>
        
        {/* Search */}
        <div className="search-container">
          <div className="search-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {filteredSections.map((section, index) => (
          <Card
            key={section.id}
            className={`setting-section ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
          >
            <div className="section-header">
              <div className="section-icon">
                {section.icon}
              </div>
              <div className="section-info">
                <h3 className="section-title">{section.title}</h3>
                <p className="section-description">{section.description}</p>
              </div>
              <button className="section-toggle">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`chevron ${activeSection === section.id ? 'expanded' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className={`section-content ${activeSection === section.id ? 'expanded' : ''}`}>
              <div className="settings-list">
                {section.settings.map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <div className="setting-info">
                      <label className="setting-label">{setting.label}</label>
                      {setting.description && (
                        <p className="setting-description">{setting.description}</p>
                      )}
                    </div>
                    <div className="setting-control">
                      {renderSetting(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="quick-actions">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="actions-grid">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Reset Settings
          </Button>
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
          <Button variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </Card>

      <style jsx>{`
        .enhanced-settings {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-2xl);
          animation: fadeInUp var(--duration-slow) var(--ease-out);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-4xl);
          gap: var(--spacing-xl);
        }

        .header-content {
          flex: 1;
        }

        .settings-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--color-textPrimary);
          margin: 0 0 var(--spacing-sm) 0;
          background: var(--color-gradientPrimary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .settings-subtitle {
          font-size: var(--text-lg);
          color: var(--color-textSecondary);
          margin: 0;
        }

        .search-container {
          flex-shrink: 0;
          min-width: 300px;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--duration-normal) var(--ease-out);
        }

        .search-wrapper:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-focus);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--color-textPrimary);
          font-size: var(--text-base);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-textMuted);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-4xl);
        }

        .setting-section {
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
          overflow: hidden;
        }

        .setting-section:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl), var(--color-glow);
        }

        .setting-section.active {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-xl), var(--color-glow);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }

        .section-info {
          flex: 1;
        }

        .section-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--color-textPrimary);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .section-description {
          font-size: var(--text-sm);
          color: var(--color-textSecondary);
          margin: 0;
        }

        .section-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: var(--color-hover);
          color: var(--color-textSecondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
        }

        .section-toggle:hover {
          background: var(--color-primary);
          color: white;
        }

        .chevron {
          transition: transform var(--duration-normal) var(--ease-out);
        }

        .chevron.expanded {
          transform: rotate(180deg);
        }

        .section-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--duration-slow) var(--ease-out);
        }

        .section-content.expanded {
          max-height: 1000px;
        }

        .settings-list {
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg) 0;
          border-bottom: 1px solid var(--color-borderSubtle);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
        }

        .setting-label {
          display: block;
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          color: var(--color-textPrimary);
          margin-bottom: var(--spacing-xs);
        }

        .setting-description {
          font-size: var(--text-sm);
          color: var(--color-textSecondary);
          margin: 0;
        }

        .setting-control {
          flex-shrink: 0;
        }

        /* Toggle Switch */
        .toggle-setting {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          cursor: pointer;
        }

        .toggle-input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--color-border);
          border-radius: var(--radius-full);
          transition: all var(--duration-normal) var(--ease-out);
        }

        .toggle-slider::before {
          position: absolute;
          content: '';
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: all var(--duration-normal) var(--ease-out);
          box-shadow: var(--shadow-sm);
        }

        .toggle-input:checked + .toggle-slider {
          background: var(--color-primary);
        }

        .toggle-input:checked + .toggle-slider::before {
          transform: translateX(24px);
        }

        /* Select Input */
        .select-input {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-textPrimary);
          font-size: var(--text-sm);
          min-width: 150px;
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
        }

        .select-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-focus);
        }

        /* Slider */
        .slider-setting {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          min-width: 150px;
        }

        .slider-input {
          flex: 1;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--color-border);
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: none;
          box-shadow: var(--shadow-sm);
        }

        .slider-value {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--color-textPrimary);
          min-width: 30px;
          text-align: center;
        }

        /* Quick Actions */
        .quick-actions {
          margin-top: var(--spacing-4xl);
        }

        .quick-actions-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--color-textPrimary);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .enhanced-settings {
            padding: var(--spacing-lg);
          }

          .settings-header {
            flex-direction: column;
            gap: var(--spacing-lg);
          }

          .search-container {
            min-width: auto;
            width: 100%;
          }

          .settings-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .setting-item {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-settings,
          .setting-section,
          .section-content,
          .toggle-slider,
          .chevron {
            transition: none;
            animation: none;
          }

          .setting-section:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .toggle-slider,
          .select-input {
            border-width: 3px;
          }
        }

        /* Performance optimization */
        .setting-section {
          contain: layout style paint;
        }

        .section-content {
          will-change: max-height;
        }
      `}</style>
    </div>
  );
}