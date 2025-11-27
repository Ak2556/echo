'use client';

import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'floating' | 'outlined';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const { colors, accessibility } = useEnhancedTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const containerClasses = [
      'input-container',
      variant,
      fullWidth && 'w-full',
      error && 'error',
      isFocused && 'focused',
      hasValue && 'has-value',
      className,
    ].filter(Boolean).join(' ');

    const inputClasses = [
      'form-input',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {variant === 'floating' ? (
          <div className="floating-input-wrapper">
            <input
              ref={ref}
              id={inputId}
              className={inputClasses}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder=" "
              {...props}
            />
            {label && (
              <label htmlFor={inputId} className="floating-label">
                {label}
              </label>
            )}
          </div>
        ) : (
          <>
            {label && (
              <label htmlFor={inputId} className="form-label">
                {label}
              </label>
            )}
            <div className="input-wrapper">
              {leftIcon && (
                <div className="input-icon left">
                  {leftIcon}
                </div>
              )}
              <input
                ref={ref}
                id={inputId}
                className={inputClasses}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                {...props}
              />
              {rightIcon && (
                <div className="input-icon right">
                  {rightIcon}
                </div>
              )}
            </div>
          </>
        )}
        
        {error && (
          <div className="input-error" role="alert">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div className="input-helper">
            {helperText}
          </div>
        )}

        <style jsx>{`
          .input-container {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
          }
          
          .form-label {
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            color: var(--color-textPrimary);
            transition: color var(--duration-normal) var(--ease-out);
          }
          
          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .form-input {
            width: 100%;
            padding: var(--spacing-md) var(--spacing-lg);
            border: 2px solid var(--color-border);
            border-radius: var(--radius-lg);
            background: var(--color-surface);
            color: var(--color-textPrimary);
            font-size: var(--text-base);
            transition: all var(--duration-normal) var(--ease-out);
            min-height: 44px;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-focus);
            background: var(--color-surfaceElevated);
          }
          
          .form-input::placeholder {
            color: var(--color-textMuted);
            transition: color var(--duration-normal) var(--ease-out);
          }
          
          .form-input:focus::placeholder {
            color: transparent;
          }
          
          .input-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-textMuted);
            transition: color var(--duration-normal) var(--ease-out);
            pointer-events: none;
            z-index: 1;
          }
          
          .input-icon.left {
            left: var(--spacing-md);
          }
          
          .input-icon.right {
            right: var(--spacing-md);
          }
          
          .focused .input-icon {
            color: var(--color-primary);
          }
          
          /* Floating Label Variant */
          .floating-input-wrapper {
            position: relative;
          }
          
          .floating .form-input {
            padding-top: calc(var(--spacing-lg) + var(--spacing-sm));
          }
          
          .floating-label {
            position: absolute;
            top: var(--spacing-lg);
            left: var(--spacing-lg);
            font-size: var(--text-base);
            color: var(--color-textMuted);
            transition: all var(--duration-normal) var(--ease-out);
            pointer-events: none;
            background: var(--color-surface);
            padding: 0 var(--spacing-xs);
            border-radius: var(--radius-sm);
          }
          
          .floating.focused .floating-label,
          .floating.has-value .floating-label {
            top: calc(-1 * var(--spacing-sm));
            font-size: var(--text-xs);
            color: var(--color-primary);
            font-weight: var(--font-medium);
          }
          
          /* Outlined Variant */
          .outlined .form-input {
            background: transparent;
            border: 2px solid var(--color-border);
          }
          
          .outlined.focused .form-input {
            background: var(--color-surface);
          }
          
          /* Error State */
          .error .form-input {
            border-color: var(--color-error);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          
          .error .form-label,
          .error .floating-label {
            color: var(--color-error);
          }
          
          .error .input-icon {
            color: var(--color-error);
          }
          
          .input-error {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--text-sm);
            color: var(--color-error);
            font-weight: var(--font-medium);
          }
          
          .input-helper {
            font-size: var(--text-sm);
            color: var(--color-textMuted);
          }
          
          /* Accessibility */
          @media (prefers-contrast: high) {
            .form-input {
              border-width: 3px;
            }
            
            .form-input:focus {
              box-shadow: 0 0 0 4px var(--color-focus);
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .form-input,
            .form-label,
            .floating-label,
            .input-icon {
              transition: none;
            }
          }
          
          /* Performance optimization */
          .form-input {
            will-change: border-color, box-shadow;
          }
          
          .floating-label {
            will-change: transform, font-size, color;
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;