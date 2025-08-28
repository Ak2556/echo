'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Rss, Search, Radio, MessageCircle, User, Settings, Grid3x3, Globe, Sun, Moon, ShoppingBag, GraduationCap, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import Link from 'next/link';

interface SimpleHeaderProps {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  onOpenMiniApp: (appName: string) => void;
}

export default function SimpleHeader({ currentRoute, setCurrentRoute, onOpenMiniApp }: SimpleHeaderProps) {
  const { colorMode, toggleColorMode } = useTheme();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const { user = null, logout = async () => {}, loading = false } = useAuth() || {};
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [langButtonRect, setLangButtonRect] = useState<DOMRect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const [userButtonRect, setUserButtonRect] = useState<DOMRect | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsAppsMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node) &&
          langButtonRef.current && !langButtonRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userButtonRef.current && !userButtonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isAppsMenuOpen || isLangMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAppsMenuOpen, isLangMenuOpen, isUserMenuOpen]);

  const navItems = [
    { route: 'feed', labelKey: 'feed' },
    { route: 'discover', labelKey: 'discover' },
    { route: 'shop', labelKey: 'shop' },
    { route: 'tuition', labelKey: 'tuition' },
    { route: 'live', labelKey: 'live' },
    { route: 'messages', labelKey: 'messages' },
    { route: 'profile', labelKey: 'profile' },
    { route: 'settings', labelKey: 'settings' }
  ];

  const getNavIcon = (route: string, isActive: boolean) => {
    const size = 22;
    const strokeWidth = 2;

    switch(route) {
      case 'feed':
        return <Rss size={size} strokeWidth={strokeWidth} />;
      case 'discover':
        return <Search size={size} strokeWidth={strokeWidth} />;
      case 'shop':
        return <ShoppingBag size={size} strokeWidth={strokeWidth} />;
      case 'tuition':
        return <GraduationCap size={size} strokeWidth={strokeWidth} />;
      case 'live':
        return <Radio size={size} strokeWidth={strokeWidth} />;
      case 'messages':
        return <MessageCircle size={size} strokeWidth={strokeWidth} />;
      case 'profile':
        return <User size={size} strokeWidth={strokeWidth} />;
      case 'settings':
        return <Settings size={size} strokeWidth={strokeWidth} />;
      default:
        return null;
    }
  };

  // Final 15 Mini Apps - Only the best-in-class applications
  const quickApps = [
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'timer', name: 'Timer', icon: '⏱️' },
    { id: 'weather', name: 'Weather', icon: '☁️' },
    { id: 'tasks', name: 'Task Manager', icon: '✅' },
    { id: 'password', name: 'Password Manager', icon: '🔐' },
    { id: 'qr', name: 'QR Code', icon: '📱' },
    { id: 'finance', name: 'Finance Manager', icon: '💰' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'media', name: 'Media Player', icon: '🎵' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'files', name: 'File Manager', icon: '📁' },
    { id: 'recipes', name: 'Recipe Book', icon: '🍳' },
    { id: 'translator', name: 'Translator', icon: '🌍' },
    { id: 'whiteboard', name: 'Whiteboard', icon: '🎨' },
    { id: 'dairyfarm', name: 'Dairy Farm Manager', icon: '🐄' }
  ];

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        background: 'rgba(var(--bg-rgb), 0.8)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          maxWidth: 'min(90%, 1200px)',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          {/* Brand */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '700',
            fontSize: '1.25rem',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={() => setCurrentRoute('feed')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: 1,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              ≡
            </div>
            <span style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>Echo</span>
          </div>

          {/* Navigation - Icon Only */}
          <nav>
            <ul style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0,
              padding: 0,
              listStyle: 'none'
            }}>
              {navItems.map(({ route, labelKey }) => (
                <li key={route} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setCurrentRoute(route)}
                    aria-label={t(labelKey)}
                    style={{
                      position: 'relative',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0 1rem',
                      background: currentRoute === route
                        ? 'var(--accent)'
                        : 'transparent',
                      color: currentRoute === route ? 'white' : 'var(--fg)',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: currentRoute === route ? 'scale(1)' : 'scale(0.95)',
                      opacity: currentRoute === route ? 1 : 0.7,
                      fontSize: '0.875rem',
                      fontWeight: currentRoute === route ? 600 : 500
                    }}
                    onMouseEnter={(e) => {
                      if (currentRoute !== route) {
                        e.currentTarget.style.background = colorMode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.06)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentRoute !== route) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(0.95)';
                        e.currentTarget.style.opacity = '0.7';
                      }
                    }}
                  >
                    {getNavIcon(route, currentRoute === route)}
                    <span>{t(labelKey)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {/* Notifications */}
            <NotificationBell />

            {/* Apps */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                ref={buttonRef}
                onClick={() => {

                  if (buttonRef.current) {
                    setButtonRect(buttonRef.current.getBoundingClientRect());
                  }
                  setIsAppsMenuOpen(!isAppsMenuOpen);

                }}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isAppsMenuOpen ? 'var(--accent)' : 'transparent',
                  color: isAppsMenuOpen ? 'white' : 'var(--fg)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isAppsMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  opacity: isAppsMenuOpen ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (!isAppsMenuOpen) {
                    e.currentTarget.style.background = colorMode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAppsMenuOpen) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                    e.currentTarget.style.opacity = '0.6';
                  }
                }}
              >
                <Grid3x3 size={22} strokeWidth={2} />
              </button>

            {isAppsMenuOpen && buttonRect && typeof window !== 'undefined' && createPortal(
              <div
                ref={menuRef}
                style={{
                position: 'fixed',
                top: `${buttonRect.bottom + 8}px`,
                right: `${window.innerWidth - buttonRect.right}px`,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                minWidth: '600px',
                maxWidth: '800px',
                maxHeight: '70vh',
                overflowY: 'auto',
                padding: '1rem',
                zIndex: 10000
              }}>
                {/* Search Input */}
                <div style={{ marginBottom: '1rem', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1, paddingBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search mini apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '0.75rem'
                }}>
                  {quickApps.filter(app =>
                    app.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {

                        onOpenMiniApp(app.id);
                        setIsAppsMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colorMode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ fontSize: '2rem' }}>{app.icon}</div>
                      <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>,
              document.body
            )}
          </div>

            {/* Language Switcher */}
            <button
              ref={langButtonRef}
              onClick={() => {
                if (langButtonRef.current) {
                  setLangButtonRect(langButtonRef.current.getBoundingClientRect());
                }
                setIsLangMenuOpen(!isLangMenuOpen);
              }}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isLangMenuOpen ? 'var(--accent)' : 'transparent',
                color: isLangMenuOpen ? 'white' : 'var(--fg)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.25rem',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isLangMenuOpen ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (!isLangMenuOpen) {
                  e.currentTarget.style.background = colorMode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLangMenuOpen) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              <Globe size={22} strokeWidth={2} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleColorMode}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1.25rem',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: 0.6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colorMode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'rotate(180deg) scale(1.05)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                e.currentTarget.style.opacity = '0.6';
              }}
            >
              {colorMode === 'dark' ? <Sun size={22} strokeWidth={2} /> : <Moon size={22} strokeWidth={2} />}
            </button>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                ref={userButtonRef}
                onClick={() => {
                  if (!isUserMenuOpen && userButtonRef.current) {
                    setUserButtonRect(userButtonRef.current.getBoundingClientRect());
                  }
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isUserMenuOpen ? (colorMode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : 'transparent',
                  border: '2px solid',
                  borderColor: isUserMenuOpen ? 'var(--accent)' : 'transparent',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  opacity: isUserMenuOpen ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                  if (!isUserMenuOpen) {
                    e.currentTarget.style.background = colorMode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUserMenuOpen) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                <User size={22} strokeWidth={2} />
              </button>

            </div>

            {/* User Dropdown Portal */}
            {isUserMenuOpen && userButtonRect && typeof window !== 'undefined' && createPortal(
              <div
                ref={userMenuRef}
                style={{
                  position: 'fixed',
                  top: `${userButtonRect.bottom + 8}px`,
                  right: `${window.innerWidth - userButtonRect.right}px`,
                  minWidth: '240px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 10000
                }}
              >
                  {user ? (
                    <>
                      {/* User Info */}
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {user.full_name || 'User'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setCurrentRoute('profile');
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--fg)',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colorMode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentRoute('settings');
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--fg)',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colorMode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />

                      <button
                        onClick={async () => {
                          await logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: '#ef4444',
                          textAlign: 'left',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Not Logged In */}
                      <Link
                        href="/auth/login"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--fg)',
                          textDecoration: 'none',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colorMode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <User size={16} />
                        <span>Login</span>
                      </Link>

                      <Link
                        href="/auth/signup"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--fg)',
                          textDecoration: 'none',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colorMode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <User size={16} />
                        <span>Sign Up</span>
                      </Link>
                    </>
                  )}
                </div>,
              document.body
            )}
          </div>
        </div>
      </header>

      {/* Language Dropdown Portal */}
      {isLangMenuOpen && langButtonRect && typeof window !== 'undefined' && createPortal(
        <div
          ref={langMenuRef}
          style={{
            position: 'fixed',
            top: `${langButtonRect.bottom + 8}px`,
            right: `${window.innerWidth - langButtonRect.right}px`,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: '200px',
            maxWidth: '250px',
            padding: '0.5rem',
            zIndex: 10000
          }}
        >
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsLangMenuOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.75rem',
                background: language === lang.code ? 'var(--accent)' : 'transparent',
                color: language === lang.code ? 'white' : 'var(--fg)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                marginBottom: '0.25rem'
              }}
              onMouseEnter={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.background = colorMode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>{lang.nativeName}</span>
              {language === lang.code && <span>✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}