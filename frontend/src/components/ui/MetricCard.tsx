'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  number: string;
  label: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function MetricCard({
  number,
  label,
  icon: Icon,
  trend,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      className="echo-glass p-6 rounded-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-[var(--echo-primary)] to-[var(--echo-accent)] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}

      <div className="text-4xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent mb-2">
        {number}
      </div>

      <div className="text-sm font-medium text-[var(--echo-text-secondary)] mb-2">
        {label}
      </div>

      {trend && (
        <div
          className={`text-xs font-semibold ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </motion.div>
  );
}
