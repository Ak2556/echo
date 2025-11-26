'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface ThemeSettingsProps {
  className?: string;
}

export default function ThemeSettings({ className = '' }: ThemeSettingsProps) {
  const {
    colorMode,
    setColorMode,
  } = useTheme();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'appearance' | 'accessibility' | 'schedule' | 'advanced'>('appearance');

  const handleThemeChange = (mode: 'auto' | 'light' | 'dark') => {
    setColorMode(mode);
    toast.success(`Theme changed to ${mode} mode`);
  };

  return (
    <div className={`theme-settings ${className}`}>
      <div className="theme-settings-header">
        <h2>Theme Settings</h2>
        <p>Customize your visual experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {[
          { id: 'appearance', label: 'Appearance', icon: '🎨' },
          { id: 'accessibility', label: 'Accessibility', icon: '♿' },
          { id: 'schedule', label: 'Schedule', icon: '⏰' },
          { id: 'advanced', label: 'Advanced', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="appearance-settings">
            <div className="setting-group">
              <h3>Theme Mode</h3>
              <p>Choose how Echo should appear</p>

              <div className="theme-mode-selector">
                {[
                  { value: 'auto', label: 'Auto', description: 'Follow system preference' },
                  { value: 'light', label: 'Light', description: 'Always use light mode' },
                  { value: 'dark', label: 'Dark', description: 'Always use dark mode' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => handleThemeChange(mode.value as any)}
                    className={`mode-option ${colorMode === mode.value ? 'active' : ''}`}
                  >
                    <div className="mode-preview">
                      <div className={`preview-circle ${mode.value}`}></div>
                    </div>
                    <div className="mode-info">
                      <span className="mode-label">{mode.label}</span>
                      <span className="mode-description">{mode.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div className="accessibility-settings">
            <div className="setting-group">
              <h3>Accessibility Options</h3>
              <p>Configure accessibility preferences</p>
              <p className="coming-soon">Coming soon...</p>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-settings">
            <div className="setting-group">
              <h3>Automatic Theme Switching</h3>
              <p>Schedule theme changes</p>
              <p className="coming-soon">Coming soon...</p>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="advanced-settings">
            <div className="setting-group">
              <h3>Advanced Settings</h3>
              <p>Import/export theme configuration</p>
              <p className="coming-soon">Coming soon...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .theme-settings {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .theme-settings-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .theme-settings-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--fg);
        }

        .theme-settings-header p {
          margin: 0;
          color: var(--muted);
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          background: var(--hover);
          color: var(--fg);
        }

        .tab-button.active {
          background: var(--accent);
          color: white;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-content {
          min-height: 400px;
        }

        .setting-group {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .setting-group h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--fg);
        }

        .setting-group > p {
          margin: 0 0 1rem 0;
          color: var(--muted);
          font-size: 0.875rem;
        }

        .theme-mode-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-option:hover {
          border-color: var(--accent);
        }

        .mode-option.active {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, var(--bg));
        }

        .mode-preview {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .preview-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .preview-circle.auto {
          background: linear-gradient(90deg, #ffffff 50%, #000000 50%);
        }

        .preview-circle.light {
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .preview-circle.dark {
          background: #0f172a;
        }

        .mode-info {
          flex: 1;
        }

        .mode-label {
          display: block;
          font-weight: 500;
          color: var(--fg);
          margin-bottom: 0.25rem;
        }

        .mode-description {
          display: block;
          font-size: 0.875rem;
          color: var(--muted);
        }

        .coming-soon {
          padding: 1rem;
          text-align: center;
          color: var(--muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .theme-settings {
            padding: 1rem;
          }

          .tab-navigation {
            flex-direction: column;
          }

          .tab-button {
            justify-content: flex-start;
          }

          .theme-mode-selector {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
