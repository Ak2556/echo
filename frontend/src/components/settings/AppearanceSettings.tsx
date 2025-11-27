'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function AppearanceSettings({ onBack }: { onBack?: () => void }) {
  const { colorMode, toggleColorMode, colorPalette, setColorPalette } = useTheme();
  const [textSize, setTextSize] = useState(14);

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'system', name: 'System', icon: Monitor, description: 'Match your device' },
  ];

  const palettes = [
    { id: 'blue', name: 'Ocean Blue', primary: '#0066FF', accent: '#00D9FF' },
    { id: 'purple', name: 'Royal Purple', primary: '#7C3AED', accent: '#A78BFA' },
    { id: 'green', name: 'Forest Green', primary: '#059669', accent: '#34D399' },
    { id: 'red', name: 'Crimson Red', primary: '#DC2626', accent: '#F87171' },
    { id: 'orange', name: 'Sunset Orange', primary: '#EA580C', accent: '#FB923C' },
    { id: 'pink', name: 'Blossom Pink', primary: '#DB2777', accent: '#F472B6' },
  ];

  return (
    <SettingsSubPage
      title="Appearance"
      description="Customize colors, themes, and visual preferences"
      onBack={onBack}
    >
      {/* Theme Section */}
      <SettingsSection
        title="Theme"
        description="Choose your preferred color scheme"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isActive = colorMode === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (theme.id === 'light' || theme.id === 'dark') {
                    if (colorMode !== theme.id) {
                      toggleColorMode();
                    }
                  }
                }}
                style={{
                  padding: 'var(--settings-space-6)',
                  borderRadius: 'var(--settings-radius-md)',
                  border: isActive
                    ? '2px solid var(--echo-primary)'
                    : '1px solid var(--echo-border-light)',
                  background: isActive
                    ? 'rgba(0, 102, 255, 0.05)'
                    : 'var(--echo-bg-primary)',
                  cursor: 'pointer',
                  transition: 'var(--settings-transition-normal)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--echo-border-medium)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--echo-border-light)';
                  }
                }}
              >
                <Icon
                  size={24}
                  style={{
                    color: isActive ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
                    marginBottom: 'var(--settings-space-3)',
                  }}
                />
                <div
                  style={{
                    fontSize: 'var(--settings-text-base)',
                    fontWeight: 'var(--settings-weight-semibold)',
                    color: 'var(--echo-text-primary)',
                    marginBottom: 'var(--settings-space-1)',
                  }}
                >
                  {theme.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--settings-text-sm)',
                    color: 'var(--echo-text-secondary)',
                  }}
                >
                  {theme.description}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Color Palette Section */}
      <SettingsSection
        title="Color Palette"
        description="Select your preferred color scheme"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {palettes.map((palette) => {
            const isActive = colorPalette === palette.id;

            return (
              <button
                key={palette.id}
                onClick={() => setColorPalette(palette.id as any)}
                style={{
                  padding: 'var(--settings-space-4)',
                  borderRadius: 'var(--settings-radius-md)',
                  border: isActive
                    ? '2px solid var(--echo-primary)'
                    : '1px solid var(--echo-border-light)',
                  background: 'var(--echo-bg-primary)',
                  cursor: 'pointer',
                  transition: 'var(--settings-transition-normal)',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--settings-space-2)',
                    marginBottom: 'var(--settings-space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--settings-radius-sm)',
                      background: palette.primary,
                    }}
                  />
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--settings-radius-sm)',
                      background: palette.accent,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 'var(--settings-text-sm)',
                    fontWeight: 'var(--settings-weight-medium)',
                    color: 'var(--echo-text-primary)',
                  }}
                >
                  {palette.name}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Text Size Section */}
      <SettingsSection
        title="Text Size"
        description="Adjust the default text size across the app"
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--settings-space-4)',
            }}
          >
            <span style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>
              Small (12px)
            </span>
            <span
              style={{
                fontSize: `${textSize}px`,
                fontWeight: 'var(--settings-weight-semibold)',
                color: 'var(--echo-text-primary)',
              }}
            >
              Aa
            </span>
            <span style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>
              Large (18px)
            </span>
          </div>

          <input
            type="range"
            min="12"
            max="18"
            step="1"
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'var(--echo-border-light)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />

          <div
            style={{
              marginTop: 'var(--settings-space-6)',
              padding: 'var(--settings-space-6)',
              background: 'var(--echo-bg-secondary)',
              borderRadius: 'var(--settings-radius-md)',
              border: '1px solid var(--echo-border-light)',
            }}
          >
            <p style={{ fontSize: `${textSize}px`, lineHeight: '1.6' }}>
              The quick brown fox jumps over the lazy dog. This is a preview of how text will appear at your selected size.
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--settings-space-4)',
          paddingTop: 'var(--settings-space-8)',
          borderTop: '1px solid var(--echo-border-light)',
        }}
      >
        <button
          onClick={() => {
            // Reset to defaults
            setTextSize(14);
          }}
          style={{
            padding: '12px 24px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-medium)',
            borderRadius: 'var(--settings-radius-md)',
            border: '1px solid var(--echo-border-light)',
            background: 'transparent',
            color: 'var(--echo-text-primary)',
            cursor: 'pointer',
            transition: 'var(--settings-transition-normal)',
          }}
        >
          Reset to Defaults
        </button>

        <button
          onClick={() => {
            // Save changes
            console.log('Saved appearance settings');
          }}
          style={{
            padding: '12px 32px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-semibold)',
            borderRadius: 'var(--settings-radius-md)',
            border: 'none',
            background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
            color: 'white',
            cursor: 'pointer',
            transition: 'var(--settings-transition-normal)',
            marginLeft: 'auto',
          }}
        >
          Save Changes
        </button>
      </div>
    </SettingsSubPage>
  );
}
