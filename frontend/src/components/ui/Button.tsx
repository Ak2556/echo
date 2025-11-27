'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      
      // Size variants
      {
        'h-10 py-2 px-4 text-sm': size === 'md',
        'h-9 px-3 text-sm': size === 'sm',
        'h-11 px-8 text-base': size === 'lg',
      },
      
      // Variant styles
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
        'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      },
      
      // Full width
      fullWidth && 'w-full',
      
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      onClick?.(e);
    };

    const iconElement = icon && (
      <span className={cn('flex items-center', loading && 'opacity-0')}>
        {icon}
      </span>
    );

    const loadingSpinner = loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <svg
          className="animate-spin h-4 w-4"
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
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {children}
        </span>
        {iconPosition === 'right' && iconElement}
        {loadingSpinner}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;