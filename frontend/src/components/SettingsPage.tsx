'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SettingsGrid } from './settings/SettingsGrid';
import { AppearanceSettings } from './settings/AppearanceSettings';

type SettingsSection =
  | 'main'
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
  const { colorMode } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSectionClick = (section: string) => {
    setActiveSection(section as SettingsSection);
  };

  const handleBack = () => {
    setActiveSection('main');
  };

  // Render sub-page if a section is active
  if (activeSection === 'appearance') {
    return <AppearanceSettings onBack={handleBack} />;
  }

  // If other sections are clicked, show placeholder for now
  if (activeSection !== 'main') {
    return (
      <div className="echo-settings-container">
        <div className="echo-settings-header">
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              fontSize: 'var(--settings-text-sm)',
              color: 'var(--echo-primary)',
            }}
          >
            ← Back to Settings
          </button>
          <h1 className="echo-settings-title" style={{ textTransform: 'capitalize' }}>
            {activeSection}
          </h1>
          <p className="echo-settings-description">
            This settings page is coming soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section id="settings" className="echo-section">
      <div className="echo-settings-container">
        {/* Header */}
        <div className="echo-settings-header echo-animate-wave-in">
          <div className="echo-settings-title-group">
            <div>
              <h1 className="echo-settings-title">Settings</h1>
              <p className="echo-settings-description">
                Manage your account preferences and customize your Echo experience
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="echo-settings-search">
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="echo-settings-search-input"
            />
            <kbd className="echo-settings-search-kbd">⌘K</kbd>
          </div>
        </div>

        {/* Settings Grid */}
        <SettingsGrid onSectionClick={handleSectionClick} />

        {/* Info Panel */}
        <div className="echo-settings-info-panel">
          <div className="echo-settings-info-icon">⚙️</div>
          <h3 className="echo-settings-info-title">Modern Settings Experience</h3>
          <p className="echo-settings-info-description">
            Click any category card above to access detailed settings for that section.
            Each category provides comprehensive controls tailored to your needs.
          </p>

          {/* Stats Grid */}
          <div className="echo-settings-stats">
            <div className="echo-settings-stat">
              <div className="echo-settings-stat-value">12</div>
              <div className="echo-settings-stat-label">Categories</div>
            </div>

            <div className="echo-settings-stat">
              <div className="echo-settings-stat-value">100+</div>
              <div className="echo-settings-stat-label">Settings</div>
            </div>

            <div className="echo-settings-stat">
              <div className="echo-settings-stat-value">24/7</div>
              <div className="echo-settings-stat-label">Customization</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="echo-settings-footer">
          <div className="echo-settings-version">
            Echo v2.1.0 • Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="echo-settings-credit">
            Premium Settings Experience
          </div>
        </div>
      </div>
    </section>
  );
}
