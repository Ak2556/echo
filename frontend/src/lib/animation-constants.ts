/**
 * Premium Animation Constants
 *
 * Inspired by Apple, Nothing, Linear, and Notion design standards.
 * These constants ensure consistent, high-quality animations throughout the app.
 */

export const ANIMATION = {
  /**
   * Animation durations in milliseconds
   * Keep animations snappy and responsive (140-260ms range)
   */
  duration: {
    instant: 100,   // 0.1s - Immediate feedback
    fast: 150,      // 0.15s - Quick interactions
    normal: 200,    // 0.2s - Standard transitions
    slow: 300,      // 0.3s - Deliberate animations
    slower: 400,    // 0.4s - Emphasized movements
  },

  /**
   * Premium easing curves
   * Apple-style: cubic-bezier(0.22, 1, 0.36, 1) - Smooth, organic feel
   */
  easing: {
    // Apple's signature ease - smooth and natural
    apple: 'cubic-bezier(0.22, 1, 0.36, 1)',

    // Nothing's minimal ease - subtle and refined
    nothing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // Linear's snappy ease - precise and responsive
    linear: 'cubic-bezier(0.16, 1, 0.3, 1)',

    // Standard ease for general use
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Spring physics for natural motion
    spring: { tension: 300, friction: 30 },
  },

  /**
   * Hover interaction presets
   * Subtle lift and scale for premium feel
   */
  hover: {
    scale: 1.02,      // 2% scale increase
    y: -2,            // 2px lift
    duration: 0.15,   // 150ms
  },

  /**
   * Tap/click feedback
   * Quick scale down for tactile feel
   */
  tap: {
    scale: 0.98,      // 2% scale decrease
    duration: 0.1,    // 100ms
  },

  /**
   * Scroll reveal parameters
   * For fade-in and slide-up animations
   */
  scrollReveal: {
    threshold: 0.1,   // Trigger when 10% visible
    stagger: 0.05,    // 50ms between elements
    distance: 30,     // 30px slide distance
  },

  /**
   * Fade transitions
   */
  fade: {
    duration: 0.2,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  /**
   * Scale transitions
   */
  scale: {
    from: 0.96,       // Starting scale
    to: 1,            // Ending scale
    duration: 0.25,   // 250ms
  },

  /**
   * Modal animations
   */
  modal: {
    backdropFade: 0.2,
    contentScale: { from: 0.96, to: 1 },
    contentY: { from: 20, to: 0 },
    duration: 0.25,
  },

  /**
   * Toast/notification animations
   */
  toast: {
    slideDistance: 24,
    duration: 0.3,
  },

  /**
   * Navigation transitions
   */
  nav: {
    height: { collapsed: 64, expanded: 72 },
    transitionDuration: 0.2,
  },
} as const;

/**
 * Helper type for animation duration keys
 */
export type AnimationDuration = keyof typeof ANIMATION.duration;

/**
 * Helper type for easing keys
 */
export type AnimationEasing = keyof typeof ANIMATION.easing;

/**
 * Utility to convert duration to seconds for GSAP
 */
export const toSeconds = (ms: number): number => ms / 1000;

/**
 * Utility to get duration in seconds
 */
export const getDuration = (key: AnimationDuration): number => {
  return toSeconds(ANIMATION.duration[key]);
};

/**
 * Utility to get easing curve
 */
export const getEasing = (key: AnimationEasing): string | { tension: number; friction: number } => {
  return ANIMATION.easing[key];
};

/**
 * Common animation variants for reuse
 */
export const variants = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
  },
  slideDown: {
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0 },
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.96 },
    to: { opacity: 1, scale: 1 },
  },
  scaleOut: {
    from: { opacity: 1, scale: 1 },
    to: { opacity: 0, scale: 0.96 },
  },
} as const;
