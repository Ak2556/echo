'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SettingsGrid } from './settings/SettingsGrid';

type SettingsSection =
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'accessibility'
  | 'communication'
  | 'content'
  | 'feed'
  | 'shopping'
  | 'live'
  | 'learning'
  | 'backup'
  | 'developer';

export default function SettingsPage() {
  const { colorMode } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSectionClick = (section: string) => {
    console.log(`Navigate to ${section} settings`);
    setActiveSection(section as SettingsSection);
    // TODO: Navigate to dedicated settings page for this section
  };

  return (
    <section id="settings" className="echo-section">
      <div className="echo-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header with Search */}
        <div className="mb-8 echo-animate-wave-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-[var(--echo-text-secondary)] mb-6">
            Manage your account preferences and customize your Echo experience
          </p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              border: `2px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
              borderRadius: '12px',
              background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
              color: 'var(--fg)',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--echo-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colorMode === 'dark' ? '#333' : '#ddd';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Modern Settings Grid - Main Settings Interface */}
        <div style={{ marginBottom: '4rem' }}>
          <SettingsGrid onSectionClick={handleSectionClick} />
        </div>

        {/* Info Section */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '4rem',
            padding: '3rem 2rem',
            background: 'var(--echo-bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--echo-border-light)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Modern Settings Experience
          </h3>
          <p
            style={{
              color: 'var(--echo-text-secondary)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: '1.6',
            }}
          >
            Click any category card above to access detailed settings for that section.
            Each category provides comprehensive controls tailored to your needs.
          </p>

          {/* Quick Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1.5rem',
              maxWidth: '600px',
              margin: '2rem auto 0',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                background: 'var(--echo-bg-primary)',
                borderRadius: '12px',
                border: '1px solid var(--echo-border-light)',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem',
                }}
              >
                12
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--echo-text-secondary)' }}>
                Categories
              </div>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: 'var(--echo-bg-primary)',
                borderRadius: '12px',
                border: '1px solid var(--echo-border-light)',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem',
                }}
              >
                100+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--echo-text-secondary)' }}>
                Settings
              </div>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: 'var(--echo-bg-primary)',
                borderRadius: '12px',
                border: '1px solid var(--echo-border-light)',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem',
                }}
              >
                24/7
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--echo-text-secondary)' }}>
                Customization
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            opacity: 0.7,
          }}
        >
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--echo-text-secondary)' }}>
            Echo v2.1.0 • Last updated: {new Date().toLocaleDateString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--echo-text-tertiary)' }}>
            Made with ❤️ • Premium Settings Experience
          </div>
        </div>
      </div>
    </section>
  );
}
