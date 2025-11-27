'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { useNavigation } from './NavigationProvider';
import Button from '@/components/ui/Button';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
  disabled?: boolean;
}

interface EnhancedNavigationProps {
  onOpenMiniApp?: (appName: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'feed',
    label: 'Feed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    route: 'feed',
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    route: 'discover',
  },
  {
    id: 'shop',
    label: 'Shop',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    route: 'shop',
  },
  {
    id: 'tuition',
    label: 'Learn',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    route: 'tuition',
  },
  {
    id: 'live',
    label: 'Live',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10,8 16,12 10,16 10,8" />
      </svg>
    ),
    route: 'live',
    badge: 3,
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    route: 'messages',
    badge: 12,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    route: 'profile',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    route: 'settings',
  },
];

export default function EnhancedNavigation({ onOpenMiniApp }: EnhancedNavigationProps) {
  const { colors, themeMode, accessibility } = useEnhancedTheme();
  const { currentRoute, navigate } = useNavigation();
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<React.CSSProperties>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Update active indicator position
  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const activeItem = activeItemRef.current;
      const nav = navRef.current;
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      setActiveIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        transform: 'translateY(0)',
        opacity: 1,
      });
    }
  }, [currentRoute]);

  const handleNavigation = (route: string) => {
    navigate(route);
    
    // Add haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('discover');
      // Dispatch search event
      window.dispatchEvent(new CustomEvent('globalSearch', { detail: searchQuery }));
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <nav className="enhanced-navigation" ref={navRef}>
      {/* Brand Section */}
      <div className="nav-brand">
        <div className="brand-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="brand-text">Echo</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="nav-items">
        <div className="nav-list">
          {/* Active indicator */}
          <div 
            className="active-indicator"
            style={activeIndicatorStyle}
          />
          
          {navigationItems.map((item) => {
            const isActive = currentRoute === item.route;
            
            return (
              <button
                key={item.id}
                ref={isActive ? activeItemRef : null}
                className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                onClick={() => !item.disabled && handleNavigation(item.route)}
                disabled={item.disabled}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>
                <span className="nav-label">
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="nav-badge">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Section */}
      <div className="nav-actions">
        {/* Search Toggle */}
        <button
          className={`action-btn search-toggle ${showSearch ? 'active' : ''}`}
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Mini Apps */}
        <button
          className="action-btn mini-apps"
          onClick={() => onOpenMiniApp?.('mini-apps')}
          aria-label="Open mini apps"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="action-btn notifications"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="notification-dot" />
        </button>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="search-overlay">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search Echo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="search-close"
                aria-label="Close search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .enhanced-navigation {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) var(--spacing-xl);
          background: var(--color-surface);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          transition: all var(--duration-normal) var(--ease-out);
          min-height: 64px;
        }

        .nav-brand {
          flex-shrink: 0;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          cursor: pointer;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-lg);
          transition: all var(--duration-normal) var(--ease-out);
        }

        .brand-logo:hover {
          background: var(--color-hover);
          transform: translateY(-1px);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: var(--color-primary);
          transition: all var(--duration-normal) var(--ease-out);
        }

        .brand-text {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--color-textPrimary);
          background: var(--color-gradientPrimary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-items {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 600px;
          margin: 0 var(--spacing-xl);
        }

        .nav-list {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs);
          background: var(--color-surfaceElevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          backdrop-filter: blur(20px) saturate(180%);
          box-shadow: var(--shadow-sm);
        }

        .active-indicator {
          position: absolute;
          top: var(--spacing-xs);
          bottom: var(--spacing-xs);
          background: var(--color-primary);
          border-radius: var(--radius-lg);
          transition: all var(--duration-normal) var(--ease-bounce);
          opacity: 0;
          box-shadow: var(--shadow-md), var(--color-glow);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          border: none;
          background: transparent;
          color: var(--color-textSecondary);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
          white-space: nowrap;
          min-height: 44px;
          z-index: 1;
        }

        .nav-item:hover {
          color: var(--color-textPrimary);
          background: var(--color-hover);
          transform: translateY(-1px);
        }

        .nav-item.active {
          color: white;
          font-weight: var(--font-semibold);
        }

        .nav-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--duration-normal) var(--ease-out);
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-weight: inherit;
        }

        .nav-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-error);
          color: white;
          font-size: 10px;
          font-weight: var(--font-bold);
          border-radius: var(--radius-full);
          padding: 0 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          animation: pulse 2s infinite;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }

        .action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          background: var(--color-surface);
          color: var(--color-textSecondary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
          border: 1px solid var(--color-border);
        }

        .action-btn:hover {
          background: var(--color-hover);
          color: var(--color-textPrimary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .action-btn.active {
          background: var(--color-primary);
          color: white;
          box-shadow: var(--shadow-md), var(--color-glow);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-error);
          border-radius: 50%;
          border: 2px solid var(--color-surface);
          animation: pulse 2s infinite;
        }

        .search-overlay {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-top: none;
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(20px) saturate(180%);
          z-index: var(--z-dropdown);
          animation: slideDown var(--duration-normal) var(--ease-out);
        }

        .search-form {
          padding: var(--spacing-lg);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--color-surfaceElevated);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--duration-normal) var(--ease-out);
        }

        .search-input-wrapper:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-focus);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--color-textPrimary);
          font-size: var(--text-base);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-textMuted);
        }

        .search-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--color-textMuted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
        }

        .search-close:hover {
          background: var(--color-hover);
          color: var(--color-textPrimary);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* Theme-specific enhancements */
        .theme-electric .nav-list {
          box-shadow: var(--shadow-sm), 0 0 20px rgba(139, 92, 246, 0.1);
        }

        .theme-professional .enhanced-navigation {
          border-bottom-color: rgba(59, 130, 246, 0.1);
        }

        .theme-modern .nav-list {
          box-shadow: var(--shadow-sm), 0 0 20px rgba(239, 68, 68, 0.1);
        }

        .theme-creator .nav-list {
          box-shadow: var(--shadow-sm), 0 0 20px rgba(249, 115, 22, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .enhanced-navigation {
            padding: var(--spacing-sm) var(--spacing-md);
          }

          .nav-items {
            margin: 0 var(--spacing-md);
          }

          .nav-item .nav-label {
            display: none;
          }

          .nav-item {
            padding: var(--spacing-md);
            min-width: 44px;
          }

          .brand-text {
            display: none;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-navigation,
          .nav-item,
          .action-btn,
          .active-indicator,
          .search-overlay {
            transition: none;
            animation: none;
          }

          .nav-item:hover,
          .action-btn:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .enhanced-navigation {
            border-bottom-width: 2px;
          }

          .nav-list {
            border-width: 2px;
          }

          .action-btn {
            border-width: 2px;
          }
        }

        /* Performance optimization */
        .enhanced-navigation {
          contain: layout style paint;
        }

        .nav-item,
        .action-btn {
          will-change: transform;
        }

        .active-indicator {
          will-change: left, width, transform;
        }
      `}</style>
    </nav>
  );
}