'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useMotionPreference';

type LoadingType = 'page' | 'section' | 'inline' | 'button' | 'overlay' | 'refresh';
type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingStateProps {
  type?: LoadingType;
  size?: LoadingSize;
  message?: string;
  className?: string;
}

const LoadingState = memo(function LoadingState({
  type = 'section',
  size = 'md',
  message,
  className,
}: LoadingStateProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Page Loading - Full screen with fade-in background
  if (type === 'page') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center',
          'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
          className
        )}
      >
        <Loader2
          className={cn(
            'animate-spin text-blue-600',
            sizeClasses.lg
          )}
          aria-hidden="true"
        />
        {message && (
          <p className={cn(
            'mt-4 text-gray-600 dark:text-gray-400',
            textSizeClasses.lg
          )}>
            {message}
          </p>
        )}
        <span className="sr-only">Loading content...</span>
      </motion.div>
    );
  }

  // Section Loading - Contained within a section with min-height
  if (type === 'section') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[300px] w-full',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2
          className={cn(
            'animate-spin text-blue-600',
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        {message && (
          <p className={cn(
            'mt-3 text-gray-600 dark:text-gray-400',
            textSizeClasses[size]
          )}>
            {message}
          </p>
        )}
        <span className="sr-only">{message || 'Loading...'}</span>
      </div>
    );
  }

  // Inline Loading - Small spinner for inline use
  if (type === 'inline') {
    return (
      <span
        className={cn('inline-flex items-center gap-2', className)}
        role="status"
        aria-live="polite"
      >
        <Loader2
          className={cn(
            'animate-spin text-blue-600',
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        {message && (
          <span className={cn('text-gray-600 dark:text-gray-400', textSizeClasses[size])}>
            {message}
          </span>
        )}
        <span className="sr-only">{message || 'Loading...'}</span>
      </span>
    );
  }

  // Button Loading - Optimized for button state
  if (type === 'button') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)} role="status">
        <Loader2
          className={cn('animate-spin', sizeClasses[size])}
          aria-hidden="true"
        />
        {message && <span>{message}</span>}
        <span className="sr-only">{message || 'Loading...'}</span>
      </span>
    );
  }

  // Overlay Loading - Semi-transparent overlay over existing content
  if (type === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'absolute inset-0 z-10',
          'flex items-center justify-center',
          'bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center">
          <Loader2
            className={cn(
              'animate-spin text-blue-600',
              sizeClasses[size]
            )}
            aria-hidden="true"
          />
          {message && (
            <p className={cn(
              'mt-3 text-gray-600 dark:text-gray-400',
              textSizeClasses[size]
            )}>
              {message}
            </p>
          )}
        </div>
        <span className="sr-only">{message || 'Loading...'}</span>
      </motion.div>
    );
  }

  // Refresh Loading - Small indicator for pull-to-refresh or incremental loads
  if (type === 'refresh') {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-4',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2
          className={cn(
            'animate-spin text-blue-600',
            sizeClasses.sm
          )}
          aria-hidden="true"
        />
        {message && (
          <span className={cn(
            'ml-2 text-gray-600 dark:text-gray-400',
            textSizeClasses.sm
          )}>
            {message}
          </span>
        )}
        <span className="sr-only">{message || 'Refreshing...'}</span>
      </div>
    );
  }

  return null;
});

export default LoadingState;

// Convenience components for specific use cases
export const PageLoader = memo(({ message }: { message?: string }) => (
  <LoadingState type="page" size="lg" message={message || 'Loading page...'} />
));

export const SectionLoader = memo(({ message }: { message?: string }) => (
  <LoadingState type="section" size="md" message={message} />
));

export const InlineLoader = memo(({ message, size = 'sm' }: { message?: string; size?: LoadingSize }) => (
  <LoadingState type="inline" size={size} message={message} />
));

export const ButtonLoader = memo(({ message }: { message?: string }) => (
  <LoadingState type="button" size="sm" message={message} />
));

export const OverlayLoader = memo(({ message }: { message?: string }) => (
  <LoadingState type="overlay" size="md" message={message} />
));

export const RefreshLoader = memo(({ message }: { message?: string }) => (
  <LoadingState type="refresh" message={message || 'Refreshing...'} />
));

PageLoader.displayName = 'PageLoader';
SectionLoader.displayName = 'SectionLoader';
InlineLoader.displayName = 'InlineLoader';
ButtonLoader.displayName = 'ButtonLoader';
OverlayLoader.displayName = 'OverlayLoader';
RefreshLoader.displayName = 'RefreshLoader';
