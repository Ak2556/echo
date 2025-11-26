'use client';

import React from 'react';
import { useToast, Toast, ToastType } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';

const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return 'ℹ';
  }
};

const getToastColor = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '#10b981';
    case 'error':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    case 'info':
      return 'var(--nothing-glyph)';
    default:
      return 'var(--nothing-glyph)';
  }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const { shouldShowAnimation } = useSettings();
  const showAnimation = shouldShowAnimation();

  return (
    <div
      className="nothing-widget"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '320px',
        maxWidth: '420px',
        animation: showAnimation ? 'slideInRight 0.3s ease-out' : 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: `1px solid ${getToastColor(toast.type)}20`,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: getToastColor(toast.type),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {getToastIcon(toast.type)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {toast.message}
        </p>
      </div>

      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            onRemove(toast.id);
          }}
          className="nothing-button"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            flexShrink: 0,
          }}
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
          color: 'var(--fg)',
          opacity: 0.6,
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '5rem',
          right: '1rem',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      </div>
    </>
  );
}
