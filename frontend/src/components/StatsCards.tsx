'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  ShoppingCart,
  DollarSign,
  Activity,
} from 'lucide-react';

/**
 * Stats & Metrics Cards
 * Beautiful dashboard statistics components
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  color?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  color = 'var(--accent)',
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const getVariantStyle = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: 'var(--gradient-primary)',
          color: 'white',
          border: 'none',
        };
      case 'glass':
        return {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
        };
      default:
        return {
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        };
    }
  };

  return (
    <div
      className="modern-card hover-lift transition-smooth"
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        ...getVariantStyle(),
      }}
    >
      {/* Background Pattern */}
      {variant === 'default' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            opacity: 0.05,
            transform: 'translate(30%, -30%)',
          }}
        >
          {icon || <Activity size={100} />}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color:
              variant === 'gradient' ? 'rgba(255,255,255,0.9)' : 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </h3>

        {icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background:
                variant === 'gradient'
                  ? 'rgba(255,255,255,0.2)'
                  : `rgba(var(--accent-rgb), 0.1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: variant === 'gradient' ? 'white' : color,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: variant === 'gradient' ? 'white' : 'var(--fg)',
        }}
      >
        {value}
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className="badge"
            style={{
              background: isPositive
                ? 'rgba(16, 185, 129, 0.1)'
                : isNegative
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'var(--bg-tertiary)',
              color: isPositive
                ? '#10b981'
                : isNegative
                  ? '#ef4444'
                  : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {isPositive ? (
              <TrendingUp size={14} />
            ) : isNegative ? (
              <TrendingDown size={14} />
            ) : null}
            {Math.abs(change)}%
          </div>
          {changeLabel && (
            <span
              style={{
                fontSize: '0.75rem',
                color:
                  variant === 'gradient'
                    ? 'rgba(255,255,255,0.8)'
                    : 'var(--muted)',
              }}
            >
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Stats Grid
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      {children}
    </div>
  );
}

// Mini Stats Card (compact version)
export function MiniStatsCard({
  label,
  value,
  icon,
  color = 'var(--accent)',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="glass hover-scale transition-smooth"
      style={{
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          background: `rgba(var(--accent-rgb), 0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted)',
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

// Progress Stats Card
export function ProgressStatsCard({
  title,
  current,
  target,
  unit = '',
  icon,
}: {
  title: string;
  current: number;
  target: number;
  unit?: string;
  icon?: React.ReactNode;
}) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="modern-card" style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h3>
        {icon && <div style={{ color: 'var(--accent)' }}>{icon}</div>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}
        >
          {current.toLocaleString()}
          {unit && (
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 400,
                color: 'var(--muted)',
              }}
            >
              {' '}
              {unit}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          of {target.toLocaleString()}
          {unit} goal
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '8px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          className="animated-gradient"
          style={{
            height: '100%',
            width: `${percentage}%`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'var(--gradient-primary)',
          }}
        />
      </div>

      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          textAlign: 'right',
        }}
      >
        {percentage.toFixed(1)}% Complete
      </div>
    </div>
  );
}

// Comparison Stats Card
export function ComparisonStatsCard({
  title,
  current,
  previous,
  label,
  icon,
}: {
  title: string;
  current: number;
  previous: number;
  label: string;
  icon?: React.ReactNode;
}) {
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <div className="card-premium" style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h3>
        {icon && <div style={{ color: 'var(--accent)' }}>{icon}</div>}
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        {/* Current */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              marginBottom: '0.5rem',
            }}
          >
            Current {label}
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {current.toLocaleString()}
          </div>
        </div>

        {/* Previous */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              marginBottom: '0.5rem',
            }}
          >
            Previous {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {previous.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Change Indicator */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: isPositive
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {isPositive ? (
          <TrendingUp size={18} color="#10b981" />
        ) : (
          <TrendingDown size={18} color="#ef4444" />
        )}
        <span
          style={{ fontWeight: 600, color: isPositive ? '#10b981' : '#ef4444' }}
        >
          {isPositive ? '+' : ''}
          {change.toFixed(1)}% vs last {label.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

// Pre-built Dashboard Stats
export function DashboardStats() {
  return (
    <StatsGrid>
      <StatsCard
        title="Total Users"
        value="12,345"
        change={12.5}
        changeLabel="vs last month"
        icon={<Users size={24} />}
        variant="default"
      />

      <StatsCard
        title="Page Views"
        value="1.2M"
        change={8.3}
        changeLabel="vs last month"
        icon={<Eye size={24} />}
        variant="gradient"
      />

      <StatsCard
        title="Total Likes"
        value="45.2K"
        change={-2.4}
        changeLabel="vs last month"
        icon={<Heart size={24} />}
        variant="glass"
      />

      <StatsCard
        title="Revenue"
        value="$24,567"
        change={15.8}
        changeLabel="vs last month"
        icon={<DollarSign size={24} />}
        variant="default"
      />
    </StatsGrid>
  );
}

export default {
  StatsCard,
  StatsGrid,
  MiniStatsCard,
  ProgressStatsCard,
  ComparisonStatsCard,
  DashboardStats,
};
