'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Advanced Modal Component
 * Beautiful modals with animations, backdrop blur, and variants
 */

export interface AdvancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'gradient' | 'premium';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'slide-right';
}

export default function AdvancedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  animation = 'scale',
}: AdvancedModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isVisible) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px' };
      case 'md':
        return { maxWidth: '600px' };
      case 'lg':
        return { maxWidth: '800px' };
      case 'xl':
        return { maxWidth: '1200px' };
      case 'full':
        return { maxWidth: '95vw', height: '95vh' };
      default:
        return { maxWidth: '600px' };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        };
      case 'gradient':
        return {
          background: 'var(--gradient-primary)',
          color: 'white',
          border: 'none',
        };
      case 'premium':
        return {
          background: 'var(--bg)',
          border: '1px solid rgba(var(--accent-rgb), 0.3)',
          boxShadow:
            '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(var(--accent-rgb), 0.2)',
          borderTop: '3px solid var(--accent)',
        };
      default:
        return {
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-5)',
        };
    }
  };

  const getAnimationClass = () => {
    if (!isAnimating) return '';

    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-fade-in-up';
      case 'slide-down':
        return 'animate-fade-in-down';
      case 'scale':
        return 'animate-scale-in';
      case 'slide-right':
        return 'animate-slide-in-right';
      default:
        return 'animate-scale-in';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity var(--transition-base)',
          cursor: closeOnBackdrop ? 'pointer' : 'default',
        }}
      />

      {/* Modal */}
      <div
        className={`${getAnimationClass()} transition-smooth`}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'scale(1)' : 'scale(0.9)',
          transition: 'all var(--transition-base)',
          ...getSizeStyles(),
          ...getVariantStyles(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom:
                variant === 'gradient' ? 'none' : '1px solid var(--border)',
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: variant === 'gradient' ? 'white' : 'var(--fg)',
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="hover-scale transition-smooth focus-ring"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  color: variant === 'gradient' ? 'white' : 'var(--fg)',
                  marginLeft: 'auto',
                }}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            maxHeight: size === 'full' ? 'calc(95vh - 180px)' : '70vh',
            overflowY: 'auto',
            color: variant === 'gradient' ? 'white' : 'var(--fg)',
          }}
          className="custom-scrollbar"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1.5rem',
              borderTop:
                variant === 'gradient' ? 'none' : '1px solid var(--border)',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Confirmation Modal
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'default';
}) {
  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      default:
        return 'var(--accent)';
    }
  };

  return (
    <AdvancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant="premium"
      animation="scale"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-glass transition-smooth hover-scale"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn-gradient transition-smooth hover-scale"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              background: getButtonColor(),
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{message}</p>
    </AdvancedModal>
  );
}

/**
 * Image Viewer Modal
 */
export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}) {
  return (
    <AdvancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      variant="glass"
      animation="scale"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={imageUrl}
          alt={title || 'Image'}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: 'var(--radius-lg)',
            objectFit: 'contain',
          }}
        />
      </div>
    </AdvancedModal>
  );
}

/**
 * Video Player Modal
 */
export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}) {
  return (
    <AdvancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      variant="default"
      animation="scale"
    >
      <video
        controls
        autoPlay
        style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </AdvancedModal>
  );
}
