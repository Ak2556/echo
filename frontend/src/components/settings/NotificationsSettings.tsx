'use client';

import React, { useState, useEffect } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mail,
  AtSign,
  MessageCircle,
  Heart,
  UserPlus,
  Send,
  Sparkles,
  Hash,
  Check,
  X,
} from 'lucide-react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

function ToggleSwitch({ checked, onChange, label, description, icon }: ToggleSwitchProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--settings-space-5)',
        borderRadius: 'var(--settings-radius-lg)',
        border: checked ? '1.5px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
        background: checked ? 'rgba(0, 102, 255, 0.03)' : 'var(--echo-bg-primary)',
        marginBottom: 'var(--settings-space-3)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--settings-space-4)', flex: 1 }}>
        {icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--settings-radius-md)',
              background: checked ? 'rgba(0, 102, 255, 0.1)' : 'var(--echo-bg-secondary)',
              color: checked ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 'var(--settings-text-base)',
              fontWeight: 'var(--settings-weight-semibold)',
              color: 'var(--echo-text-primary)',
              marginBottom: description ? '4px' : 0,
            }}
          >
            {label}
          </div>
          {description && (
            <div
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: 'var(--echo-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          background: checked ? 'var(--echo-primary)' : 'var(--echo-border-medium)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          marginLeft: 'var(--settings-space-4)',
          boxShadow: checked ? '0 2px 8px rgba(0, 102, 255, 0.3)' : 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '11px',
            background: 'white',
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        />
      </button>
    </div>
  );
}

export function NotificationsSettings({ onBack }: { onBack?: () => void }) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track if settings have changed
  useEffect(() => {
    setHasChanges(true);
  }, [settings.pushNotifications, settings.emailNotifications, settings.soundEffects]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      // Reset only notification-related settings
      updateSetting('pushNotifications', false);
      updateSetting('emailNotifications', true);
      updateSetting('soundEffects', true);
      setShowToast({ message: 'Settings reset to defaults', type: 'success' });
      setHasChanges(false);
    }
  };

  const handleSave = () => {
    // Settings are auto-saved via context, just show confirmation
    setShowToast({ message: 'Settings saved successfully!', type: 'success' });
    setHasChanges(false);
  };

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--settings-space-5)',
          }}
        >
          <button
            onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-lg)',
              border: settings.pushNotifications ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: settings.pushNotifications
                ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.08), rgba(0, 102, 255, 0.03))'
                : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative' as const,
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!settings.pushNotifications) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--settings-radius-md)',
                background: settings.pushNotifications ? 'rgba(0, 102, 255, 0.12)' : 'var(--echo-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--settings-space-4)',
              }}
            >
              {settings.pushNotifications ? <Bell size={24} color="var(--echo-primary)" /> : <BellOff size={24} color="var(--echo-text-secondary)" />}
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-base)',
                fontWeight: 'var(--settings-weight-semibold)',
                color: 'var(--echo-text-primary)',
                marginBottom: 'var(--settings-space-2)',
              }}
            >
              Push Notifications
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: settings.pushNotifications ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
                fontWeight: 'var(--settings-weight-medium)',
              }}
            >
              {settings.pushNotifications ? '✓ Enabled' : 'Disabled'}
            </div>
          </button>

          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-lg)',
              border: emailEnabled ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: emailEnabled
                ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.08), rgba(0, 102, 255, 0.03))'
                : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative' as const,
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!emailEnabled) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--settings-radius-md)',
                background: emailEnabled ? 'rgba(0, 102, 255, 0.12)' : 'var(--echo-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--settings-space-4)',
              }}
            >
              <Mail size={24} color={emailEnabled ? 'var(--echo-primary)' : 'var(--echo-text-secondary)'} />
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-base)',
                fontWeight: 'var(--settings-weight-semibold)',
                color: 'var(--echo-text-primary)',
                marginBottom: 'var(--settings-space-2)',
              }}
            >
              Email Notifications
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: emailEnabled ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
                fontWeight: 'var(--settings-weight-medium)',
              }}
            >
              {emailEnabled ? '✓ Enabled' : 'Disabled'}
            </div>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: 'var(--settings-space-6)',
              borderRadius: 'var(--settings-radius-lg)',
              border: soundEnabled ? '2px solid var(--echo-primary)' : '1px solid var(--echo-border-light)',
              background: soundEnabled
                ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.08), rgba(0, 102, 255, 0.03))'
                : 'var(--echo-bg-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative' as const,
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!soundEnabled) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--settings-radius-md)',
                background: soundEnabled ? 'rgba(0, 102, 255, 0.12)' : 'var(--echo-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--settings-space-4)',
              }}
            >
              {soundEnabled ? <Volume2 size={24} color="var(--echo-primary)" /> : <VolumeX size={24} color="var(--echo-text-secondary)" />}
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-base)',
                fontWeight: 'var(--settings-weight-semibold)',
                color: 'var(--echo-text-primary)',
                marginBottom: 'var(--settings-space-2)',
              }}
            >
              Notification Sounds
            </div>
            <div
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: soundEnabled ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
                fontWeight: 'var(--settings-weight-medium)',
              }}
            >
              {soundEnabled ? '✓ Enabled' : 'Disabled'}
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
          icon={<AtSign size={20} />}
        />
        <ToggleSwitch
          checked={comments}
          onChange={setComments}
          label="Comments"
          description="When someone comments on your posts"
          icon={<MessageCircle size={20} />}
        />
        <ToggleSwitch
          checked={likes}
          onChange={setLikes}
          label="Likes"
          description="When someone likes your posts or comments"
          icon={<Heart size={20} />}
        />
        <ToggleSwitch
          checked={follows}
          onChange={setFollows}
          label="New Followers"
          description="When someone follows you"
          icon={<UserPlus size={20} />}
        />
        <ToggleSwitch
          checked={messages}
          onChange={setMessages}
          label="Direct Messages"
          description="When you receive a new message"
          icon={<Send size={20} />}
        />
        <ToggleSwitch
          checked={updates}
          onChange={setUpdates}
          label="Product Updates"
          description="News about new features and improvements"
          icon={<Sparkles size={20} />}
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
          icon={<Hash size={20} />}
        />
      </SettingsSection>

      {/* Save Button */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--settings-space-4)',
          paddingTop: 'var(--settings-space-8)',
          borderTop: '1px solid var(--echo-border-light)',
          marginTop: 'var(--settings-space-6)',
        }}
      >
        <button
          style={{
            padding: '14px 28px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-medium)',
            borderRadius: 'var(--settings-radius-lg)',
            border: '1.5px solid var(--echo-border-medium)',
            background: 'var(--echo-bg-primary)',
            color: 'var(--echo-text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--echo-primary)';
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--echo-border-medium)';
            e.currentTarget.style.background = 'var(--echo-bg-primary)';
          }}
        >
          Reset to Defaults
        </button>

        <button
          style={{
            padding: '14px 36px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-semibold)',
            borderRadius: 'var(--settings-radius-lg)',
            border: 'none',
            background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginLeft: 'auto',
            boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 102, 255, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.25)';
          }}
        >
          Save Changes
        </button>
      </div>
    </SettingsSubPage>
  );
}
