/**
 * @fileoverview Empty State Component
 * @description Beautiful empty states for different scenarios
 * @version 1.0.0
 */

'use client';

import React, { ReactNode } from 'react';
import { spacing, borderRadius } from '@/lib/design-system';

export interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact' | 'illustration';
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const iconSizes = {
    default: '4rem',
    compact: '3rem',
    illustration: '6rem',
  };

  return (
    <div
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: variant === 'compact' ? spacing[8] : spacing[12],
        minHeight: variant === 'compact' ? '200px' : '400px',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        style={{
          fontSize: iconSizes[variant],
          marginBottom: spacing[4],
          opacity: 0.8,
        }}
      >
        {typeof icon === 'string' ? icon : icon}
      </div>

      {/* Title */}
      <h3
        style={{
          margin: 0,
          marginBottom: spacing[2],
          fontSize: variant === 'compact' ? '1.25rem' : '1.5rem',
          fontWeight: 700,
          color: 'var(--fg)',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            margin: 0,
            marginBottom: action ? spacing[6] : 0,
            maxWidth: '400px',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--nothing-text-secondary)',
          }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Predefined Empty States
 */

export function NoPostsEmptyState({
  onCreate,
  title = 'No Posts Yet',
  description = 'Be the first to share something amazing with your community!',
}: {
  onCreate?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon="✍️"
      title={title}
      description={description}
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="btn-gradient"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create Your First Post
          </button>
        )
      }
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon="💬"
      title="No Messages"
      description="Start a conversation with your friends and connections."
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon="🔔"
      title="All Caught Up!"
      description="You're up to date with all your notifications."
      variant="compact"
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try different keywords.`}
      variant="compact"
    />
  );
}

export function NoConnectionsEmptyState({
  onInvite,
}: {
  onInvite?: () => void;
}) {
  return (
    <EmptyState
      icon="👥"
      title="No Connections Yet"
      description="Connect with friends, colleagues, and like-minded people to grow your network."
      action={
        onInvite && (
          <button
            onClick={onInvite}
            className="btn-gradient"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Invite Friends
          </button>
        )
      }
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Something Went Wrong"
      description="We encountered an error while loading this content. Please try again."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="nothing-button"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )
      }
    />
  );
}

export function MaintenanceEmptyState() {
  return (
    <EmptyState
      icon="🔧"
      title="Under Maintenance"
      description="We're making improvements to serve you better. We'll be back shortly!"
    />
  );
}

export function NoProductsEmptyState() {
  return (
    <EmptyState
      icon="🛍️"
      title="No Products Available"
      description="Check back soon for exciting new products and offers."
    />
  );
}

export function NoEventsEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="📅"
      title="No Upcoming Events"
      description="Create or join events to connect with your community."
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="btn-gradient"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Create Event
          </button>
        )
      }
    />
  );
}

export default EmptyState;
