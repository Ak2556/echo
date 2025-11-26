/**
 * @fileoverview Mobile Navigation Component
 * @description Hamburger menu and mobile navigation drawer
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from './NavigationProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { touchTarget, zIndex, duration, easing } from '@/lib/design-system';

interface MobileNavProps {
  onOpenMiniApp: (appName: string) => void;
}

export function MobileNav({ onOpenMiniApp }: MobileNavProps) {
  const { currentRoute, navigate } = useNavigation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [currentRoute]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { route: 'feed', label: t('nav.feed'), icon: '📰' },
    { route: 'discover', label: t('nav.discover'), icon: '🔍' },
    { route: 'shop', label: t('nav.shop'), icon: '🛍️' },
    { route: 'tuition', label: t('nav.tuition'), icon: '📚' },
    { route: 'live', label: t('nav.live'), icon: '📡' },
    { route: 'messages', label: t('nav.messages'), icon: '💬' },
    { route: 'settings', label: t('nav.settings'), icon: '⚙️' },
    { route: 'profile', label: t('nav.profile'), icon: '👤' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="mobile-nav-trigger"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5px',
          minWidth: touchTarget.min,
          minHeight: touchTarget.min,
          padding: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: zIndex.fixed + 1,
        }}
      >
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: 'var(--fg)',
            borderRadius: '2px',
            transition: `all ${duration.normal} ${easing.easeInOut}`,
            transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: 'var(--fg)',
            borderRadius: '2px',
            transition: `all ${duration.normal} ${easing.easeInOut}`,
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '2px',
            background: 'var(--fg)',
            borderRadius: '2px',
            transition: `all ${duration.normal} ${easing.easeInOut}`,
            transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }}
        />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: zIndex.modalBackdrop,
            animation: `fadeIn ${duration.normal} ${easing.easeOut}`,
          }}
        />
      )}

      {/* Drawer */}
      <nav
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
          zIndex: zIndex.modal,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform ${duration.normal} ${easing.easeOut}`,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 1rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--fg)',
            }}
          >
            Echo
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              color: 'var(--nothing-text-secondary)',
            }}
          >
            {t('nav.tagline') || 'Your Social Network'}
          </p>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="mobile-nav-item"
              aria-current={currentRoute === item.route ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: '100%',
                minHeight: touchTarget.comfortable,
                padding: '0.75rem 1.5rem',
                background:
                  currentRoute === item.route ? 'var(--accent)' : 'transparent',
                color: currentRoute === item.route ? 'white' : 'var(--fg)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: currentRoute === item.route ? 600 : 500,
                textAlign: 'left',
                transition: `all ${duration.fast} ${easing.easeOut}`,
              }}
              onMouseEnter={(e) => {
                if (currentRoute !== item.route) {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentRoute !== item.route) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => onOpenMiniApp('mini-apps')}
            className="mobile-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              minHeight: touchTarget.comfortable,
              padding: '0.75rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              transition: `all ${duration.fast} ${easing.easeOut}`,
            }}
          >
            <span>🎯</span>
            <span>{t('nav.miniApps') || 'Mini Apps'}</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-nav-item:active {
          transform: scale(0.98);
        }

        .mobile-nav-trigger:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}

export default MobileNav;
