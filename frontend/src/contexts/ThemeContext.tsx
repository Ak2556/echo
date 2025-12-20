'use client';

/**
 * LEGACY COMPATIBILITY FILE
 * This file maintains backward compatibility with the old theme system.
 * It re-exports the new ModernThemeContext with a compatibility layer.
 *
 * New code should use:
 * - import { useModernTheme } from '@/contexts/ModernThemeContext'
 */

import { ModernThemeProvider, THEME_VARIANTS } from './ModernThemeContext';

// Re-export the provider for compatibility
export { ModernThemeProvider as ThemeProvider };

// Re-export theme variants as COLOR_PALETTES for compatibility
export { THEME_VARIANTS as COLOR_PALETTES };

// Re-export the compatibility hook
export { useTheme } from '@/hooks/useTheme';

// Export types for compatibility
export type ColorMode = 'light' | 'dark' | 'auto';
export type Theme = 'nothing' | 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'rose';
