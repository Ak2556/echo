'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's motion preference (prefers-reduced-motion)
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange as any);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange as any);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that returns animation-safe variants for Framer Motion
 * Automatically respects user's motion preference
 */
export function useMotionVariants() {
  const prefersReducedMotion = useReducedMotion();

  return {
    // Fade animation
    fade: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        },

    // Slide up animation
    slideUp: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        },

    // Scale animation
    scale: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        }
      : {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        },

    // Slide in from right
    slideInRight: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        }
      : {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 100 },
        },

    // Get transition duration (instant if reduced motion preferred)
    duration: prefersReducedMotion ? 0.001 : 0.25,
  };
}

/**
 * Returns appropriate animation props for Framer Motion
 * @param animate - Whether to animate at all
 * @returns Animation config that respects motion preferences
 */
export function useAnimationConfig(animate: boolean = true) {
  const prefersReducedMotion = useReducedMotion();

  if (!animate || prefersReducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 },
    };
  }

  return {
    initial: true,
    animate: true,
    exit: true,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
    },
  };
}

/**
 * Helper to get CSS transition value respecting motion preference
 */
export function useTransition(
  property: string = 'all',
  duration: number = 250,
  easing: string = 'cubic-bezier(0.4, 0, 0.2, 1)'
): string {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return `${property} 0.001ms ${easing}`;
  }

  return `${property} ${duration}ms ${easing}`;
}
