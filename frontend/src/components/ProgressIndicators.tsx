'use client';

import React from 'react';

/**
 * Advanced Progress Indicators & Loaders
 * Beautiful, animated progress components
 */

// Linear Progress Bar
export function LinearProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  animated = true
}: {
  value?: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'striped' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return '4px';
      case 'md':
        return '8px';
      case 'lg':
        return '12px';
      default:
        return '8px';
    }
  };

  const getBackground = () => {
    switch (variant) {
      case 'gradient':
        return 'var(--gradient-primary)';
      case 'glow':
        return 'var(--accent)';
      default:
        return 'var(--accent)';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: getHeight(),
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: getBackground(),
            borderRadius: 'var(--radius-full)',
            transition: animated ? 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: variant === 'glow' ? '0 0 20px rgba(var(--accent-rgb), 0.5)' : 'none'
          }}
        >
          {variant === 'striped' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  'linear-gradient(45deg, rgba(255,255,255,.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.2) 75%, transparent 75%, transparent)',
                backgroundSize: '1rem 1rem',
                animation: animated ? 'stripe-move 1s linear infinite' : 'none'
              }}
            />
          )}
        </div>
      </div>
      {showLabel && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textAlign: 'right'
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
      <style jsx>{`
        @keyframes stripe-move {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 1rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// Circular Progress
export function CircularProgress({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  variant = 'default'
}: {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'default' | 'gradient';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          {variant === 'gradient' && (
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          )}
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variant === 'gradient' ? 'url(#progressGradient)' : 'var(--accent)'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: `${size / 4}px`,
            fontWeight: 700,
            color: 'var(--fg)'
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Spinner Loader
export function SpinnerLoader({
  size = 40,
  variant = 'default',
  label
}: {
  size?: number;
  variant?: 'default' | 'gradient' | 'dots';
  label?: string;
}) {
  if (variant === 'dots') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
        {label && (
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>{label}</p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `4px solid ${variant === 'gradient' ? 'transparent' : 'rgba(var(--accent-rgb), 0.2)'}`,
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          background: variant === 'gradient' ? 'var(--gradient-primary)' : 'transparent',
          WebkitMask: variant === 'gradient' ? 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)' : 'none',
          WebkitMaskComposite: variant === 'gradient' ? 'xor' : 'none',
          maskComposite: variant === 'gradient' ? 'exclude' : 'none',
          padding: variant === 'gradient' ? '4px' : '0'
        }}
      />
      {label && <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>{label}</p>}
    </div>
  );
}

// Pulse Loader
export function PulseLoader({ size = 60, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative'
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: color,
            opacity: 0.6,
            animation: `pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1)`,
            animationDelay: `${i * 1}s`
          }}
        />
      ))}
    </div>
  );
}

// Skeleton Loader with shimmer
export function SkeletonLoader({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  count = 1,
  gap = '0.5rem'
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
  gap?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width,
            height,
            borderRadius
          }}
        />
      ))}
    </div>
  );
}

// Step Progress
export function StepProgress({
  steps,
  currentStep,
  variant = 'default'
}: {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'minimal';
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}
            >
              {/* Step Circle */}
              <div
                className={isCurrent ? 'animate-pulse' : ''}
                style={{
                  width: variant === 'minimal' ? '32px' : '48px',
                  height: variant === 'minimal' ? '32px' : '48px',
                  borderRadius: '50%',
                  background: isCompleted || isCurrent ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                  color: isCompleted || isCurrent ? 'white' : 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: variant === 'minimal' ? '0.875rem' : '1rem',
                  marginBottom: '0.5rem',
                  border: isCurrent ? '3px solid var(--accent)' : 'none',
                  transition: 'all var(--transition-base)'
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step Label */}
              {variant !== 'minimal' && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'var(--fg)' : 'var(--muted)',
                    margin: 0,
                    textAlign: 'center'
                  }}
                >
                  {step}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: isCompleted ? 'var(--accent)' : 'var(--bg-secondary)',
                  transition: 'background var(--transition-base)',
                  marginBottom: variant === 'minimal' ? 0 : '2rem'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Loading Bar (top of page)
export function LoadingBar({ isLoading }: { isLoading: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'var(--gradient-primary)',
          animation: 'loading-bar 2s ease-in-out infinite'
        }}
      />
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0;
            marginLeft: 0;
          }
          50% {
            width: 100%;
            marginLeft: 0;
          }
          100% {
            width: 0;
            marginLeft: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default {
  LinearProgress,
  CircularProgress,
  SpinnerLoader,
  PulseLoader,
  SkeletonLoader,
  StepProgress,
  LoadingBar
};
