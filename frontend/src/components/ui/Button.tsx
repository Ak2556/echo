'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

interface RippleEffect {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<HTMLSpanElement>(null);
    const [ripples, setRipples] = useState<RippleEffect[]>([]);

    const baseClasses = cn(
      // Use minimal design system classes
      'btn-minimal',
      'relative overflow-hidden',

      // Size variants
      size === 'sm' && 'btn-sm',
      size === 'md' && 'btn-md',
      size === 'lg' && 'btn-lg',

      // Variant styles
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      variant === 'ghost' && 'btn-ghost',
      variant === 'outline' && 'btn-outline',
      variant === 'error' && 'bg-red-600 hover:bg-red-700 text-white',

      // Full width
      fullWidth && 'w-full',

      className
    );

    // GSAP hover and tap animations
    useGSAP(() => {
      const button = buttonRef.current;
      if (!button || loading || disabled) return;

      const handleMouseEnter = () => {
        gsap.to(button, {
          y: ANIMATION.hover.y,
          scale: ANIMATION.hover.scale,
          duration: ANIMATION.hover.duration,
          ease: ANIMATION.easing.apple,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      const handleMouseDown = () => {
        gsap.to(button, {
          scale: ANIMATION.tap.scale,
          duration: ANIMATION.tap.duration,
          ease: ANIMATION.easing.apple,
        });
      };

      const handleMouseUp = () => {
        gsap.to(button, {
          scale: ANIMATION.hover.scale,
          duration: ANIMATION.tap.duration,
          ease: ANIMATION.easing.apple,
        });
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      button.addEventListener('mousedown', handleMouseDown);
      button.addEventListener('mouseup', handleMouseUp);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
        button.removeEventListener('mousedown', handleMouseDown);
        button.removeEventListener('mouseup', handleMouseUp);
      };
    }, [loading, disabled]);

    // Icon hover animation
    useGSAP(() => {
      const icon = iconRef.current;
      if (!icon || loading || disabled) return;

      const handleIconHover = () => {
        gsap.to(icon, {
          scale: 1.15,
          rotate: 5,
          duration: 0.2,
          ease: ANIMATION.easing.apple,
        });
      };

      const handleIconLeave = () => {
        gsap.to(icon, {
          scale: 1,
          rotate: 0,
          duration: 0.2,
          ease: ANIMATION.easing.apple,
        });
      };

      icon.addEventListener('mouseenter', handleIconHover);
      icon.addEventListener('mouseleave', handleIconLeave);

      return () => {
        icon.removeEventListener('mouseenter', handleIconHover);
        icon.removeEventListener('mouseleave', handleIconLeave);
      };
    }, [loading, disabled]);

    // Ripple effect handler
    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple: RippleEffect = {
        x,
        y,
        size,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 600);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      createRipple(e);
      onClick?.(e);
    };

    const iconElement = icon && (
      <span ref={iconRef} className={cn('flex items-center', loading && 'opacity-0')}>
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
          style={{
            animation: 'spin 0.8s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          }}
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
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </span>
    );

    // Merge refs - support both forwarded ref and internal ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(buttonRef.current);
        } else {
          ref.current = buttonRef.current;
        }
      }
    }, [ref]);

    return (
      <button
        ref={buttonRef}
        className={baseClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              opacity: 0.3,
              animation: 'ripple 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              transform: 'scale(0)',
            }}
          />
        ))}
        <style jsx>{`
          @keyframes ripple {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>

        {(leftIcon || (iconPosition === 'left' && iconElement)) && (
          <span className={cn('flex items-center', loading && 'opacity-0')}>
            {leftIcon || iconElement}
          </span>
        )}
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {children}
        </span>
        {(rightIcon || (iconPosition === 'right' && iconElement)) && (
          <span className={cn('flex items-center', loading && 'opacity-0')}>
            {rightIcon || iconElement}
          </span>
        )}
        {loadingSpinner}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;