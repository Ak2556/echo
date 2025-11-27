/**
 * @fileoverview Skeleton Loading Components
 * @description Skeleton screens for loading states
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { borderRadius, spacing } from '@/lib/design-system';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  style?: React.CSSProperties;
}

/**
 * Base Skeleton component
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius: radius = borderRadius.md,
  className = '',
  variant = 'rectangular',
  style = {},
}: SkeletonProps) {
  const variantStyles = {
    text: { height: '1rem', borderRadius: borderRadius.sm },
    circular: { borderRadius: '50%', aspectRatio: '1' },
    rectangular: { borderRadius: radius },
  };

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height: variant === 'circular' ? width : height,
        ...variantStyles[variant],
        background:
          'linear-gradient(90deg, var(--nothing-surface) 25%, var(--bg-secondary) 50%, var(--nothing-surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

/**
 * Post Card Skeleton
 */
export function PostCardSkeleton() {
  return (
    <div
      className="post-card-skeleton"
      style={{
        background: 'var(--bg)',
        borderRadius: borderRadius.xl,
        border: '1px solid var(--border)',
        padding: spacing[6],
        marginBottom: spacing[4],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          marginBottom: spacing[4],
        }}
      >
        <Skeleton variant="circular" width="48px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height="1rem" />
          <div style={{ marginTop: spacing[2] }}>
            <Skeleton width="60%" height="0.875rem" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: spacing[4] }}>
        <Skeleton width="100%" height="1rem" />
        <div style={{ marginTop: spacing[2] }}>
          <Skeleton width="95%" height="1rem" />
        </div>
        <div style={{ marginTop: spacing[2] }}>
          <Skeleton width="85%" height="1rem" />
        </div>
      </div>

      {/* Image */}
      <Skeleton
        width="100%"
        height="300px"
        borderRadius={borderRadius.lg}
        style={{ marginBottom: spacing[4] }}
      />

      {/* Tags */}
      <div
        style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[4] }}
      >
        <Skeleton width="80px" height="28px" borderRadius={borderRadius.full} />
        <Skeleton
          width="100px"
          height="28px"
          borderRadius={borderRadius.full}
        />
        <Skeleton width="90px" height="28px" borderRadius={borderRadius.full} />
      </div>

      {/* Stats */}
      <div
        style={{ display: 'flex', gap: spacing[6], marginBottom: spacing[4] }}
      >
        <Skeleton width="80px" height="1rem" />
        <Skeleton width="100px" height="1rem" />
        <Skeleton width="80px" height="1rem" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: spacing[3] }}>
        <Skeleton width="25%" height="44px" borderRadius={borderRadius.lg} />
        <Skeleton width="25%" height="44px" borderRadius={borderRadius.lg} />
        <Skeleton width="25%" height="44px" borderRadius={borderRadius.lg} />
        <Skeleton width="25%" height="44px" borderRadius={borderRadius.lg} />
      </div>
    </div>
  );
}

/**
 * Feed Loading Skeleton
 */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </>
  );
}

/**
 * Page Skeleton
 */
export function PageSkeleton() {
  return (
    <div style={{ padding: spacing[6] }}>
      {/* Title */}
      <Skeleton
        width="300px"
        height="2.5rem"
        style={{ marginBottom: spacing[8] }}
      />

      {/* Content sections */}
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ marginBottom: spacing[8] }}>
            <Skeleton
              width="200px"
              height="1.5rem"
              style={{ marginBottom: spacing[4] }}
            />
            <Skeleton width="100%" height="1rem" />
            <div style={{ marginTop: spacing[2] }}>
              <Skeleton width="95%" height="1rem" />
            </div>
            <div style={{ marginTop: spacing[2] }}>
              <Skeleton width="90%" height="1rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        padding: spacing[4],
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Skeleton variant="circular" width="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="1rem" />
        <div style={{ marginTop: spacing[2] }}>
          <Skeleton width="40%" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card Grid Skeleton
 */
export function CardGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: spacing[4],
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            background: 'var(--bg)',
            borderRadius: borderRadius.xl,
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <Skeleton width="100%" height="200px" borderRadius="0" />
          <div style={{ padding: spacing[4] }}>
            <Skeleton width="80%" height="1.25rem" />
            <div style={{ marginTop: spacing[2] }}>
              <Skeleton width="60%" height="1rem" />
            </div>
            <div style={{ marginTop: spacing[4] }}>
              <Skeleton
                width="100px"
                height="36px"
                borderRadius={borderRadius.lg}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
