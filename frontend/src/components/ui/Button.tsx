'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  motionProps?: MotionProps;
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
  outline:
    'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
  ghost:
    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent',
  destructive: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
};

const gradientVariants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
  secondary:
    'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
  outline: 'bg-gradient-to-r from-transparent to-transparent border-gradient',
  ghost: 'bg-gradient-to-r from-transparent to-transparent',
  destructive:
    'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
  success:
    'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      gradient = false,
      motionProps,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'border',
      rounded ? 'rounded-full' : 'rounded-lg',
      fullWidth ? 'w-full' : '',
      sizeVariants[size],
      gradient ? gradientVariants[variant] : buttonVariants[variant],
    ]
      .filter(Boolean)
      .join(' ');

    const buttonContent = (
      <>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (motionProps) {
      const { onAnimationStart, onAnimationComplete, ...otherProps } = props as any;
      return (
        <motion.button
          ref={ref}
          className={cn(baseClasses, className)}
          disabled={disabled || loading}
          {...motionProps}
          {...otherProps}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, className)}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// Specialized button variants
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { icon: React.ReactNode; 'aria-label': string }
>(
  (
    { icon, className, size = 'md', 'aria-label': ariaLabel, ...props },
    ref
  ) => {
    // Development warning for missing aria-label
    if (!ariaLabel && process.env.NODE_ENV === 'development') {
    }

    const iconSizes = {
      sm: 'w-10 h-10', // Increased to meet WCAG 44px minimum for mobile
      md: 'w-11 h-11', // 44px
      lg: 'w-12 h-12', // 48px
      xl: 'w-14 h-14', // 56px
    };

    return (
      <Button
        ref={ref}
        className={cn(iconSizes[size], 'p-0', className)}
        size={size}
        rounded
        aria-label={ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { 'aria-label': string }
>(({ className, 'aria-label': ariaLabel, ...props }, ref) => {
  if (!ariaLabel && process.env.NODE_ENV === 'development') {
  }

  return (
    <Button
      ref={ref}
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl',
        'z-50 transition-all duration-300',
        'min-w-[56px] min-h-[56px]', // WCAG touch target for primary actions
        className
      )}
      aria-label={ariaLabel}
      motionProps={{
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      }}
      {...props}
    />
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';
