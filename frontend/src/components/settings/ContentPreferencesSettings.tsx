'use client';
import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';

function ToggleSwitch({ checked, onChange, label, description }: any) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--settings-space-4)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', marginBottom: 'var(--settings-space-3)' }}><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', marginBottom: description ? 'var(--settings-space-1)' : 0 }}>{label}</div>{description && <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>{description}</div>}</div><button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--settings-transition-normal)', flexShrink: 0, marginLeft: 'var(--settings-space-4)' }}><div style={{ width: '20px', height: '20px', borderRadius: '10px', background: 'white', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'var(--settings-transition-normal)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} /></button></div>;
}

export function ContentPreferencesSettings({ onBack }: { onBack?: () => void }) {
  const [autoplay, setAutoplay] = useState(true);
  const [nsfwFilter, setNsfwFilter] = useState(true);
  const [recommendations, setRecommendations] = useState(true);

  return (
    <SettingsSubPage title="Content Preferences" description="Customize what content you see and how it's displayed" onBack={onBack}>
      <SettingsSection title="Content Display"><ToggleSwitch checked={autoplay} onChange={setAutoplay} label="Autoplay Videos" description="Automatically play videos in feed" /><ToggleSwitch checked={nsfwFilter} onChange={setNsfwFilter} label="Content Filter" description="Filter sensitive content" /><ToggleSwitch checked={recommendations} onChange={setRecommendations} label="Personalized Recommendations" description="Show content based on your interests" /></SettingsSection>
      <div style={{ display: 'flex', gap: 'var(--settings-space-4)', paddingTop: 'var(--settings-space-8)', borderTop: '1px solid var(--echo-border-light)' }}><button style={{ padding: '12px 24px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'transparent', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>Reset</button><button style={{ padding: '12px 32px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)', borderRadius: 'var(--settings-radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>Save Changes</button></div>
    </SettingsSubPage>
  );
}
