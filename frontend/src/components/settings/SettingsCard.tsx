'use client';

import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  badge?: string;
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
}: SettingsCardProps) {
  return (
    <button
      onClick={onClick}
      className="echo-settings-card-v2"
      type="button"
    >
      {/* Icon Circle */}
      <div className="icon-circle">
        <Icon />
      </div>

      {/* Content */}
      <div className="card-content">
        <div className="card-title-row">
          <h3 className="card-title">{title}</h3>
          {badge && <span className="card-badge">{badge}</span>}
        </div>
        {description && (
          <p className="card-description">{description}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="card-arrow" />
    </button>
  );
}
