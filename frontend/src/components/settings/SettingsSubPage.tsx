'use client';

import React, { ReactNode, useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

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
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP stagger animation for sections
  useGSAP(() => {
    if (!contentRef.current) return;

    const sections = contentRef.current.querySelectorAll('.settings-section');

    gsap.fromTo(
      sections,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: ANIMATION.scrollReveal.stagger,
        ease: ANIMATION.easing.apple,
      }
    );
  }, []);

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
          {description && (
            <p className="echo-settings-description">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ maxWidth: '800px' }}>
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
    <div
      className="settings-section"
      style={{ marginBottom: 'var(--settings-space-12)' }}
    >
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
