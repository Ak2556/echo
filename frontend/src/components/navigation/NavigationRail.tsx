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
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colorMode, toggleColorMode } = useTheme();
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
      className="w-64 h-full border-r border-[var(--echo-border-light)] flex flex-col overflow-y-auto echo-animate-wave-in"
      aria-label="Main navigation"
      style={{ backgroundColor: 'var(--echo-bg-primary)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--echo-border-light)]">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent">
          Echo
        </h2>
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

        {/* Divider */}
        <div className="h-px bg-[var(--echo-border-light)] my-4" />

        {/* Notification Bell */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200">
          <Bell className="w-5 h-5 flex-shrink-0 text-[var(--echo-text-primary)]" />
          <span className="text-sm font-medium flex-1 text-[var(--echo-text-primary)]">Notifications</span>
          <NotificationBell />
        </div>

        {/* Mini Apps */}
        <button
          onClick={() => setShowMiniApps(!showMiniApps)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
        >
          <Grid3x3 className="w-5 h-5 flex-shrink-0 text-[var(--echo-text-primary)]" />
          <span className="text-sm font-medium flex-1 text-[var(--echo-text-primary)]">Mini Apps</span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--echo-text-tertiary)] transition-transform ${showMiniApps ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Mini Apps Dropdown */}
        {showMiniApps && (
          <div className="ml-4 mt-2 space-y-2 p-2 bg-[var(--echo-bg-secondary)] rounded-lg">
            <input
              type="text"
              placeholder="Search apps..."
              value={appSearchQuery}
              onChange={(e) => setAppSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--echo-border-light)] bg-[var(--echo-bg-primary)] text-[var(--echo-text-primary)] focus:outline-none focus:border-[var(--echo-primary)]"
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onOpenMiniApp?.(app.id);
                    setShowMiniApps(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
                >
                  <span className="text-lg">{app.icon}</span>
                  <span className="text-xs text-[var(--echo-text-secondary)]">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Language Switcher */}
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
        >
          <Globe className="w-5 h-5 flex-shrink-0 text-[var(--echo-text-primary)]" />
          <span className="text-sm font-medium flex-1 text-[var(--echo-text-primary)]">Language</span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--echo-text-tertiary)] transition-transform ${showLanguages ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Language Dropdown */}
        {showLanguages && (
          <div className="ml-4 mt-2 space-y-1 p-2 bg-[var(--echo-bg-secondary)] rounded-lg">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  setShowLanguages(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                  language === lang.code
                    ? 'bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] text-white'
                    : 'hover:bg-[var(--echo-bg-tertiary)] text-[var(--echo-text-primary)]'
                }`}
              >
                <span className="text-sm">{lang.nativeName}</span>
                {language === lang.code && <span>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleColorMode}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
        >
          {colorMode === 'dark' ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-[var(--echo-text-primary)]" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 text-[var(--echo-text-primary)]" />
          )}
          <span className="text-sm font-medium flex-1 text-[var(--echo-text-primary)]">
            {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>

      {/* User Profile Section (Bottom) */}
      <div className="border-t border-[var(--echo-border-light)] p-4">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--echo-primary)] to-[var(--echo-accent)] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--echo-text-primary)] truncate">
              {user?.full_name || 'Guest User'}
            </div>
            <div className="text-xs text-[var(--echo-text-secondary)] truncate">
              {user?.email || 'Not logged in'}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--echo-text-tertiary)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
          />
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="mt-2 space-y-1 p-2 bg-[var(--echo-bg-secondary)] rounded-lg">
            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate?.('profile');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
                >
                  <User className="w-4 h-4 text-[var(--echo-text-secondary)]" />
                  <span className="text-sm text-[var(--echo-text-primary)]">View Profile</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate?.('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
                >
                  <Settings className="w-4 h-4 text-[var(--echo-text-secondary)]" />
                  <span className="text-sm text-[var(--echo-text-primary)]">Settings</span>
                </button>
                <div className="h-px bg-[var(--echo-border-light)] my-1" />
                <button
                  onClick={async () => {
                    await logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">Logout</span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
                >
                  <User className="w-4 h-4 text-[var(--echo-text-secondary)]" />
                  <span className="text-sm text-[var(--echo-text-primary)]">Login</span>
                </a>
                <a
                  href="/auth/signup"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--echo-bg-tertiary)] transition-all duration-200 w-full text-left"
                >
                  <User className="w-4 h-4 text-[var(--echo-text-secondary)]" />
                  <span className="text-sm text-[var(--echo-text-primary)]">Sign Up</span>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
