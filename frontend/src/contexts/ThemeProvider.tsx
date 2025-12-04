'use client';

import { ModernThemeProvider, THEME_VARIANTS } from './ModernThemeContext';

/**
 * Backward compatibility wrapper for ThemeProvider
 * Uses ModernThemeProvider internally
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ModernThemeProvider>{children}</ModernThemeProvider>;
}

// Re-export for compatibility
export { THEME_VARIANTS as COLOR_PALETTES };
export { useTheme } from '@/hooks/useTheme';
