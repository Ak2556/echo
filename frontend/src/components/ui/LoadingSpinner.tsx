'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'gradient';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-purple-600',
  accent: 'text-cyan-600',
  white: 'text-white',
  gradient: 'text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text',
};

export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  color = 'primary',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const appleEasing = [0.22, 1, 0.36, 1] as const;

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-gradient-to-r from-blue-600 to-purple-600`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: appleEasing,
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: appleEasing }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <motion.div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: appleEasing,
          }}
        />
        {text && (
          <motion.p
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: appleEasing }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Gradient spinner
  if (variant === 'gradient') {
    return (
      <motion.div
        className={`flex flex-col items-center justify-center space-y-3 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: appleEasing }}
      >
        <motion.div
          className={`${sizeClasses[size]} relative`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20" />
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              stroke="url(#spinnerGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M12 2a10 10 0 0 1 10 10"
            />
          </svg>
        </motion.div>
        {text && (
          <motion.p
            className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: appleEasing }}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Default modern spinner
  return (
    <motion.div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: appleEasing }}
    >
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          className="w-full h-full drop-shadow-lg"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>

      {text && (
        <motion.p
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: appleEasing }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

// Modern Skeleton Loader Component
export function SkeletonLoader({
  className = '',
  lines = 3,
  height = 'h-4',
  variant = 'default',
}: {
  className?: string;
  lines?: number;
  height?: string;
  variant?: 'default' | 'shimmer';
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            ${variant === 'shimmer' ? 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' : 'animate-pulse bg-gray-200 dark:bg-gray-700'}
            rounded-lg ${height}
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            shadow-sm
          `}
        />
      ))}
    </div>
  );
}

// Modern Page Loading Component
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="gradient" text="Loading Echo..." />

        <motion.div
          className="mt-10 space-y-4 max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Modern Progress Bar */}
          <div className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
          </div>

          <motion.p
            className="text-sm font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Preparing your experience...
          </motion.p>

          {/* Loading Feature Hints */}
          <motion.div
            className="grid grid-cols-3 gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {['AI Chat', 'Social Feed', 'Mini Apps'].map((feature, i) => (
              <motion.div
                key={feature}
                className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
              >
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {feature}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
