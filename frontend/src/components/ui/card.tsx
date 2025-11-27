'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  motionProps?: MotionProps;
}

const cardVariants = {
  default:
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg border-0',
  outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
  filled: 'bg-gray-50 dark:bg-gray-900 border-0',
  glass:
    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20',
};

const sizeVariants = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const roundedVariants = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const shadowVariants = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = 'lg',
      shadow = 'none',
      hover = false,
      interactive = false,
      motionProps,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'transition-all duration-200',
      cardVariants[variant],
      sizeVariants[size],
      roundedVariants[rounded],
      shadowVariants[shadow],
      hover && 'hover:shadow-lg hover:-translate-y-1',
      interactive &&
        'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    ]
      .filter(Boolean)
      .join(' ');

    if (motionProps) {
      const { onAnimationStart, onAnimationComplete, ...otherProps } = props as any;
      return (
        <motion.div
          ref={ref as any}
          className={cn(baseClasses, className)}
          {...motionProps}
          {...otherProps}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cn(baseClasses, className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };

// Card Header Component
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title Component
export const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description Component
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content Component
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer Component
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export default Card;

// Specialized Card Components
export const StatsCard = forwardRef<
  HTMLDivElement,
  {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    className?: string;
  }
>(({ title, value, change, changeType = 'neutral', icon, className }, ref) => {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card
      ref={ref}
      variant="elevated"
      hover
      className={cn('relative overflow-hidden', className)}
      motionProps={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <p className={cn('text-xs', changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
StatsCard.displayName = 'StatsCard';

export const FeatureCard = forwardRef<
  HTMLDivElement,
  {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
  }
>(({ title, description, icon, action, className }, ref) => {
  return (
    <Card
      ref={ref}
      variant="glass"
      hover
      interactive
      className={cn('group', className)}
      motionProps={{
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
      }}
    >
      <CardHeader>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
        <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
});
FeatureCard.displayName = 'FeatureCard';
