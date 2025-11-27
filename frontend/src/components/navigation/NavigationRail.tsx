'use client';

import React from 'react';
import {
  Home,
  Compass,
  ShoppingBag,
  GraduationCap,
  Radio,
  MessageCircle,
  User,
  Settings,
} from 'lucide-react';
import { NavItem } from './NavItem';

interface NavigationRailProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
  unreadMessages?: number;
}

export function NavigationRail({
  activeRoute = 'feed',
  onNavigate,
  unreadMessages = 0,
}: NavigationRailProps) {
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

  return (
    <nav
      className="w-64 h-full border-r border-[var(--echo-border-light)] p-4 space-y-1 echo-animate-wave-in"
      aria-label="Main navigation"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent">
          Echo
        </h2>
      </div>

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
    </nav>
  );
}
