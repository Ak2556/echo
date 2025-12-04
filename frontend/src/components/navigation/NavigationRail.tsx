'use client';

import React, { useState } from 'react';
import {
  Home,
  Compass,
  ShoppingBag,
  GraduationCap,
  Radio,
  MessageCircle,
  User,
  Settings,
  Bell,
  Grid3x3,
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '../NotificationBell';
import { LanguageCode } from '@/lib/i18n';

interface NavigationRailProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
  unreadMessages?: number;
  onOpenMiniApp?: (appName: string) => void;
}

export function NavigationRail({
  activeRoute = 'feed',
  onNavigate,
  unreadMessages = 0,
  onOpenMiniApp,
}: NavigationRailProps) {
  const { colors, colorMode, actualMode, toggleMode } = useModernTheme();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const {
    user = null,
    logout = async () => {},
  } = useAuth() || {};

  const [showMiniApps, setShowMiniApps] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [appSearchQuery, setAppSearchQuery] = useState('');

  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    { id: 'tuition', icon: GraduationCap, label: 'Tuition' },
    { id: 'live', icon: Radio, label: 'Live' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

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
    { id: 'dairyfarm', name: 'Dairy Farm Manager', icon: '🐄' },
  ];

  const filteredApps = quickApps.filter((app) =>
    app.name.toLowerCase().includes(appSearchQuery.toLowerCase())
  );

  return (
    <nav
      className="w-64 h-full border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto scrollbar-minimal bg-white dark:bg-gray-900"
      aria-label="Main navigation"
    >
      {/* Minimal Clean Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Simple Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center transition-smooth hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
            >
              <path
                d="M12 3C12 3 8.5 6.5 8.5 12C8.5 17.5 12 21 12 21"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 6C16 6 14 8.5 14 12C14 15.5 16 18 16 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 9C19 9 18 10.5 18 12C18 13.5 19 15 19 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Clean Logo Text */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Echo
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Social Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeRoute === item.id}
            onClick={() => onNavigate?.(item.id)}
            badge={item.badge}
          />
        ))}

        {/* Modern Divider */}
        <div
          className="h-0.5 my-4 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${colors.border}, transparent)`,
          }}
        />

        {/* Modern Notification Bell */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group cursor-pointer"
          style={{
            background: colors.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          <Bell className="w-5 h-5 flex-shrink-0 transition-colors" style={{ color: colors.textSecondary }} />
          <span className="text-sm font-semibold flex-1" style={{ color: colors.text }}>
            Notifications
          </span>
          <NotificationBell />
        </div>

        {/* Modern Mini Apps */}
        <button
          onClick={() => setShowMiniApps(!showMiniApps)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
          style={{
            background: colors.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          <Grid3x3 className="w-5 h-5 flex-shrink-0 transition-colors" style={{ color: colors.textSecondary }} />
          <span className="text-sm font-semibold flex-1" style={{ color: colors.text }}>
            Mini Apps
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${showMiniApps ? 'rotate-180' : ''}`}
            style={{ color: colors.textTertiary }}
          />
        </button>

        {/* Modern Mini Apps Dropdown */}
        {showMiniApps && (
          <div
            className="ml-2 mt-2 space-y-2 p-3 rounded-2xl shadow-xl animate-fade-in-down"
            style={{
              background: colors.surfaceElevated,
              border: `2px solid ${colors.border}`,
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textTertiary }} />
              <input
                type="text"
                placeholder="Search apps..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border-2 focus:outline-none focus:ring-4 transition-all"
                style={{
                  background: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${colors.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-modern">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onOpenMiniApp?.(app.id);
                    setShowMiniApps(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
                  <span className="text-xs font-medium" style={{ color: colors.text }}>
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modern Language Switcher */}
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
          style={{
            background: colors.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          <Globe className="w-5 h-5 flex-shrink-0 transition-colors" style={{ color: colors.textSecondary }} />
          <span className="text-sm font-semibold flex-1" style={{ color: colors.text }}>
            Language
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${showLanguages ? 'rotate-180' : ''}`}
            style={{ color: colors.textTertiary }}
          />
        </button>

        {/* Modern Language Dropdown */}
        {showLanguages && (
          <div
            className="ml-2 mt-2 space-y-1 p-2 rounded-2xl shadow-xl animate-fade-in-down"
            style={{
              background: colors.surfaceElevated,
              border: `2px solid ${colors.border}`,
            }}
          >
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  setShowLanguages(false);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 w-full text-left"
                style={{
                  background:
                    language === lang.code
                      ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                      : 'transparent',
                  color: language === lang.code ? 'white' : colors.text,
                  transform: language === lang.code ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = colors.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span className="text-sm font-medium">{lang.nativeName}</span>
                {language === lang.code && <span className="text-lg">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Modern Theme Toggle */}
        <button
          onClick={toggleMode}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
          style={{
            background: colors.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          {actualMode === 'dark' ? (
            <Sun className="w-5 h-5 flex-shrink-0 transition-colors" style={{ color: colors.textSecondary }} />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 transition-colors" style={{ color: colors.textSecondary }} />
          )}
          <span className="text-sm font-semibold flex-1" style={{ color: colors.text }}>
            {colorMode === 'auto' ? `Auto (${actualMode === 'dark' ? 'Dark' : 'Light'})` : actualMode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </span>
        </button>
      </div>

      {/* Modern User Profile Section (Bottom) */}
      <div
        className="border-t-2 p-4"
        style={{
          borderColor: colors.border,
          background: colors.surfaceElevated,
        }}
      >
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg w-full text-left group"
          style={{
            background: colors.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
            }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: colors.text }}>
              {user?.full_name || 'Guest User'}
            </div>
            <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
              {user?.email || 'Not logged in'}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
            style={{ color: colors.textTertiary }}
          />
        </button>

        {/* Modern User Menu Dropdown */}
        {showUserMenu && (
          <div
            className="mt-2 space-y-1 p-2 rounded-2xl shadow-xl animate-fade-in-down"
            style={{
              background: colors.surfaceElevated,
              border: `2px solid ${colors.border}`,
            }}
          >
            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate?.('profile');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User className="w-4 h-4 transition-colors" style={{ color: colors.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    View Profile
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigate?.('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Settings className="w-4 h-4 transition-colors" style={{ color: colors.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Settings
                  </span>
                </button>
                <div
                  className="h-0.5 my-1 rounded-full"
                  style={{
                    background: `linear-gradient(to right, transparent, ${colors.border}, transparent)`,
                  }}
                />
                <button
                  onClick={async () => {
                    await logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${colors.error}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut className="w-4 h-4 transition-colors" style={{ color: colors.error }} />
                  <span className="text-sm font-medium" style={{ color: colors.error }}>
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User className="w-4 h-4 transition-colors" style={{ color: colors.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Login
                  </span>
                </a>
                <a
                  href="/auth/signup"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md w-full text-left group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User className="w-4 h-4 transition-colors" style={{ color: colors.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Sign Up
                  </span>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
