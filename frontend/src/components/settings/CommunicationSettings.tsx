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

export function CommunicationSettings({ onBack }: { onBack?: () => void }) {
  const [allowDMs, setAllowDMs] = useState('everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [messageRequests, setMessageRequests] = useState(true);
  const [groupInvites, setGroupInvites] = useState('friends');

  return (
    <SettingsSubPage title="Communication" description="Manage messaging and interaction settings" onBack={onBack}>
      <SettingsSection title="Direct Messages" description="Control who can send you messages">
        <div style={{ marginBottom: 'var(--settings-space-4)' }}>
          <label style={{ fontSize: 'var(--settings-text-sm)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', display: 'block', marginBottom: 'var(--settings-space-2)' }}>Who can message you?</label>
          <select value={allowDMs} onChange={(e) => setAllowDMs(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: 'var(--settings-text-base)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>
            <option value="everyone">Everyone</option>
            <option value="friends">Friends Only</option>
            <option value="no-one">No One</option>
          </select>
        </div>
        <ToggleSwitch checked={messageRequests} onChange={setMessageRequests} label="Message Requests" description="Receive requests from people you don't follow" />
      </SettingsSection>

      <SettingsSection title="Message Indicators" description="Control what others see when you're messaging">
        <ToggleSwitch checked={readReceipts} onChange={setReadReceipts} label="Read Receipts" description="Show when you've read messages" />
        <ToggleSwitch checked={typingIndicators} onChange={setTypingIndicators} label="Typing Indicators" description="Show when you're typing a message" />
      </SettingsSection>

      <SettingsSection title="Group Settings" description="Manage group chat preferences">
        <div style={{ marginBottom: 'var(--settings-space-4)' }}>
          <label style={{ fontSize: 'var(--settings-text-sm)', fontWeight: 'var(--settings-weight-medium)', color: 'var(--echo-text-primary)', display: 'block', marginBottom: 'var(--settings-space-2)' }}>Who can add you to groups?</label>
          <select value={groupInvites} onChange={(e) => setGroupInvites(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: 'var(--settings-text-base)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'var(--echo-bg-primary)', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>
            <option value="everyone">Everyone</option>
            <option value="friends">Friends Only</option>
            <option value="no-one">No One</option>
          </select>
        </div>
      </SettingsSection>

      <div style={{ display: 'flex', gap: 'var(--settings-space-4)', paddingTop: 'var(--settings-space-8)', borderTop: '1px solid var(--echo-border-light)' }}>
        <button style={{ padding: '12px 24px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-medium)', borderRadius: 'var(--settings-radius-md)', border: '1px solid var(--echo-border-light)', background: 'transparent', color: 'var(--echo-text-primary)', cursor: 'pointer' }}>Reset to Defaults</button>
        <button style={{ padding: '12px 32px', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)', borderRadius: 'var(--settings-radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>Save Changes</button>
      </div>
    </SettingsSubPage>
  );
}
