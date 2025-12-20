'use client';
import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
function ToggleSwitch({ checked, onChange, label, description }: any) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--settings-space-4)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', marginBottom: 'var(--settings-space-3)' }}><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', marginBottom: description ? 'var(--settings-space-1)' : 0 }}>{label}</div>{description && <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)' }}>{description}</div>}</div><button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--settings-transition-normal)', flexShrink: 0, marginLeft: 'var(--settings-space-4)' }}><div style={{ width: '20px', height: '20px', borderRadius: '10px', background: 'white', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'var(--settings-transition-normal)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} /></button></div>;
}
export function DeveloperSettings({ onBack }: { onBack?: () => void }) {
  const [debugMode, setDebugMode] = useState(false);
  const [apiLogs, setApiLogs] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(false);
  return (
    <SettingsSubPage title="Developer Options" description="Advanced settings for developers and power users" onBack={onBack}>
      <SettingsSection title="Debug Tools"><ToggleSwitch checked={debugMode} onChange={setDebugMode} label="Debug Mode" description="Enable debugging features" /><ToggleSwitch checked={apiLogs} onChange={setApiLogs} label="API Logging" description="Log API requests and responses" /><ToggleSwitch checked={performanceMetrics} onChange={setPerformanceMetrics} label="Performance Metrics" description="Show performance indicators" /></SettingsSection>
      <div style={{ padding: 'var(--settings-space-4)', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 'var(--settings-radius-md)', fontSize: 'var(--settings-text-sm)' }}><strong>⚠️ Warning:</strong> Developer options are for advanced users only. Changing these settings may affect app stability.</div>
      <div style={{ display: 'flex', gap: 'var(--settings-space-4)', paddingTop: 'var(--settings-space-8)', borderTop: '1px solid var(--echo-border-light)' }}><button style={{ padding: '12px 24px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'transparent', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>Reset</button><button style={{ padding: '12px 32px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)', borderRadius: 'var(--settings-radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>Save Changes</button></div>
    </SettingsSubPage>
  );
}
