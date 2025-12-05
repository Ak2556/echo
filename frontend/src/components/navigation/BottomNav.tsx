/**
 * @fileoverview Bottom Navigation Component
 * @description Mobile bottom navigation bar with primary routes and premium animations
 * @version 2.0.0
 */

'use client';

import React, { useRef } from 'react';
import { useNavigation } from './NavigationProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { touchTarget, zIndex, duration, easing } from '@/lib/design-system';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

export function BottomNav() {
  const { currentRoute, navigate } = useNavigation();
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);

  const primaryRoutes = [
    { route: 'feed', label: t('nav.feed'), icon: '📰' },
    { route: 'discover', label: t('nav.discover'), icon: '🔍' },
    { route: 'live', label: t('nav.live'), icon: '📡' },
    { route: 'messages', label: t('nav.messages'), icon: '💬' },
    { route: 'profile', label: t('nav.profile'), icon: '👤' },
  ];

  // GSAP hover animations for nav items
  useGSAP(() => {
    const items = document.querySelectorAll('.bottom-nav-item');
    const handlers = new Map();

    items.forEach((item) => {
      const handleMouseEnter = () => {
        gsap.to(item, {
          scale: 1.1,
          duration: ANIMATION.hover.duration,
          ease: ANIMATION.easing.apple,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      handlers.set(item, { handleMouseEnter, handleMouseLeave });
      item.addEventListener('mouseenter', handleMouseEnter);
      item.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      items.forEach((item) => {
        const itemHandlers = handlers.get(item);
        if (itemHandlers) {
          item.removeEventListener('mouseenter', itemHandlers.handleMouseEnter);
          item.removeEventListener('mouseleave', itemHandlers.handleMouseLeave);
        }
      });
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Bottom navigation"
      style={{
        position: 'fixed',
        bottom: '8px', // Floating effect - 8px from bottom
        left: '8px',
        right: '8px',
        height: '68px', // Slightly taller
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px', // More rounded for floating effect
        boxShadow: 'var(--shadow-premium)', // Premium shadow
        zIndex: zIndex.sticky,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 12px',
        backdropFilter: 'blur(20px)', // Stronger blur
        backgroundColor: 'rgba(var(--bg-primary-rgb), 0.85)', // More transparency
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
