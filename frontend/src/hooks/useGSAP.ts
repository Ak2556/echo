/**
 * GSAP Utilities and Hooks
 *
 * This module provides GSAP integration for React components with
 * premium animation presets following Apple, Nothing, and Linear standards.
 */

'use client';

import { useGSAP as useGSAPCore } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION, toSeconds } from '@/lib/animation-constants';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Export GSAP core for direct use
export { useGSAPCore as useGSAP, gsap };

/**
 * Premium animation presets
 * Consistent animations across the entire application
 */
export const animations = {
  /**
   * Fade in animation with optional slide from bottom
   * @param element - Target element(s)
   * @param options - Additional GSAP options to override defaults
   */
  fadeIn: (element: gsap.TweenTarget, options = {}) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(ANIMATION.duration.normal),
        ease: ANIMATION.easing.apple,
        ...options,
      }
    );
  },

  /**
   * Fade out animation
   * @param element - Target element(s)
   * @param options - Additional GSAP options
   */
  fadeOut: (element: gsap.TweenTarget, options = {}) => {
    return gsap.to(element, {
      opacity: 0,
      duration: toSeconds(ANIMATION.duration.fast),
      ease: ANIMATION.easing.apple,
      ...options,
    });
  },

  /**
   * Hover lift animation - Apple-style hover effect
   * @param element - Target element
   */
  hoverLift: (element: gsap.TweenTarget) => {
    return gsap.to(element, {
      y: ANIMATION.hover.y,
      scale: ANIMATION.hover.scale,
      duration: ANIMATION.hover.duration,
      ease: ANIMATION.easing.apple,
    });
  },

  /**
   * Reset hover animation
   * @param element - Target element
   */
  hoverReset: (element: gsap.TweenTarget) => {
    return gsap.to(element, {
      y: 0,
      scale: 1,
      duration: toSeconds(ANIMATION.duration.normal),
      ease: 'power2.out',
    });
  },

  /**
   * Tap feedback animation - scale down briefly
   * @param element - Target element
   */
  tap: (element: gsap.TweenTarget) => {
    return gsap.to(element, {
      scale: ANIMATION.tap.scale,
      duration: ANIMATION.tap.duration,
      ease: ANIMATION.easing.apple,
      yoyo: true,
      repeat: 1,
    });
  },

  /**
   * Shake animation for errors or invalid input
   * @param element - Target element
   */
  shake: (element: gsap.TweenTarget) => {
    return gsap.fromTo(
      element,
      { x: -10 },
      {
        x: 10,
        duration: 0.1,
        ease: 'power2.inOut',
        repeat: 3,
        yoyo: true,
        onComplete: () => {
          gsap.set(element, { x: 0 });
        },
      }
    );
  },

  /**
   * Scale in animation - for modals, tooltips, etc.
   * @param element - Target element
   * @param options - Additional options
   */
  scaleIn: (element: gsap.TweenTarget, options = {}) => {
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: ANIMATION.scale.from,
        y: 20,
      },
      {
        opacity: 1,
        scale: ANIMATION.scale.to,
        y: 0,
        duration: ANIMATION.scale.duration,
        ease: ANIMATION.easing.apple,
        ...options,
      }
    );
  },

  /**
   * Scale out animation
   * @param element - Target element
   * @param options - Additional options
   */
  scaleOut: (element: gsap.TweenTarget, options = {}) => {
    return gsap.to(element, {
      opacity: 0,
      scale: ANIMATION.scale.from,
      y: 20,
      duration: toSeconds(ANIMATION.duration.fast),
      ease: ANIMATION.easing.apple,
      ...options,
    });
  },

  /**
   * Scroll reveal animation with stagger
   * @param elements - Target elements (array or selector)
   * @param options - ScrollTrigger and animation options
   */
  scrollReveal: (
    elements: gsap.TweenTarget,
    options: {
      trigger?: gsap.DOMTarget;
      start?: string;
      stagger?: number;
      distance?: number;
      once?: boolean;
    } = {}
  ) => {
    const {
      trigger = elements,
      start = 'top 90%',
      stagger = ANIMATION.scrollReveal.stagger,
      distance = ANIMATION.scrollReveal.distance,
      once = true,
    } = options;

    return gsap.fromTo(
      elements,
      { opacity: 0, y: distance },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(ANIMATION.duration.slow),
        stagger,
        ease: ANIMATION.easing.apple,
        scrollTrigger: {
          trigger: trigger as gsap.DOMTarget,
          start,
          once,
        },
      }
    );
  },

  /**
   * Slide up animation
   * @param element - Target element
   * @param options - Additional options
   */
  slideUp: (element: gsap.TweenTarget, options = {}) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(ANIMATION.duration.slow),
        ease: ANIMATION.easing.apple,
        ...options,
      }
    );
  },

  /**
   * Slide down animation
   * @param element - Target element
   * @param options - Additional options
   */
  slideDown: (element: gsap.TweenTarget, options = {}) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: -30 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(ANIMATION.duration.slow),
        ease: ANIMATION.easing.apple,
        ...options,
      }
    );
  },

  /**
   * Parallax scroll effect
   * @param element - Target element
   * @param distance - Distance to move (default: -50px)
   * @param trigger - Trigger element (default: same as target)
   */
  parallax: (element: gsap.TweenTarget, distance = -50, trigger?: gsap.DOMTarget) => {
    return gsap.to(element, {
      y: distance,
      ease: 'none',
      scrollTrigger: {
        trigger: (trigger || element) as gsap.DOMTarget,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  },

  /**
   * Entrance animation for cards/sections
   * @param element - Target element
   * @param options - Additional options
   */
  entrance: (element: gsap.TweenTarget, options = {}) => {
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 40,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: toSeconds(ANIMATION.duration.slower),
        ease: ANIMATION.easing.apple,
        ...options,
      }
    );
  },

  /**
   * Pulse animation for attention
   * @param element - Target element
   * @param scale - Scale amount (default: 1.05)
   */
  pulse: (element: gsap.TweenTarget, scale = 1.05) => {
    return gsap.to(element, {
      scale,
      duration: 0.5,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
    });
  },

  /**
   * Loading shimmer effect
   * @param element - Target element
   */
  shimmer: (element: gsap.TweenTarget) => {
    return gsap.fromTo(
      element,
      { backgroundPosition: '-200% 0' },
      {
        backgroundPosition: '200% 0',
        duration: 1.5,
        ease: 'none',
        repeat: -1,
      }
    );
  },
};

/**
 * Utility to kill all animations on an element
 * @param element - Target element
 */
export const killAnimations = (element: gsap.TweenTarget) => {
  gsap.killTweensOf(element);
};

/**
 * Utility to set reduced motion preferences
 * Disables or simplifies animations if user prefers reduced motion
 */
export const respectReducedMotion = () => {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    gsap.config({
      nullTargetWarn: false,
    });

    // Override animation durations to be instant
    gsap.defaults({
      duration: 0.01,
    });
  }
};

// Initialize reduced motion check
if (typeof window !== 'undefined') {
  respectReducedMotion();

  // Listen for changes in motion preference
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', respectReducedMotion);
}

/**
 * Context object for ScrollTrigger
 */
export const scrollTriggerContext = {
  refresh: () => ScrollTrigger.refresh(),
  kill: () => ScrollTrigger.getAll().forEach((st) => st.kill()),
  enable: () => ScrollTrigger.enable(),
  disable: () => ScrollTrigger.disable(),
};

/**
 * Export ScrollTrigger for advanced use cases
 */
export { ScrollTrigger };
