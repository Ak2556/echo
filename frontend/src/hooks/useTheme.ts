'use client';

import { useModernTheme } from '@/contexts/ModernThemeContext';

/**
 * Compatibility hook for old useTheme API
 * Maps to the new ModernThemeContext
 */
export function useTheme() {
  const modern = useModernTheme();

  return {
    // Map color mode
    colorMode: modern.colorMode,
    actualColorMode: modern.actualMode,

    // Map toggle function
    toggleColorMode: modern.toggleMode,

    // Map theme (use variant as theme)
    theme: modern.variant,
    setTheme: modern.setVariant,

    // Color palette (map to variant)
    colorPalette: modern.variant,
    setColorPalette: modern.setVariant,

    // Accent color (use primary from colors)
    accentColor: modern.colors.primary,
    setAccentColor: () => {
      // No-op for compatibility, colors are theme-based now
      console.warn('setAccentColor is deprecated. Use setVariant instead.');
    },

    // Accessibility
    accessibilityPrefs: modern.accessibility,
    setAccessibilityPrefs: modern.setAccessibility,

    // Theme schedule (deprecated, return dummy)
    themeSchedule: { type: 'off' as const },
    setThemeSchedule: () => {
      console.warn('Theme schedule is deprecated in the new theme system.');
    },

    // Transition state
    isTransitioning: modern.isTransitioning,

    // Set color mode
    setColorMode: modern.setColorMode,

    // Preview (deprecated)
    previewTheme: () => {
      console.warn('previewTheme is deprecated.');
    },

    // Get colors (return current theme colors)
    getColors: () => ({
      primary: modern.colors.primary,
      secondary: modern.colors.secondary,
      accent: modern.colors.accent,
    }),

    // Get system preference
    getSystemPreference: () => modern.actualMode,

    // Get sunrise/sunset (deprecated)
    getSunriseSunset: async () => ({
      sunrise: '06:00',
      sunset: '18:00',
    }),
  };
}
