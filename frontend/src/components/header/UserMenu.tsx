'use client';

import React from 'react';
import { User, Settings, LogOut, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export function UserMenu({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigate,
}: UserMenuProps) {
  if (!isOpen) return null;

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="user-menu-dropdown" onClick={(e) => e.stopPropagation()}>
      {/* User Info */}
      {user && (
        <div className="user-menu-header">
          <div className="user-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || user.email} />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.full_name || 'User'}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="menu-divider" />

      {/* Menu Items */}
      <div className="user-menu-items">
        <button
          className="menu-item"
          onClick={() => handleMenuItemClick(() => onNavigate('profile'))}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          className="menu-item"
          onClick={() => handleMenuItemClick(() => onNavigate('settings'))}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          className="menu-item"
          onClick={() => handleMenuItemClick(() => onNavigate('security'))}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>

        <button
          className="menu-item"
          onClick={() => handleMenuItemClick(() => onNavigate('help'))}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </button>
      </div>

      {/* Divider */}
      <div className="menu-divider" />

      {/* Logout */}
      <button
        className="menu-item logout-item"
        onClick={() => handleMenuItemClick(onLogout)}
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default UserMenu;
