'use client';

import React from 'react';
import {
  Palette,
  Bell,
  Lock,
  Accessibility,
  MessageSquare,
  MonitorPlay,
  Newspaper,
  ShoppingCart,
  Video,
  BookOpen,
  Cloud,
  Code,
} from 'lucide-react';
import { SettingsCard } from './SettingsCard';

interface SettingsGridProps {
  onSectionClick: (section: string) => void;
}

export function SettingsGrid({ onSectionClick }: SettingsGridProps) {
  const settingsSections = [
    {
      id: 'appearance',
      icon: Palette,
      title: 'Appearance',
      description: 'Customize colors, themes, and visual preferences',
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Manage alerts, sounds, and notification preferences',
    },
    {
      id: 'privacy',
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Control your privacy, data, and security settings',
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      title: 'Accessibility',
      description: 'Customize accessibility features and preferences',
    },
    {
      id: 'communication',
      icon: MessageSquare,
      title: 'Communication',
      description: 'Manage messaging and interaction settings',
    },
    {
      id: 'content',
      icon: MonitorPlay,
      title: 'Content Preferences',
      description: 'Control content filtering and recommendations',
    },
    {
      id: 'feed',
      icon: Newspaper,
      title: 'Feed Settings',
      description: 'Customize your feed and discovery preferences',
    },
    {
      id: 'shopping',
      icon: ShoppingCart,
      title: 'Shopping',
      description: 'Manage shopping preferences and payment methods',
    },
    {
      id: 'live',
      icon: Video,
      title: 'Live Streams',
      description: 'Configure live streaming and video settings',
    },
    {
      id: 'learning',
      icon: BookOpen,
      title: 'Learning & Education',
      description: 'Manage tuition and educational content settings',
    },
    {
      id: 'backup',
      icon: Cloud,
      title: 'Backup & Storage',
      description: 'Control data backup and storage options',
    },
    {
      id: 'developer',
      icon: Code,
      title: 'Developer Options',
      description: 'Advanced settings for developers and power users',
    },
  ];

  return (
    <div className="echo-container echo-section">
      <div className="mb-8 echo-animate-wave-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-[var(--echo-text-secondary)]">
          Manage your account preferences and customize your Echo experience
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 echo-stagger-children">
        {settingsSections.map((section) => (
          <SettingsCard
            key={section.id}
            icon={section.icon}
            title={section.title}
            description={section.description}
            onClick={() => onSectionClick(section.id)}
          />
        ))}
      </div>
    </div>
  );
}
