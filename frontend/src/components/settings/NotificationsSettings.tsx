'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { Bell, BellOff, Volume2, VolumeX, Smartphone, Mail } from 'lucide-react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
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
              lineHeight: 'var(--settings-leading-relaxed)',
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
          background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)',
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

export function NotificationsSettings({ onBack }: { onBack?: () => void }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [badges, setBadges] = useState(true);

  // Notification types
  const [mentions, setMentions] = useState(true);
  const [comments, setComments] = useState(true);
  const [likes, setLikes] = useState(false);
  const [follows, setFollows] = useState(true);
  const [messages, setMessages] = useState(true);
  const [updates, setUpdates] = useState(false);

  return (
    <SettingsSubPage
      title="Notifications"
      description="Manage alerts, sounds, and notification preferences"
      onBack={onBack}
    >
      {/* Notification Channels */}
      <SettingsSection
        title="Notification Channels"
        description="Choose how you want to receive notifications"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          <button
            onClick={() => setPushEnabled(!pushEnabled)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-md)',
              border: pushEnabled ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: pushEnabled ? 'rgba(0, 102, 255, 0.05)' : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'var(--settings-transition-normal)',
              textAlign: 'left',
            }}
          >
            {pushEnabled ? <Bell size={24} color="var(--echo-primary)" /> : <BellOff size={24} color="var(--echo-text-secondary)" />}
            <div style={{ marginTop: 'var(--settings-space-3)', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)' }}>
              Push Notifications
            </div>
            <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)', marginTop: 'var(--settings-space-1)' }}>
              {pushEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </button>

          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-md)',
              border: emailEnabled ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: emailEnabled ? 'rgba(0, 102, 255, 0.05)' : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'var(--settings-transition-normal)',
              textAlign: 'left',
            }}
          >
            <Mail size={24} color={emailEnabled ? 'var(--echo-primary)' : 'var(--echo-text-secondary)'} />
            <div style={{ marginTop: 'var(--settings-space-3)', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)' }}>
              Email Notifications
            </div>
            <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)', marginTop: 'var(--settings-space-1)' }}>
              {emailEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-md)',
              border: soundEnabled ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: soundEnabled ? 'rgba(0, 102, 255, 0.05)' : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'var(--settings-transition-normal)',
              textAlign: 'left',
            }}
          >
            {soundEnabled ? <Volume2 size={24} color="var(--echo-primary)" /> : <VolumeX size={24} color="var(--echo-text-secondary)" />}
            <div style={{ marginTop: 'var(--settings-space-3)', fontSize: 'var(--settings-text-base)', fontWeight: 'var(--settings-weight-semibold)' }}>
              Sounds
            </div>
            <div style={{ fontSize: 'var(--settings-text-sm)', color: 'var(--echo-text-secondary)', marginTop: 'var(--settings-space-1)' }}>
              {soundEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </button>
        </div>
      </SettingsSection>

      {/* Notification Types */}
      <SettingsSection
        title="Notification Types"
        description="Choose which activities trigger notifications"
      >
        <ToggleSwitch
          checked={mentions}
          onChange={setMentions}
          label="Mentions"
          description="When someone mentions you in a post or comment"
        />
        <ToggleSwitch
          checked={comments}
          onChange={setComments}
          label="Comments"
          description="When someone comments on your posts"
        />
        <ToggleSwitch
          checked={likes}
          onChange={setLikes}
          label="Likes"
          description="When someone likes your posts or comments"
        />
        <ToggleSwitch
          checked={follows}
          onChange={setFollows}
          label="New Followers"
          description="When someone follows you"
        />
        <ToggleSwitch
          checked={messages}
          onChange={setMessages}
          label="Direct Messages"
          description="When you receive a new message"
        />
        <ToggleSwitch
          checked={updates}
          onChange={setUpdates}
          label="Product Updates"
          description="News about new features and improvements"
        />
      </SettingsSection>

      {/* Advanced Settings */}
      <SettingsSection
        title="Advanced Settings"
        description="Additional notification preferences"
      >
        <ToggleSwitch
          checked={badges}
          onChange={setBadges}
          label="Badge Count"
          description="Show unread count on app icon"
        />
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
