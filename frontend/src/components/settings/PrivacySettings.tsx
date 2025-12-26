'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { Lock, Eye, EyeOff, Shield, Users, Globe } from 'lucide-react';

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

export function PrivacySettings({ onBack }: { onBack?: () => void }) {
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [searchable, setSearchable] = useState(true);
  const [tagApproval, setTagApproval] = useState(true);

  const visibilityOptions = [
    {
      id: 'public',
      name: 'Public',
      icon: Globe,
      description: 'Anyone can see your profile',
    },
    {
      id: 'friends',
      name: 'Friends Only',
      icon: Users,
      description: 'Only friends can see your content',
    },
    {
      id: 'private',
      name: 'Private',
      icon: Lock,
      description: 'Only you can see your profile',
    },
  ];

  return (
    <SettingsSubPage
      title="Privacy & Security"
      description="Control your privacy, data, and security settings"
      onBack={onBack}
    >
      <SettingsSection
        title="Profile Visibility"
        description="Choose who can see your profile and posts"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isActive = profileVisibility === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setProfileVisibility(option.id)}
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
              >
                <Icon
                  size={24}
                  style={{
                    color: isActive
                      ? 'var(--echo-primary)'
                      : 'var(--echo-text-secondary)',
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
                  {option.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--settings-text-sm)',
                    color: 'var(--echo-text-secondary)',
                  }}
                >
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Protect your account with additional security measures"
      >
        <ToggleSwitch
          checked={twoFactor}
          onChange={setTwoFactor}
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        />
        <div
          style={{
            padding: 'var(--settings-space-4)',
            background: 'var(--echo-bg-secondary)',
            borderRadius: 'var(--settings-radius-md)',
            border: '1px solid var(--echo-border-light)',
            marginTop: 'var(--settings-space-4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--settings-space-3)',
            }}
          >
            <Shield size={20} style={{ color: 'var(--echo-primary)' }} />
            <div>
              <div
                style={{
                  fontSize: 'var(--settings-text-sm)',
                  fontWeight: 'var(--settings-weight-medium)',
                  color: 'var(--echo-text-primary)',
                }}
              >
                Password Strength: Strong
              </div>
              <div
                style={{
                  fontSize: 'var(--settings-text-xs)',
                  color: 'var(--echo-text-secondary)',
                }}
              >
                Last changed 3 months ago
              </div>
            </div>
          </div>
          <button
            style={{
              marginTop: 'var(--settings-space-3)',
              padding: '8px 16px',
              fontSize: 'var(--settings-text-sm)',
              fontWeight: 'var(--settings-weight-medium)',
              borderRadius: 'var(--settings-radius-sm)',
              border: '1px solid var(--echo-border-medium)',
              background: 'var(--echo-bg-primary)',
              color: 'var(--echo-text-primary)',
              cursor: 'pointer',
            }}
          >
            Change Password
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Privacy Preferences"
        description="Control what information you share"
      >
        <ToggleSwitch
          checked={dataSharing}
          onChange={setDataSharing}
          label="Data Sharing"
          description="Allow us to share anonymized data with partners"
        />
        <ToggleSwitch
          checked={activityStatus}
          onChange={setActivityStatus}
          label="Activity Status"
          description="Show when you're online"
        />
        <ToggleSwitch
          checked={searchable}
          onChange={setSearchable}
          label="Search Visibility"
          description="Allow others to find you via search"
        />
        <ToggleSwitch
          checked={tagApproval}
          onChange={setTagApproval}
          label="Tag Approval"
          description="Approve tags before they appear on your profile"
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
