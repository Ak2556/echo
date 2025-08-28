'use client';

import React from 'react';

/**
 * Loading Skeleton Components
 * Modern skeleton loaders for better perceived performance
 */

// Base Skeleton Component
export function Skeleton({
  className = '',
  style = {}
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <div className="modern-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Skeleton className="skeleton-avatar" />
        <div style={{ marginLeft: '1rem', flex: 1 }}>
          <Skeleton style={{ height: '1rem', width: '150px', marginBottom: '0.5rem' }} />
          <Skeleton style={{ height: '0.75rem', width: '100px' }} />
        </div>
      </div>
      <Skeleton style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1rem', width: '90%', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1rem', width: '70%', marginBottom: '1rem' }} />
      <Skeleton style={{ height: '300px', width: '100%', marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }} />
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Skeleton style={{ height: '1rem', width: '60px' }} />
        <Skeleton style={{ height: '1rem', width: '60px' }} />
        <Skeleton style={{ height: '1rem', width: '60px' }} />
      </div>
    </div>
  );
}

// Feed Skeleton (Multiple Posts)
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="modern-card" style={{ padding: '1rem' }}>
      <Skeleton style={{
        height: '250px',
        width: '100%',
        marginBottom: '1rem',
        borderRadius: 'var(--radius-lg)'
      }} />
      <Skeleton style={{ height: '1.25rem', width: '80%', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1rem', width: '40%', marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Skeleton style={{ height: '1.5rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '60px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Skeleton style={{ height: '2.5rem', flex: 1 }} />
        <Skeleton style={{ height: '2.5rem', width: '2.5rem' }} />
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      padding: '1rem'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="modern-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
      {/* Cover Photo */}
      <Skeleton style={{
        height: '200px',
        width: '100%',
        marginBottom: '-4rem',
        borderRadius: 'var(--radius-lg)'
      }} />

      {/* Profile Info */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        paddingTop: '1rem'
      }}>
        <Skeleton style={{
          width: '120px',
          height: '120px',
          borderRadius: 'var(--radius-full)',
          border: '4px solid var(--bg)'
        }} />
        <div style={{ flex: 1, paddingBottom: '1rem' }}>
          <Skeleton style={{ height: '1.5rem', width: '200px', marginBottom: '0.5rem' }} />
          <Skeleton style={{ height: '1rem', width: '150px' }} />
        </div>
      </div>

      {/* Bio */}
      <Skeleton style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1rem', width: '80%', marginBottom: '1rem' }} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Skeleton style={{ height: '1rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '80px' }} />
      </div>
    </div>
  );
}

// Notification Skeleton
export function NotificationSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      gap: '1rem'
    }}>
      <Skeleton className="skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }} />
        <Skeleton style={{ height: '0.75rem', width: '60%' }} />
      </div>
    </div>
  );
}

// Notification List Skeleton
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </>
  );
}

// User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="modern-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Skeleton className="skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <Skeleton style={{ height: '1rem', width: '150px', marginBottom: '0.5rem' }} />
          <Skeleton style={{ height: '0.875rem', width: '100px' }} />
        </div>
        <Skeleton className="skeleton-button" />
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="modern-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Skeleton style={{ height: '1rem', width: '120px' }} />
        <Skeleton style={{ height: '2rem', width: '2rem', borderRadius: 'var(--radius-md)' }} />
      </div>
      <Skeleton style={{ height: '2rem', width: '80px', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '0.875rem', width: '100px' }} />
    </div>
  );
}

// Analytics Dashboard Skeleton
export function AnalyticsDashboardSkeleton() {
  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Skeleton style={{ height: '2rem', width: '250px', marginBottom: '2rem' }} />

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Chart */}
      <div className="modern-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <Skeleton style={{ height: '1.5rem', width: '180px', marginBottom: '1.5rem' }} />
        <Skeleton style={{ height: '300px', width: '100%' }} />
      </div>

      {/* Additional Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="modern-card" style={{ padding: '1.5rem' }}>
          <Skeleton style={{ height: '1.5rem', width: '200px', marginBottom: '1rem' }} />
          <Skeleton style={{ height: '200px', width: '100%' }} />
        </div>
        <div className="modern-card" style={{ padding: '1.5rem' }}>
          <Skeleton style={{ height: '1.5rem', width: '150px', marginBottom: '1rem' }} />
          <Skeleton style={{ height: '200px', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

// Comment Skeleton
export function CommentSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      display: 'flex',
      gap: '1rem'
    }}>
      <Skeleton style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)' }} />
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: '0.875rem', width: '120px', marginBottom: '0.5rem' }} />
        <Skeleton style={{ height: '1rem', width: '100%', marginBottom: '0.25rem' }} />
        <Skeleton style={{ height: '1rem', width: '80%' }} />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="modern-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '1rem'
      }}>
        <Skeleton style={{ height: '1rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '80px' }} />
        <Skeleton style={{ height: '1rem', width: '80px' }} />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: i < rows - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
          }}
        >
          <Skeleton style={{ height: '1rem', width: '100%' }} />
          <Skeleton style={{ height: '1rem', width: '100%' }} />
          <Skeleton style={{ height: '1rem', width: '100%' }} />
          <Skeleton style={{ height: '1rem', width: '100%' }} />
        </div>
      ))}
    </div>
  );
}

// Full Page Skeleton
export function FullPageSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Skeleton style={{ height: '3rem', width: '300px', marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <FeedSkeleton count={3} />
        </div>
        <div>
          <div className="modern-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <Skeleton style={{ height: '1.5rem', width: '150px', marginBottom: '1rem' }} />
            <Skeleton style={{ height: '200px', width: '100%' }} />
          </div>
          <div className="modern-card" style={{ padding: '1.5rem' }}>
            <Skeleton style={{ height: '1.5rem', width: '150px', marginBottom: '1rem' }} />
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Loading Spinner
export function LoadingSpinner({
  size = 24,
  color = 'var(--accent)'
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div
      className="animate-spin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid rgba(255, 255, 255, 0.1)`,
        borderTopColor: color,
        borderRadius: '50%'
      }}
      aria-label="Loading"
    />
  );
}

// Loading Overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 9999
    }}>
      <LoadingSpinner size={48} />
      <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600 }}>
        {message}
      </p>
    </div>
  );
}

export default {
  Skeleton,
  PostCardSkeleton,
  FeedSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProfileHeaderSkeleton,
  NotificationSkeleton,
  NotificationListSkeleton,
  UserCardSkeleton,
  StatsCardSkeleton,
  AnalyticsDashboardSkeleton,
  CommentSkeleton,
  TableSkeleton,
  FullPageSkeleton,
  LoadingSpinner,
  LoadingOverlay,
};
