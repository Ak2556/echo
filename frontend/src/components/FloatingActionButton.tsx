'use client';

import React, { useState } from 'react';
import {
  Plus,
  X,
  MessageCircle,
  Camera,
  Edit,
  Share2,
  Heart,
  Bookmark,
} from 'lucide-react';

/**
 * Floating Action Button (FAB) Component
 * Modern FAB with expandable menu for quick actions
 */

export interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  /** Primary action when FAB is clicked */
  mainAction?: () => void;
  /** Array of quick actions to show in expanded menu */
  actions?: FABAction[];
  /** Position of the FAB */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom icon for main button */
  icon?: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Whether to show the FAB */
  show?: boolean;
}

export default function FloatingActionButton({
  mainAction,
  actions = [],
  position = 'bottom-right',
  icon = <Plus size={24} />,
  tooltip = 'Quick Actions',
  show = true,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!show) return null;

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (mainAction) {
      mainAction();
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: '2rem', right: '2rem' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '2rem', left: '2rem' };
      case 'top-right':
        return { ...baseStyles, top: '6rem', right: '2rem' };
      case 'top-left':
        return { ...baseStyles, top: '6rem', left: '2rem' };
      default:
        return { ...baseStyles, bottom: '2rem', right: '2rem' };
    }
  };

  return (
    <div style={getPositionStyles()}>
      {/* Backdrop */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
            zIndex: -1,
          }}
        />
      )}

      {/* Action Menu */}
      {isExpanded && actions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: position.includes('bottom') ? '5rem' : 'auto',
            top: position.includes('top') ? '5rem' : 'auto',
            right: position.includes('right') ? 0 : 'auto',
            left: position.includes('left') ? 0 : 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: position.includes('right') ? 'flex-end' : 'flex-start',
          }}
        >
          {actions.map((action, index) => (
            <div
              key={index}
              className="animate-scale-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexDirection: position.includes('right')
                  ? 'row-reverse'
                  : 'row',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards',
              }}
            >
              {/* Action Label */}
              <div
                className="glass elevation-2"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: 'var(--fg)',
                }}
              >
                {action.label}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                className="hover-scale transition-smooth focus-ring"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: action.color || 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--elevation-3)',
                }}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleMainClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fab hover-lift"
        style={{
          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all var(--transition-base)',
        }}
        aria-label={tooltip}
      >
        {isExpanded && actions.length > 0 ? <X size={24} /> : icon}
      </button>

      {/* Tooltip */}
      {showTooltip && !isExpanded && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: position.includes('bottom') ? '100%' : 'auto',
            top: position.includes('top') ? '100%' : 'auto',
            right: position.includes('right') ? 0 : 'auto',
            left: position.includes('left') ? 0 : 'auto',
            marginBottom: position.includes('bottom') ? '0.5rem' : 0,
            marginTop: position.includes('top') ? '0.5rem' : 0,
            padding: '0.5rem 1rem',
            background: 'var(--bg-tertiary, rgba(0, 0, 0, 0.9))',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--elevation-3)',
            pointerEvents: 'none',
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured FAB variants for common use cases
 */

// Create Post FAB
export function CreatePostFAB({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <FloatingActionButton
      mainAction={onCreatePost}
      icon={<Edit size={24} />}
      tooltip="Create Post"
    />
  );
}

// Quick Actions FAB
export function QuickActionsFAB({
  onMessage,
  onCamera,
  onShare,
  onLike,
}: {
  onMessage?: () => void;
  onCamera?: () => void;
  onShare?: () => void;
  onLike?: () => void;
}) {
  const actions: FABAction[] = [];

  if (onMessage) {
    actions.push({
      icon: <MessageCircle size={20} />,
      label: 'Message',
      onClick: onMessage,
      color: '#3b82f6',
    });
  }

  if (onCamera) {
    actions.push({
      icon: <Camera size={20} />,
      label: 'Camera',
      onClick: onCamera,
      color: '#8b5cf6',
    });
  }

  if (onShare) {
    actions.push({
      icon: <Share2 size={20} />,
      label: 'Share',
      onClick: onShare,
      color: '#10b981',
    });
  }

  if (onLike) {
    actions.push({
      icon: <Heart size={20} />,
      label: 'Like',
      onClick: onLike,
      color: '#ef4444',
    });
  }

  return <FloatingActionButton actions={actions} tooltip="Quick Actions" />;
}

// Social Actions FAB
export function SocialActionsFAB({
  onCreatePost,
  onStartLive,
  onUploadPhoto,
  onShareStory,
}: {
  onCreatePost?: () => void;
  onStartLive?: () => void;
  onUploadPhoto?: () => void;
  onShareStory?: () => void;
}) {
  const actions: FABAction[] = [];

  if (onCreatePost) {
    actions.push({
      icon: <Edit size={20} />,
      label: 'Create Post',
      onClick: onCreatePost,
      color: 'var(--accent)',
    });
  }

  if (onUploadPhoto) {
    actions.push({
      icon: <Camera size={20} />,
      label: 'Upload Photo',
      onClick: onUploadPhoto,
      color: '#8b5cf6',
    });
  }

  if (onShareStory) {
    actions.push({
      icon: <Bookmark size={20} />,
      label: 'Share Story',
      onClick: onShareStory,
      color: '#f59e0b',
    });
  }

  if (onStartLive) {
    actions.push({
      icon: <span style={{ fontSize: '20px' }}>📡</span>,
      label: 'Go Live',
      onClick: onStartLive,
      color: '#ef4444',
    });
  }

  return (
    <FloatingActionButton
      actions={actions}
      icon={<Plus size={24} />}
      tooltip="Create Content"
    />
  );
}

// Shopping FAB
export function ShoppingFAB({
  onViewCart,
  onQuickOrder,
  onScanProduct,
}: {
  onViewCart?: () => void;
  onQuickOrder?: () => void;
  onScanProduct?: () => void;
}) {
  const actions: FABAction[] = [];

  if (onViewCart) {
    actions.push({
      icon: <span style={{ fontSize: '20px' }}>🛒</span>,
      label: 'View Cart',
      onClick: onViewCart,
      color: 'var(--accent)',
    });
  }

  if (onQuickOrder) {
    actions.push({
      icon: <span style={{ fontSize: '20px' }}>⚡</span>,
      label: 'Quick Order',
      onClick: onQuickOrder,
      color: '#10b981',
    });
  }

  if (onScanProduct) {
    actions.push({
      icon: <Camera size={20} />,
      label: 'Scan Product',
      onClick: onScanProduct,
      color: '#8b5cf6',
    });
  }

  return (
    <FloatingActionButton
      actions={actions}
      icon={<Plus size={24} />}
      tooltip="Shopping Actions"
    />
  );
}
