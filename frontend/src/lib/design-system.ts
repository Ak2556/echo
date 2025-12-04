/**
 * Design system constants
 */

export const spacing: Record<string, string> = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
};

export const borderRadius: Record<string, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const duration = {
  instant: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
};

export const easing = {
  // Premium easing curves inspired by Apple, Nothing, and Linear
  apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
  nothing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  linear: 'cubic-bezier(0.16, 1, 0.3, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Legacy easing for backwards compatibility
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

export const interaction = {
  hoverScale: 1.02,
  hoverY: -2,
  tapScale: 0.98,
  springConfig: { tension: 300, friction: 30 },
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export const touchTarget = {
  min: '44px',
  recommended: '48px',
  comfortable: '56px',
};
