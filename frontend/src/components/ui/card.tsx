'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'modern'
    | 'glass'
    | 'gradient'
    | 'elevated'
    | 'bordered';
  hover?: boolean;
  animated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', hover = true, animated = true, ...props },
    ref
  ) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    // Merge refs
    React.useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(cardRef.current);
        } else {
          ref.current = cardRef.current;
        }
      }
    }, [ref]);

    // Scroll reveal animation
    useGSAP(() => {
      if (!cardRef.current || !animated) return;

      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: ANIMATION.scrollReveal.distance,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: ANIMATION.easing.apple,
          scrollTrigger: {
            trigger: cardRef.current as gsap.DOMTarget,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, [animated]);

    return (
      <div
        ref={cardRef}
        className={cn(
          // Use minimal design system class
          'card-minimal overflow-hidden',
          hover && 'card-interactive',
          variant === 'glass' && 'glass-premium',
          variant === 'elevated' && 'card-elevated',
          variant === 'bordered' && 'card-bordered',

          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 p-6 pb-4',
      'border-b border-gray-100 dark:border-gray-800',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-none tracking-tight',
      'text-gray-900 dark:text-white',
      'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-gray-600 dark:text-gray-400 leading-relaxed',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 text-gray-700 dark:text-gray-300', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-3 p-6 pt-4',
      'border-t border-gray-100 dark:border-gray-800',
      'bg-gray-50/50 dark:bg-gray-800/50',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
