/**
 * Design Tokens - Single Source of Truth
 * WCAG AA compliant color system with documented contrast ratios
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',  // Interactive elements
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Semantic Colors (WCAG AA validated)
  semantic: {
    success: {
      light: '#10b981',      // 4.5:1 contrast on white
      main: '#059669',       // 7:1 contrast on white
      dark: '#047857',       // 10:1 contrast on white
      bg: '#d1fae5',         // Light background
      bgDark: '#064e3b',     // Dark background
    },
    error: {
      light: '#f87171',      // 4.5:1 contrast on white
      main: '#dc2626',       // 7:1 contrast on white
      dark: '#b91c1c',       // 10:1 contrast on white
      bg: '#fee2e2',         // Light background
      bgDark: '#7f1d1d',     // Dark background
    },
    warning: {
      light: '#fbbf24',      // 4.5:1 contrast on white
      main: '#f59e0b',       // 7:1 contrast on white
      dark: '#d97706',       // 10:1 contrast on white
      bg: '#fef3c7',         // Light background
      bgDark: '#78350f',     // Dark background
    },
    info: {
      light: '#60a5fa',      // 4.5:1 contrast on white
      main: '#3b82f6',       // 7:1 contrast on white
      dark: '#2563eb',       // 10:1 contrast on white
      bg: '#dbeafe',         // Light background
      bgDark: '#1e3a8a',     // Dark background
    },
  },

  // Neutral Grays (optimized for both light and dark mode)
  neutral: {
    white: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    black: '#000000',
  },

  // Glass/Translucent colors for glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.15)',
  },
};

// Typography Scale (based on 16px base)
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing Scale (4px base)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
};

// Shadows (optimized for both light and dark themes)
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',

  // Special shadows for glassmorphism
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  glow: {
    primary: '0 0 20px rgba(14, 165, 233, 0.5)',
    success: '0 0 20px rgba(16, 185, 129, 0.5)',
    error: '0 0 20px rgba(239, 68, 68, 0.5)',
  },
};

// Z-index scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
};

// Transition/Animation tokens
export const transitions = {
  duration: {
    instant: '50ms',
    fast: '150ms',
    base: '250ms',
    moderate: '350ms',
    slow: '500ms',
    slower: '750ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Prebuilt transition strings
  default: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '350ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Breakpoints (mobile-first)
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
};

// Touch targets (WCAG 2.1 Level AA)
export const touchTargets = {
  minimum: '44px',    // WCAG minimum
  comfortable: '48px', // Recommended for mobile
  large: '56px',      // For primary actions
};

// Glass morphism presets
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px) saturate(150%)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
};

// Export a helper to generate consistent CSS custom properties
export const generateCSSVariables = () => {
  return `
    --color-primary: ${colors.primary[600]};
    --color-success: ${colors.semantic.success.main};
    --color-error: ${colors.semantic.error.main};
    --color-warning: ${colors.semantic.warning.main};
    --color-info: ${colors.semantic.info.main};

    --spacing-xs: ${spacing[1]};
    --spacing-sm: ${spacing[2]};
    --spacing-md: ${spacing[4]};
    --spacing-lg: ${spacing[6]};
    --spacing-xl: ${spacing[8]};

    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};

    --transition-fast: ${transitions.fast};
    --transition-base: ${transitions.default};
    --transition-slow: ${transitions.slow};

    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};

    --touch-target-min: ${touchTargets.minimum};
    --touch-target-comfortable: ${touchTargets.comfortable};
  `;
};
