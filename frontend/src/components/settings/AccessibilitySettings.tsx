'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';

function ToggleSwitch({ checked, onChange, label, description }: any) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 'var(--settings-space-4)',
        borderRadius: 'var(--settings-radius-md)',
        border: '1px solid var(--echo-border-light)',
        background: 'var(--echo-bg-primary)',
        marginBottom: 'var(--settings-space-3)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-medium)',
            color: 'var(--echo-text-primary)',
            marginBottom: description ? 'var(--settings-space-1)' : 0,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: 'var(--settings-text-sm)',
              color: 'var(--echo-text-secondary)',
            }}
          >
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: checked
            ? 'var(--echo-primary)'
            : 'var(--echo-border-medium)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'var(--settings-transition-normal)',
          flexShrink: 0,
          marginLeft: 'var(--settings-space-4)',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '10px',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            transition: 'var(--settings-transition-normal)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </button>
    </div>
  );
}

export function AccessibilitySettings({ onBack }: { onBack?: () => void }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [focusIndicators, setFocusIndicators] = useState(true);
  const [fontScale, setFontScale] = useState(100);

  return (
    <SettingsSubPage
      title="Accessibility"
      description="Customize accessibility features and preferences"
      onBack={onBack}
    >
      <SettingsSection
        title="Visual Preferences"
        description="Adjust visual settings for better readability"
      >
        <ToggleSwitch
          checked={reducedMotion}
          onChange={setReducedMotion}
          label="Reduce Motion"
          description="Minimize animations and transitions"
        />
        <ToggleSwitch
          checked={highContrast}
          onChange={setHighContrast}
          label="High Contrast Mode"
          description="Increase contrast for better visibility"
        />
        <div style={{ marginTop: 'var(--settings-space-6)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--settings-space-2)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--settings-text-base)',
                fontWeight: 'var(--settings-weight-medium)',
              }}
            >
              Font Scale
            </span>
            <span
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: 'var(--echo-text-secondary)',
              }}
            >
              {fontScale}%
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="150"
            step="10"
            value={fontScale}
            onChange={(e) => setFontScale(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Navigation & Input"
        description="Control how you interact with the app"
      >
        <ToggleSwitch
          checked={keyboardNav}
          onChange={setKeyboardNav}
          label="Keyboard Navigation"
          description="Enable full keyboard navigation support"
        />
        <ToggleSwitch
          checked={focusIndicators}
          onChange={setFocusIndicators}
          label="Focus Indicators"
          description="Show visible focus indicators for interactive elements"
        />
        <ToggleSwitch
          checked={screenReader}
          onChange={setScreenReader}
          label="Screen Reader Optimization"
          description="Optimize content for screen readers"
        />
      </SettingsSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--settings-space-4)',
          paddingTop: 'var(--settings-space-8)',
          borderTop: '1px solid var(--echo-border-light)',
        }}
      >
        <button
          style={{
            padding: '12px 24px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-medium)',
            borderRadius: 'var(--settings-radius-md)',
            border: '1px solid var(--echo-border-light)',
            background: 'transparent',
            color: 'var(--echo-text-primary)',
            cursor: 'pointer',
          }}
        >
          Reset to Defaults
        </button>
        <button
          style={{
            padding: '12px 32px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-semibold)',
            borderRadius: 'var(--settings-radius-md)',
            border: 'none',
            background:
              'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
            color: 'white',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Save Changes
        </button>
      </div>
    </SettingsSubPage>
  );
}
