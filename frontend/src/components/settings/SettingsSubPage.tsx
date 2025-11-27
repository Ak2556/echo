'use client';

import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface SettingsSubPageProps {
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
}

export function SettingsSubPage({
  title,
  description,
  children,
  onBack,
}: SettingsSubPageProps) {
  return (
    <div className="echo-settings-container">
      {/* Header with Breadcrumb */}
      <div className="echo-settings-header echo-animate-wave-in">
        <div className="echo-settings-breadcrumbs">
          {onBack ? (
            <button
              onClick={onBack}
              className="echo-settings-breadcrumb"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronLeft size={16} />
              Settings
            </button>
          ) : (
            <Link href="/settings" className="echo-settings-breadcrumb">
              Settings
            </Link>
          )}
          <span className="echo-settings-breadcrumb-separator">/</span>
          <span className="echo-settings-breadcrumb active">{title}</span>
        </div>

        <div>
          <h1 className="echo-settings-title">{title}</h1>
          {description && <p className="echo-settings-description">{description}</p>}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px' }}>
        {children}
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div style={{ marginBottom: 'var(--settings-space-12)' }}>
      <div style={{ marginBottom: 'var(--settings-space-4)' }}>
        <h2
          style={{
            fontSize: 'var(--settings-text-xl)',
            fontWeight: 'var(--settings-weight-semibold)',
            color: 'var(--echo-text-primary)',
            marginBottom: 'var(--settings-space-1)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: 'var(--settings-text-sm)',
              color: 'var(--echo-text-secondary)',
              lineHeight: 'var(--settings-leading-relaxed)',
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
