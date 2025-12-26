'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { useSettings } from '@/contexts/SettingsContext';
import { Bell, BellOff, Volume2, VolumeX, Mail, Check } from 'lucide-react';

interface ChannelCardProps {
  icon: React.ReactNode;
  iconOff: React.ReactNode;
  title: string;
  enabled: boolean;
  onClick: () => void;
}

function ChannelCard({
  icon,
  iconOff,
  title,
  enabled,
  onClick,
}: ChannelCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--settings-space-6)',
        borderRadius: 'var(--settings-radius-lg)',
        border: enabled
          ? '2px solid var(--echo-primary)'
          : '1px solid var(--echo-border-light)',
        background: enabled
          ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.08), rgba(0, 102, 255, 0.03))'
          : 'var(--echo-bg-primary)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        position: 'relative' as const,
      }}
      onMouseEnter={(e) => {
        if (!enabled) {
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
          background: enabled
            ? 'rgba(0, 102, 255, 0.12)'
            : 'var(--echo-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--settings-space-4)',
        }}
      >
        {enabled ? icon : iconOff}
      </div>
      <div
        style={{
          fontSize: 'var(--settings-text-base)',
          fontWeight: 'var(--settings-weight-semibold)',
          color: 'var(--echo-text-primary)',
          marginBottom: 'var(--settings-space-2)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 'var(--settings-text-sm)',
          color: enabled ? 'var(--echo-primary)' : 'var(--echo-text-secondary)',
          fontWeight: 'var(--settings-weight-medium)',
        }}
      >
        {enabled ? '✓ Enabled' : 'Disabled'}
      </div>
    </button>
  );
}

function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}) {
  const color = type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
  const bg =
    type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: bg,
        border: `1.5px solid ${color}`,
        color,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <Check size={20} />
      <div style={{ flex: 1, fontSize: '15px', fontWeight: 500 }}>
        {message}
      </div>
    </div>
  );
}

export function FunctionalNotificationsSettings({
  onBack,
}: {
  onBack?: () => void;
}) {
  const { settings, updateSetting } = useSettings();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleSave = () => {
    setToast({ message: 'Settings saved successfully!', type: 'success' });
  };

  const handleReset = () => {
    if (confirm('Reset all notification settings to defaults?')) {
      updateSetting('pushNotifications', false);
      updateSetting('emailNotifications', true);
      updateSetting('soundEffects', true);
      setToast({ message: 'Settings reset to defaults', type: 'success' });
    }
  };

  return (
    <>
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
            <ChannelCard
              icon={<Bell size={24} color="var(--echo-primary)" />}
              iconOff={<BellOff size={24} color="var(--echo-text-secondary)" />}
              title="Push Notifications"
              enabled={settings.pushNotifications}
              onClick={() =>
                updateSetting('pushNotifications', !settings.pushNotifications)
              }
            />
            <ChannelCard
              icon={<Mail size={24} color="var(--echo-primary)" />}
              iconOff={<Mail size={24} color="var(--echo-text-secondary)" />}
              title="Email Notifications"
              enabled={settings.emailNotifications}
              onClick={() =>
                updateSetting(
                  'emailNotifications',
                  !settings.emailNotifications
                )
              }
            />
            <ChannelCard
              icon={<Volume2 size={24} color="var(--echo-primary)" />}
              iconOff={<VolumeX size={24} color="var(--echo-text-secondary)" />}
              title="Notification Sounds"
              enabled={settings.soundEffects}
              onClick={() =>
                updateSetting('soundEffects', !settings.soundEffects)
              }
            />
          </div>
        </SettingsSection>

        {/* Info Panel */}
        <div
          style={{
            padding: 'var(--settings-space-6)',
            borderRadius: 'var(--settings-radius-lg)',
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginTop: 'var(--settings-space-6)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--settings-text-sm)',
              color: 'var(--echo-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            💡 <strong>Tip:</strong> Settings are automatically saved when you
            make changes. All preferences are stored locally and persist across
            sessions.
          </div>
        </div>

        {/* Action Buttons */}
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
            onClick={handleReset}
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
            onClick={handleSave}
            style={{
              padding: '14px 36px',
              fontSize: 'var(--settings-text-base)',
              fontWeight: 'var(--settings-weight-semibold)',
              borderRadius: 'var(--settings-radius-lg)',
              border: 'none',
              background:
                'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: 'auto',
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(0, 102, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 102, 255, 0.25)';
            }}
          >
            Confirm Settings
          </button>
        </div>
      </SettingsSubPage>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
