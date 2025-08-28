'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  XCircle,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  FileX,
  RefreshCw,
  Home,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

type ErrorType =
  | 'general'
  | 'network'
  | 'server'
  | 'not-found'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'timeout';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  suggestion?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  showIcon?: boolean;
}

const errorConfig = {
  general: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    title: 'Something went wrong',
    message: 'We encountered an unexpected error. Please try again.',
    suggestion: 'If the problem persists, please contact support.',
  },
  network: {
    icon: WifiOff,
    iconColor: 'text-red-500',
    title: 'Connection lost',
    message: 'Unable to connect to the internet.',
    suggestion: 'Check your internet connection and try again.',
  },
  server: {
    icon: ServerCrash,
    iconColor: 'text-red-500',
    title: 'Server error',
    message: 'Our servers are experiencing issues.',
    suggestion: 'Our team has been notified. Please try again in a few moments.',
  },
  'not-found': {
    icon: FileX,
    iconColor: 'text-gray-500',
    title: 'Page not found',
    message: "The page you're looking for doesn't exist.",
    suggestion: 'Check the URL or return to the home page.',
  },
  unauthorized: {
    icon: ShieldAlert,
    iconColor: 'text-orange-500',
    title: 'Authentication required',
    message: 'You need to sign in to access this page.',
    suggestion: 'Please log in with your credentials.',
  },
  forbidden: {
    icon: ShieldAlert,
    iconColor: 'text-red-500',
    title: 'Access denied',
    message: "You don't have permission to access this resource.",
    suggestion: 'Contact your administrator if you believe this is an error.',
  },
  validation: {
    icon: XCircle,
    iconColor: 'text-red-500',
    title: 'Validation failed',
    message: 'Some information provided is incorrect.',
    suggestion: 'Please review your input and try again.',
  },
  timeout: {
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    title: 'Request timeout',
    message: 'The request took too long to complete.',
    suggestion: 'Check your connection and try again.',
  },
};

const ErrorState = memo(function ErrorState({
  type = 'general',
  title,
  message,
  suggestion,
  onRetry,
  onGoBack,
  onGoHome,
  className,
  showIcon = true,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalSuggestion = suggestion || config.suggestion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'min-h-[400px] w-full px-4 py-8 text-center',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'mb-6 rounded-full bg-gray-100 dark:bg-gray-800 p-6',
            config.iconColor
          )}
        >
          <Icon
            className="w-12 h-12"
            aria-hidden="true"
          />
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
      >
        {finalTitle}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-base text-gray-600 dark:text-gray-400 mb-2 max-w-md"
      >
        {finalMessage}
      </motion.p>

      {finalSuggestion && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 dark:text-gray-500 mb-8 max-w-md"
        >
          {finalSuggestion}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="inline-flex items-center gap-2"
            aria-label="Retry action"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>
        )}

        {onGoBack && (
          <Button
            variant="outline"
            onClick={onGoBack}
            className="inline-flex items-center gap-2"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Go back
          </Button>
        )}

        {onGoHome && (
          <Button
            variant="outline"
            onClick={onGoHome}
            className="inline-flex items-center gap-2"
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Home
          </Button>
        )}
      </motion.div>

      {/* Additional help text for screen readers */}
      <div className="sr-only">
        Error: {finalTitle}. {finalMessage}. {finalSuggestion}
      </div>
    </motion.div>
  );
});

export default ErrorState;

// Convenience components
export const NetworkError = memo((props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="network" {...props} />
));

export const ServerError = memo((props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="server" {...props} />
));

export const NotFoundError = memo((props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="not-found" {...props} />
));

export const UnauthorizedError = memo((props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="unauthorized" {...props} />
));

export const ForbiddenError = memo((props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="forbidden" {...props} />
));

NetworkError.displayName = 'NetworkError';
ServerError.displayName = 'ServerError';
NotFoundError.displayName = 'NotFoundError';
UnauthorizedError.displayName = 'UnauthorizedError';
ForbiddenError.displayName = 'ForbiddenError';
