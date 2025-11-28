'use client';
import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
function ToggleSwitch({ checked, onChange, label, description }: any) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--settings-space-4)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', marginBottom: 'var(--settings-space-3)' }}><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', marginBottom: description ? 'var(--settings-space-1)' : 0 }}>{label}</div>{description && <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>{description}</div>}</div><button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--settings-transition-normal)', flexShrink: 0, marginLeft: 'var(--settings-space-4)' }}><div style={{ width: '20px', height: '20px', borderRadius: '10px', background: 'white', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'var(--settings-transition-normal)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} /></button></div>;
}
export function BackupSettings({ onBack }: { onBack?: () => void }) {
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);
  return (
    <SettingsSubPage title="Backup & Storage" description="Control data backup and storage options" onBack={onBack}>
      <SettingsSection title="Backup Preferences"><ToggleSwitch checked={autoBackup} onChange={setAutoBackup} label="Automatic Backup" description="Back up your data automatically" /><ToggleSwitch checked={cloudSync} onChange={setCloudSync} label="Cloud Sync" description="Sync data across devices" /></SettingsSection>
      <div style={{ display: 'flex', gap: 'var(--settings-space-4)', paddingTop: 'var(--settings-space-8)', borderTop: '1px solid var(--echo-border-light)' }}><button style={{ padding: '12px 24px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'transparent', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>Reset</button><button style={{ padding: '12px 32px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)', borderRadius: 'var(--settings-radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>Save Changes</button></div>
    </SettingsSubPage>
  );
}
