'use client';

import React, { useState, useRef, useEffect, ReactNode, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipSize = 'sm' | 'md' | 'lg';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  size?: TooltipSize;
  delay?: number;
  disabled?: boolean;
  className?: string;
  arrowClassName?: string;
}

const Tooltip = memo(function Tooltip({
  content,
  children,
  position = 'top',
  size = 'md',
  delay = 200,
  disabled = false,
  className,
  arrowClassName,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs max-w-xs',
    md: 'px-3 py-1.5 text-sm max-w-sm',
    lg: 'px-4 py-2 text-base max-w-md',
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowStyles = (): React.CSSProperties => {
    const arrowSize = 6;
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor:
            'var(--tooltip-bg, #1f2937) transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor:
            'transparent transparent var(--tooltip-bg, #1f2937) transparent',
        };
      case 'left':
        return {
          ...baseStyles,
          right: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor:
            'transparent transparent transparent var(--tooltip-bg, #1f2937)',
        };
      case 'right':
        return {
          ...baseStyles,
          left: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor:
            'transparent var(--tooltip-bg, #1f2937) transparent transparent',
        };
      default:
        return baseStyles;
    }
  };

  const getInitialOffset = () => {
    switch (position) {
      case 'top':
        return { y: 4 };
      case 'bottom':
        return { y: -4 };
      case 'left':
        return { x: 4 };
      case 'right':
        return { x: -4 };
      default:
        return { y: 4 };
    }
  };

  const tooltipContent = isVisible && typeof window !== 'undefined' && (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.96, ...getInitialOffset() }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, ...getInitialOffset() }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        role="tooltip"
        className={cn(
          'fixed z-[1600] pointer-events-none',
          'bg-gray-800 dark:bg-gray-900 text-white',
          'rounded-lg',
          'whitespace-normal break-words',
          sizeClasses[size],
          className
        )}
        style={
          {
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            '--tooltip-bg': '#1f2937',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.10)',
          } as React.CSSProperties
        }
      >
        {content}
        <div
          className={cn('tooltip-arrow', arrowClassName)}
          style={getArrowStyles()}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
});

export default Tooltip;

// Convenience wrapper for icon buttons with tooltips
export const TooltipIconButton = memo(function TooltipIconButton({
  icon,
  tooltip,
  onClick,
  ariaLabel,
  className,
  disabled = false,
  position = 'top',
}: {
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  position?: TooltipPosition;
}) {
  return (
    <Tooltip content={tooltip} position={position} disabled={disabled}>
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center',
          'w-10 h-10 rounded-lg',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {icon}
      </button>
    </Tooltip>
  );
});
