'use client';

import React, { useState } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { TrendingUp, Clock, Sparkles, Shuffle } from 'lucide-react';

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

export function FeedSettings({ onBack }: { onBack?: () => void }) {
  const [feedAlgorithm, setFeedAlgorithm] = useState('recommended');
  const [suggestedPosts, setSuggestedPosts] = useState(true);
  const [hideSeenPosts, setHideSeenPosts] = useState(false);
  const [showReposts, setShowReposts] = useState(true);

  const algorithmOptions = [
    {
      id: 'chronological',
      name: 'Chronological',
      icon: Clock,
      description: 'Latest posts first',
    },
    {
      id: 'recommended',
      name: 'Recommended',
      icon: Sparkles,
      description: 'Personalized for you',
    },
    { id: 'mixed', name: 'Mixed', icon: Shuffle, description: 'Blend of both' },
  ];

  return (
    <SettingsSubPage
      title="Feed Settings"
      description="Customize your feed and discovery preferences"
      onBack={onBack}
    >
      <SettingsSection
        title="Feed Algorithm"
        description="Choose how posts are sorted"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {algorithmOptions.map((option) => {
            const Icon = option.icon;
            const isActive = feedAlgorithm === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setFeedAlgorithm(option.id)}
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
        title="Content Preferences"
        description="Control what appears in your feed"
      >
        <ToggleSwitch
          checked={suggestedPosts}
          onChange={setSuggestedPosts}
          label="Suggested Posts"
          description="Show posts you might like"
        />
        <ToggleSwitch
          checked={hideSeenPosts}
          onChange={setHideSeenPosts}
          label="Hide Seen Posts"
          description="Don't show posts you've already seen"
        />
        <ToggleSwitch
          checked={showReposts}
          onChange={setShowReposts}
          label="Show Reposts"
          description="Include reposts in your feed"
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
