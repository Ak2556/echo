'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { formatRelativeTime } from '@/utils/internationalization';
import Image from 'next/image';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUser();
  const { colors } = useModernTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      case 'repost':
        return '🔄';
      case 'message':
        return '✉️';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      case 'follow':
        return '#8b5cf6';
      case 'mention':
        return '#f59e0b';
      case 'repost':
        return '#10b981';
      case 'message':
        return '#ec4899';
      case 'system':
        return '#6366f1';
      default:
        return 'var(--accent)';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        color: colors.text,
        paddingTop: '80px',
        paddingBottom: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: colors.surface,
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            onClick={() => router.back()}
            className="back-button"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: colors.surfaceElevated,
              color: colors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              backfaceVisibility: 'hidden',
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.9rem',
                  color: colors.textSecondary,
                }}
              >
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="mark-all-btn"
              style={{
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
                backfaceVisibility: 'hidden',
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setFilter('all')}
            className="filter-tab"
            data-active={filter === 'all'}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              background: filter === 'all' ? colors.primary : colors.surface,
              color: filter === 'all' ? 'white' : colors.text,
              border: filter === 'all' ? 'none' : `1px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: filter === 'all' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backfaceVisibility: 'hidden',
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className="filter-tab"
            data-active={filter === 'unread'}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              background: filter === 'unread' ? colors.primary : colors.surface,
              color: filter === 'unread' ? 'white' : colors.text,
              border:
                filter === 'unread' ? 'none' : `1px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: filter === 'unread' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backfaceVisibility: 'hidden',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: colors.surface,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔔</div>
            <h2
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: colors.textSecondary,
              }}
            >
              {filter === 'unread'
                ? "You're all caught up!"
                : "When you get notifications, they'll show up here"}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: colors.surface,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}
          >
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className="notification-item"
                data-read={notification.read}
                onClick={() => {
                  if (!notification.read) {
                    markNotificationRead(notification.id);
                  }
                }}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom:
                    index < filteredNotifications.length - 1
                      ? `1px solid ${colors.border}`
                      : 'none',
                  background: notification.read
                    ? 'transparent'
                    : `${colors.primary}15`,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Image
                    src={notification.from.avatar}
                    alt={notification.from.displayName}
                    width={48}
                    height={48}
                    style={{ borderRadius: '50%' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: getNotificationColor(notification.type),
                      border: `2px solid ${colors.surface}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {notification.from.displayName}
                    </span>
                    {notification.from.verified && (
                      <span
                        style={{
                          color: colors.primary,
                          marginLeft: '0.25rem',
                        }}
                      >
                        ✓
                      </span>
                    )}
                    <span style={{ color: colors.text }}>
                      {' '}
                      {notification.content}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>{formatRelativeTime(notification.timestamp)}</span>
                    {!notification.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: colors.primary,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .back-button:hover {
          background: ${colors.hover} !important;
        }

        .mark-all-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .mark-all-btn:active {
          transform: translateY(0);
        }

        .filter-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .filter-tab[data-active='true']:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${colors.primary}40;
        }

        .notification-item:hover {
          background: ${colors.hover} !important;
        }

        .notification-item[data-read='false']:hover {
          background: ${colors.primary}25 !important;
        }
      `}</style>
    </div>
  );
}
