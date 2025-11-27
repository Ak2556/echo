/**
 * Glassmorphism utility classes and helpers
 * Creates frosted glass effects with backdrop blur
 */

export const glassmorphismClasses = {
  // Light variants (for dark backgrounds)
  light: 'bg-white/10 backdrop-blur-xl border border-white/15 shadow-glass',
  lightHover: 'hover:bg-white/15 hover:border-white/20',

  // Medium variants (balanced)
  medium: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-glass',
  mediumHover: 'hover:bg-white/10 hover:border-white/15',

  // Dark variants (for light backgrounds)
  dark: 'bg-black/20 backdrop-blur-xl border border-black/10 shadow-glass',
  darkHover: 'hover:bg-black/25 hover:border-black/15',

  // Navigation specific
  nav: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/10 dark:border-gray-800/50',

  // Modal/Dialog specific
  modal: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50',

  // Card specific
  card: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50',

  // Floating elements (tooltips, dropdowns)
  floating: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-2xl',
};

/**
 * Get inline styles for glassmorphism effect
 * @param variant - The glass variant to use
 * @param customBlur - Custom blur amount (px)
 * @returns CSS properties object
 */
export function getGlassStyles(
  variant: 'light' | 'medium' | 'dark' | 'nav' | 'modal' | 'card' | 'floating' = 'medium',
  customBlur?: number
): React.CSSProperties {
  const blurAmount = customBlur || 16;

  const baseStyles: React.CSSProperties = {
    backdropFilter: `blur(${blurAmount}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blurAmount}px) saturate(180%)`,
  };

  const variantStyles = {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    },
    nav: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
    },
    modal: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    floating: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
  };
}

/**
 * Utility to merge glass classes with other classes
 */
export function glassClass(
  variant: keyof typeof glassmorphismClasses = 'medium',
  additionalClasses: string = ''
): string {
  return `${glassmorphismClasses[variant]} ${additionalClasses}`.trim();
}
