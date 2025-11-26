'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatRelativeTime } from '@/utils/internationalization';
import Image from 'next/image';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUser();
  const { colorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
          }
          setIsOpen(!isOpen);
        }}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isOpen ? 'var(--accent)' : 'transparent',
          color: isOpen ? 'white' : 'var(--fg)',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1.25rem',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: isOpen ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              colorMode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.opacity = '1';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '0.6';
          }
        }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
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
              fontWeight: 'bold',
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

      {isOpen &&
        buttonRect &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${buttonRect.bottom + 8}px`,
              right: `${window.innerWidth - buttonRect.right}px`,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              width: '420px',
              maxHeight: '600px',
              overflowY: 'auto',
              zIndex: 10000,
            }}
          >
            {/* Header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
                padding: '1rem',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        colorMode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background:
                      filter === 'all' ? 'var(--accent)' : 'transparent',
                    color: filter === 'all' ? 'white' : 'var(--fg)',
                    border:
                      filter === 'all' ? 'none' : '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: filter === 'all' ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background:
                      filter === 'unread' ? 'var(--accent)' : 'transparent',
                    color: filter === 'unread' ? 'white' : 'var(--fg)',
                    border:
                      filter === 'unread' ? 'none' : '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: filter === 'unread' ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'var(--fg)',
                  opacity: 0.6,
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  {filter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationRead(notification.id);
                      }
                    }}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border)',
                      background: notification.read
                        ? 'transparent'
                        : 'rgba(59, 130, 246, 0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        colorMode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.read
                        ? 'transparent'
                        : 'rgba(59, 130, 246, 0.05)';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Image
                        src={notification.from.avatar}
                        alt={notification.from.displayName}
                        width={44}
                        height={44}
                        style={{ borderRadius: '50%' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: getNotificationColor(notification.type),
                          border: '2px solid var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {notification.from.displayName}
                        </span>
                        {notification.from.verified && (
                          <span
                            style={{
                              color: 'var(--accent)',
                              marginLeft: '0.25rem',
                            }}
                          >
                            ✓
                          </span>
                        )}
                        <span style={{ color: 'var(--fg)', opacity: 0.9 }}>
                          {' '}
                          {notification.content}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--fg)',
                          opacity: 0.6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span>
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--accent)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
