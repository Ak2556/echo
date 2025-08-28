'use client';

import React from 'react';

interface QuickApp {
  id: string;
  name: string;
  icon: string;
}

interface AppsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

const QUICK_APPS: QuickApp[] = [
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

export function AppsMenu({ isOpen, onClose, onOpenApp }: AppsMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="apps-dropdown"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="apps-grid">
        {QUICK_APPS.map((app) => (
          <button
            key={app.id}
            className="app-item"
            onClick={() => {
              onOpenApp(app.id);
              onClose();
            }}
            aria-label={`Open ${app.name}`}
          >
            <span className="app-icon">{app.icon}</span>
            <span className="app-name">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AppsMenu;
