'use client';

import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import AdvancedModal from './AdvancedModal';

/**
 * Theme Selector Component
 * Allows users to choose from 8+ premium themes
 */

export interface Theme {
  id: string;
  name: string;
  preview: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    preview: {
      primary: '#ffffff',
      secondary: '#f3f4f6',
      tertiary: '#3b82f6'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    preview: {
      primary: '#1f2937',
      secondary: '#111827',
      tertiary: '#3b82f6'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    preview: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      tertiary: '#14b8a6'
    }
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    preview: {
      primary: '#f97316',
      secondary: '#fb923c',
      tertiary: '#fb7185'
    }
  },
  {
    id: 'forest-mystique',
    name: 'Forest Mystique',
    preview: {
      primary: '#10b981',
      secondary: '#34d399',
      tertiary: '#6ee7b7'
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    preview: {
      primary: '#a855f7',
      secondary: '#c084fc',
      tertiary: '#e9d5ff'
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    preview: {
      primary: '#ec4899',
      secondary: '#f472b6',
      tertiary: '#fbbf24'
    }
  },
  {
    id: 'midnight-galaxy',
    name: 'Midnight Galaxy',
    preview: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      tertiary: '#a855f7'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    preview: {
      primary: '#ff006e',
      secondary: '#8338ec',
      tertiary: '#06ffa5'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    preview: {
      primary: '#000000',
      secondary: '#374151',
      tertiary: '#6b7280'
    }
  },
  {
    id: 'aurora',
    name: 'Aurora',
    preview: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      tertiary: '#10b981'
    }
  }
];

export default function ThemeSelector({
  currentTheme = 'dark',
  onThemeChange
}: {
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);

    if (onThemeChange) {
      onThemeChange(themeId);
    }

    // Save to localStorage
    localStorage.setItem('echo-theme', themeId);
  };

  return (
    <>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover-scale transition-smooth focus-ring"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontWeight: 600,
          color: 'var(--fg)'
        }}
        aria-label="Change theme"
      >
        <Palette size={20} />
        <span>Themes</span>
      </button>

      {/* Theme Modal */}
      <AdvancedModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose Your Theme"
        size="lg"
        variant="premium"
        animation="scale"
      >
        <div className="theme-selector">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`theme-option ${selectedTheme === theme.id ? 'active' : ''}`}
            >
              <div className="theme-option-preview">
                {/* Preview */}
                <div
                  style={{
                    display: 'flex',
                    height: '100%'
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      background: theme.preview.primary
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: theme.preview.secondary
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      background: theme.preview.tertiary
                    }}
                  />
                </div>

                {/* Name */}
                <div className="theme-option-name">{theme.name}</div>

                {/* Selected Badge */}
                {selectedTheme === theme.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Check size={20} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid var(--accent)'
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong>Pro Tip:</strong> Each theme is carefully crafted with unique gradients and color schemes. Your
            choice is automatically saved and will persist across sessions.
          </p>
        </div>
      </AdvancedModal>
    </>
  );
}

/**
 * Compact Theme Switcher (for headers)
 */
export function CompactThemeSwitcher({
  currentTheme = 'dark',
  onThemeChange
}: {
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const popularThemes = THEMES.slice(0, 6);

  const handleThemeSelect = (themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('echo-theme', themeId);
    setIsExpanded(false);

    if (onThemeChange) {
      onThemeChange(themeId);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover-scale transition-smooth"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--fg)'
        }}
        aria-label="Theme switcher"
      >
        <Palette size={20} />
      </button>

      {isExpanded && (
        <div
          className="glass-premium animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--elevation-4)',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Quick Themes</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {popularThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className="hover-scale transition-smooth"
                style={{
                  padding: 0,
                  border: currentTheme === theme.id ? '2px solid var(--accent)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1'
                }}
                title={theme.name}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    height: '100%'
                  }}
                >
                  <div style={{ background: theme.preview.primary }} />
                  <div style={{ background: theme.preview.secondary }} />
                  <div style={{ background: theme.preview.tertiary }} />
                  <div style={{ background: theme.preview.primary }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
