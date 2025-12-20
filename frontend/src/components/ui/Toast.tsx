'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto remove after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }

      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position={position}
        toasts={toasts}
        onRemove={removeToast}
      />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  position: ToastPosition;
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ position, toasts, onRemove }: ToastContainerProps) {
  if (typeof window === 'undefined') return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return createPortal(
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-2',
        positionClasses[position]
      )}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  position: ToastPosition;
}

const ToastItem = memo(function ToastItem({
  toast,
  onRemove,
  position,
}: ToastItemProps) {
  const [progress, setProgress] = React.useState(100);
  const [isPaused, setIsPaused] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = React.useRef<number>(Date.now());
  const remainingTimeRef = React.useRef<number>(toast.duration || 5000);

  const isRight = position.includes('right');
  const isLeft = position.includes('left');

  const slideDirection = isRight ? 100 : isLeft ? -100 : 0;

  // Progress bar animation
  React.useEffect(() => {
    if (toast.duration === 0) return;

    const duration = toast.duration || 5000;
    const interval = 50;

    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(newProgress);

        if (newProgress > 0) {
          timerRef.current = setTimeout(tick, interval);
        }
      }
    };

    startTimeRef.current = Date.now();
    tick();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, isPaused]);

  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const style = typeStyles[toast.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: slideDirection, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: slideDirection, scale: 0.9, y: -10 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] // Apple easing
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'relative max-w-sm w-full rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        style.bg,
        style.border
      )}
    >
      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <motion.div
            className={cn('h-full', style.iconColor.replace('text-', 'bg-'))}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3 mt-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', style.iconColor)} />
        </motion.div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={cn(
                'mt-2 text-sm font-medium underline hover:no-underline',
                style.iconColor
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});

// Convenience hooks
export function useToastActions() {
  const { addToast } = useToast();

  const success = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
    ) => {
      return addToast({ type: 'success', message, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
    ) => {
      return addToast({ type: 'error', message, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
    ) => {
      return addToast({ type: 'warning', message, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
    ) => {
      return addToast({ type: 'info', message, ...options });
    },
    [addToast]
  );

  return { success, error, warning, info };
}

// Simple toast function for quick usage
export const toast = {
  success: (
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
  ) => {
    // This will only work if ToastProvider is mounted
    const event = new CustomEvent('toast', {
      detail: { type: 'success', message, ...options },
    });
    window.dispatchEvent(event);
  },
  error: (
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
  ) => {
    const event = new CustomEvent('toast', {
      detail: { type: 'error', message, ...options },
    });
    window.dispatchEvent(event);
  },
  warning: (
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
  ) => {
    const event = new CustomEvent('toast', {
      detail: { type: 'warning', message, ...options },
    });
    window.dispatchEvent(event);
  },
  info: (
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>
  ) => {
    const event = new CustomEvent('toast', {
      detail: { type: 'info', message, ...options },
    });
    window.dispatchEvent(event);
  },
};
