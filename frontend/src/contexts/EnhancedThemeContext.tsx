'use client';

/**
 * LEGACY COMPATIBILITY FILE
 * This file maintains backward compatibility with the old enhanced theme system.
 * It re-exports the new ModernThemeContext with a compatibility layer.
 *
 * New code should use:
 * - import { useModernTheme } from '@/contexts/ModernThemeContext'
 */

import {
  ModernThemeProvider,
  useModernTheme,
  THEME_VARIANTS,
} from './ModernThemeContext';

// Re-export the provider for compatibility
export { ModernThemeProvider as EnhancedThemeProvider };

// Create compatibility hook for useEnhancedTheme
export function useEnhancedTheme() {
  const modern = useModernTheme();

  return {
    themeMode: modern.variant,
    colorMode: modern.colorMode,
    actualColorMode: modern.actualMode,
    colors: modern.colors,
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '3rem',
      '5xl': '4rem',
      '6xl': '6rem',
    },
    typography: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    accessibility: modern.accessibility,
    setThemeMode: modern.setVariant,
    setColorMode: modern.setColorMode,
    toggleColorMode: modern.toggleMode,
    setAccessibility: modern.setAccessibility,
    getThemeClass: () => `theme-${modern.variant} ${modern.actualMode}`,
    isTransitioning: modern.isTransitioning,
  };
}

// Re-export theme definitions
export { THEME_VARIANTS as THEME_DEFINITIONS };

// Export types for compatibility
export type ThemeMode =
  | 'electric'
  | 'professional'
  | 'modern'
  | 'creator'
  | 'default'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'lavender'
  | 'rose';
export type ColorMode = 'light' | 'dark' | 'auto';
