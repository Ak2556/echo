'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  badge,
}: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200
        w-full text-left
        ${
          active
            ? 'bg-[var(--echo-primary)] text-white shadow-md'
            : 'hover:bg-[var(--echo-bg-tertiary)] text-[var(--echo-text-primary)]'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`
          px-2 py-0.5 rounded-full text-xs font-semibold
          ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-[var(--echo-accent)] text-white'
          }
        `}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </motion.button>
  );
}
