'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { colors, accessibility } = useEnhancedTheme();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      
      // Create ripple effect
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      onClick?.(e);
    };

    const baseClasses = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth && 'w-full',
      loading && 'loading',
      className,
    ].filter(Boolean).join(' ');

    const iconElement = icon && (
      <span className={`btn-icon ${loading ? 'opacity-0' : ''}`}>
        {icon}
      </span>
    );

    const loadingSpinner = loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    );

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        {...props}
      >
        {iconPosition === 'left' && iconElement}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
        {iconPosition === 'right' && iconElement}
        {loadingSpinner}
        
        <style jsx>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
          }
          
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          .btn {
            position: relative;
            overflow: hidden;
          }
          
          .btn.loading {
            pointer-events: none;
          }
        `}</style>
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;