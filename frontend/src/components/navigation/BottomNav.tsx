/**
 * @fileoverview Bottom Navigation Component
 * @description Mobile bottom navigation bar with primary routes
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { useNavigation } from './NavigationProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { touchTarget, zIndex, duration, easing } from '@/lib/design-system';

export function BottomNav() {
  const { currentRoute, navigate } = useNavigation();
  const { t } = useLanguage();

  const primaryRoutes = [
    { route: 'feed', label: t('nav.feed'), icon: '📰' },
    { route: 'discover', label: t('nav.discover'), icon: '🔍' },
    { route: 'live', label: t('nav.live'), icon: '📡' },
    { route: 'messages', label: t('nav.messages'), icon: '💬' },
    { route: 'profile', label: t('nav.profile'), icon: '👤' },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.08)',
        zIndex: zIndex.sticky,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {primaryRoutes.map((item) => (
        <button
          key={item.route}
          onClick={() => navigate(item.route)}
          aria-label={item.label}
          aria-current={currentRoute === item.route ? 'page' : undefined}
          className="bottom-nav-item"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            flex: 1,
            minWidth: touchTarget.min,
            minHeight: touchTarget.min,
            padding: '6px',
            background: 'transparent',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: `all ${duration.fast} ${easing.easeOut}`,
            position: 'relative',
            color:
              currentRoute === item.route
                ? 'var(--accent)'
                : 'var(--nothing-text-secondary)',
          }}
        >
          {/* Icon */}
          <span
            style={{
              fontSize: '1.5rem',
              lineHeight: 1,
              transform:
                currentRoute === item.route ? 'scale(1.1)' : 'scale(1)',
              transition: `transform ${duration.fast} ${easing.easeOut}`,
            }}
          >
            {item.icon}
          </span>

          {/* Label */}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: currentRoute === item.route ? 600 : 500,
              lineHeight: 1,
              textAlign: 'center',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>

          {/* Active Indicator */}
          {currentRoute === item.route && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: `pulse ${duration.slow} ${easing.easeInOut} infinite`,
              }}
            />
          )}
        </button>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1.2);
          }
        }

        .bottom-nav-item:active {
          transform: scale(0.95);
        }

        @media (hover: hover) {
          .bottom-nav-item:hover {
            background: var(--bg-secondary);
          }
        }
      `}</style>
    </nav>
  );
}

export default BottomNav;
