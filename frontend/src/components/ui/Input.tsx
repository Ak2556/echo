'use client';

import React, {
  forwardRef,
  InputHTMLAttributes,
  useRef,
  useEffect,
} from 'react';
import { cn } from '@/lib/utils';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  variant?: 'default' | 'modern' | 'glass';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      variant = 'modern',
      icon,
      iconPosition = 'left',
      showPasswordToggle,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;

    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const successRef = useRef<HTMLParagraphElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    // Shake animation on error
    useGSAP(() => {
      if (error && inputWrapperRef.current) {
        gsap.fromTo(
          inputWrapperRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.1,
            ease: 'power2.inOut',
            repeat: 3,
            yoyo: true,
            onComplete: () => {
              gsap.set(inputWrapperRef.current, { x: 0 });
            },
          }
        );
      }
    }, [error]);

    // Error message fade-in animation
    useGSAP(() => {
      if (error && errorRef.current) {
        gsap.fromTo(
          errorRef.current,
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: ANIMATION.easing.apple,
          }
        );
      }
    }, [error]);

    // Success message animation
    useGSAP(() => {
      if (success && successRef.current) {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, scale: 0.9, y: -10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: ANIMATION.easing.apple,
          }
        );
      }
    }, [success]);

    // Icon animation on focus
    useGSAP(() => {
      const input = inputRef.current;
      const iconEl = iconRef.current;
      if (!input || !iconEl) return;

      const handleFocus = () => {
        gsap.to(iconEl, {
          scale: 1.1,
          color: 'rgb(99, 102, 241)',
          duration: 0.2,
          ease: ANIMATION.easing.apple,
        });
      };

      const handleBlur = () => {
        gsap.to(iconEl, {
          scale: 1,
          color: 'rgb(156, 163, 175)',
          duration: 0.2,
          ease: ANIMATION.easing.apple,
        });
      };

      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }, []);

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors"
          >
            {label}
          </label>
        )}
        <div ref={inputWrapperRef} className="relative w-full">
          {icon && iconPosition === 'left' && (
            <div
              ref={iconRef}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            >
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            className={cn(
              // Use minimal design system class
              'input-minimal',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',

              // Error state
              error && 'input-error',

              // Success state
              success &&
                '!border-green-500 dark:!border-green-400 focus:!border-green-500 focus:!shadow-[0_0_0_3px_rgba(34,197,94,0.1)]',

              // Icon padding
              icon && iconPosition === 'left' ? 'input-with-icon-left' : '',
              (icon && iconPosition === 'right') ||
                (isPasswordType && showPasswordToggle)
                ? 'input-with-icon-right'
                : '',

              className
            )}
            ref={inputRef}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : success
                  ? `${inputId}-success`
                  : helperText
                    ? `${inputId}-helper`
                    : undefined
            }
            {...props}
          />
          {icon && iconPosition === 'right' && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}
          {isPasswordType && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            ref={errorRef}
            id={`${inputId}-error`}
            className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {success && !error && (
          <p
            ref={successRef}
            id={`${inputId}-success`}
            className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
