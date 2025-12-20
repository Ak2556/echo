'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useModernTheme } from '@/contexts/ModernThemeContext';

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount } = useUser();
  const { colors } = useModernTheme();

  return (
    <>
      <button
        onClick={() => router.push('/notifications')}
        className="notification-bell-btn"
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: colors.text,
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1.25rem',
          transition: 'background 0.2s ease, opacity 0.2s ease',
          opacity: 0.7,
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title="View notifications"
      >
        <Bell size={22} strokeWidth={2} />
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* CSS Styles for smooth hover effects */}
      <style jsx>{`
        .notification-bell-btn:hover {
          background: ${colors.hover} !important;
          opacity: 1 !important;
        }

        .notification-bell-btn:active {
          transform: translateZ(0) scale(0.95);
        }
      `}</style>
    </>
  );
}
