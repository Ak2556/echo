'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';

function ToggleSwitch({ checked, onChange, label, description }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--settings-space-4)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', marginBottom: 'var(--settings-space-3)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', marginBottom: description ? 'var(--settings-space-1)' : 0 }}>{label}</div>
        {description && <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>{description}</div>}
      </div>
      <button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--settings-transition-normal)', flexShrink: 0, marginLeft: 'var(--settings-space-4)' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '10px', background: 'white', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'var(--settings-transition-normal)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      </button>
    </div>
  );
}

export function ContentSettings({ onBack }: { onBack?: () => void }) {
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [imageQuality, setImageQuality] = useState('high');
  const [contentFilter, setContentFilter] = useState('moderate');

  return (
    <SettingsSubPage title="Content Preferences" description="Control content filtering and recommendations" onBack={onBack}>
      <SettingsSection title="Content Filtering" description="Manage what content you see">
        <div style={{ marginBottom: 'var(--settings-space-4)' }}>
          <label style={{ fontSize: 'var(--settings-text-sm)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', display: 'block', marginBottom: 'var(--settings-space-2)' }}>Content Filter Level</label>
          <select value={contentFilter} onChange={(e) => setContentFilter(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: 'var(--settings-text-base)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>
            <option value="strict">Strict - Hide all sensitive content</option>
            <option value="moderate">Moderate - Show warnings for sensitive content</option>
            <option value="off">Off - Show all content</option>
          </select>
        </div>
        <ToggleSwitch checked={sensitiveContent} onChange={setSensitiveContent} label="Sensitive Content" description="Allow sensitive content in your feed" />
      </SettingsSection>

      <SettingsSection title="Media Preferences" description="Control how media is displayed">
        <div style={{ marginBottom: 'var(--settings-space-4)' }}>
          <label style={{ fontSize: 'var(--settings-text-sm)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', display: 'block', marginBottom: 'var(--settings-space-2)' }}>Image Quality</label>
          <select value={imageQuality} onChange={(e) => setImageQuality(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: 'var(--settings-text-base)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>
            <option value="auto">Auto - Adapt to connection</option>
            <option value="high">High Quality</option>
            <option value="low">Data Saver</option>
          </select>
        </div>
        <ToggleSwitch checked={autoplayVideos} onChange={setAutoplayVideos} label="Autoplay Videos" description="Automatically play videos in your feed" />
      </SettingsSection>

      <div style={{ display: 'flex', gap: 'var(--settings-space-4)', paddingTop: 'var(--settings-space-8)', borderTop: '1px solid var(--echo-border-light)' }}>
        <button style={{ padding: '12px 24px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'transparent', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>Reset to Defaults</button>
        <button style={{ padding: '12px 32px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)', borderRadius: 'var(--settings-radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>Save Changes</button>
      </div>
    </SettingsSubPage>
  );
}
