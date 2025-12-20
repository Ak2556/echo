'use client';

import React from 'react';
import {
  Inbox,
  Users,
  ShoppingBag,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Bell,
  Search,
  Bookmark,
  TrendingUp,
} from 'lucide-react';

/**
 * Beautiful Empty State Components
 * Modern, animated empty states for various scenarios
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        minHeight: '400px',
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          className="animate-float"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            color: 'white',
            fontSize: '3rem',
            boxShadow: '0 20px 60px rgba(var(--accent-rgb), 0.3)',
          }}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          color: 'var(--fg)',
        }}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--muted)',
          maxWidth: '500px',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {action && (
            <button
              onClick={action.onClick}
              className="btn-gradient hover-lift transition-smooth focus-ring"
              style={{
                padding: '0.875rem 2rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="btn-glass hover-scale transition-smooth focus-ring"
              style={{
                padding: '0.875rem 2rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured Empty States for common scenarios
 */

export function EmptyFeed({ onCreatePost }: { onCreatePost?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox size={48} />}
      title="Your feed is empty"
      description="Start following people and communities to see their posts here. Share your thoughts and connect with others!"
      action={
        onCreatePost
          ? {
              label: 'Create Your First Post',
              onClick: onCreatePost,
            }
          : undefined
      }
      secondaryAction={{
        label: 'Discover People',
        onClick: () => console.log('Discover'),
      }}
    />
  );
}

export function EmptyFollowers() {
  return (
    <EmptyState
      icon={<Users size={48} />}
      title="No followers yet"
      description="Share interesting content and engage with the community to grow your audience. Your followers will appear here."
      action={{
        label: 'Share Your First Post',
        onClick: () => console.log('Create post'),
      }}
    />
  );
}

export function EmptyCart({
  onBrowseProducts,
}: {
  onBrowseProducts?: () => void;
}) {
  return (
    <EmptyState
      icon={<ShoppingBag size={48} />}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Browse our collection and find something you love!"
      action={
        onBrowseProducts
          ? {
              label: 'Start Shopping',
              onClick: onBrowseProducts,
            }
          : {
              label: 'Browse Products',
              onClick: () => console.log('Browse'),
            }
      }
    />
  );
}

export function EmptyLikes() {
  return (
    <EmptyState
      icon={<Heart size={48} />}
      title="No liked posts"
      description="Posts you like will appear here. Start exploring and show some love to content you enjoy!"
      action={{
        label: 'Explore Feed',
        onClick: () => console.log('Explore'),
      }}
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={<MessageCircle size={48} />}
      title="No messages"
      description="Your inbox is empty. Start a conversation with your friends or discover new connections!"
      action={{
        label: 'Start a Conversation',
        onClick: () => console.log('New message'),
      }}
      secondaryAction={{
        label: 'Find Friends',
        onClick: () => console.log('Find friends'),
      }}
    />
  );
}

export function EmptyPhotos({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<ImageIcon size={48} />}
      title="No photos yet"
      description="Share your moments! Upload photos to create your visual story and memories."
      action={
        onUpload
          ? {
              label: 'Upload Photos',
              onClick: onUpload,
            }
          : undefined
      }
    />
  );
}

export function EmptyVideos({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<Video size={48} />}
      title="No videos yet"
      description="Upload your first video and start sharing your stories with the world!"
      action={
        onUpload
          ? {
              label: 'Upload Video',
              onClick: onUpload,
            }
          : undefined
      }
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell size={48} />}
      title="All caught up!"
      description="You don't have any notifications right now. We'll let you know when something new happens."
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search size={48} />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords or check your spelling.`}
      action={{
        label: 'Clear Search',
        onClick: () => console.log('Clear'),
      }}
    />
  );
}

export function EmptyBookmarks() {
  return (
    <EmptyState
      icon={<Bookmark size={48} />}
      title="No bookmarks yet"
      description="Save posts you want to revisit later. Your bookmarked content will appear here."
      action={{
        label: 'Explore Content',
        onClick: () => console.log('Explore'),
      }}
    />
  );
}

export function EmptyTrending() {
  return (
    <EmptyState
      icon={<TrendingUp size={48} />}
      title="Nothing trending yet"
      description="Be the first to start a trend! Share interesting content and watch it gain momentum."
      action={{
        label: 'Create Content',
        onClick: () => console.log('Create'),
      }}
    />
  );
}

/**
 * Compact Empty State (for smaller areas)
 */
export function CompactEmptyState({
  icon,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--muted)',
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          marginBottom: onAction ? '1rem' : 0,
        }}
      >
        {message}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="btn-glass hover-scale transition-smooth"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Minimal Empty State (just text)
 */
export function MinimalEmptyState({ message }: { message: string }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.95rem',
      }}
    >
      {message}
    </div>
  );
}

export default EmptyState;
