'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  onClick,
}: SettingsCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="echo-card echo-card-lift text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--echo-primary)] to-[var(--echo-accent)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--echo-text-primary)] mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[var(--echo-text-secondary)] line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-[var(--echo-text-tertiary)] group-hover:text-[var(--echo-primary)] transition-colors flex-shrink-0" />
      </div>
    </motion.button>
  );
}
