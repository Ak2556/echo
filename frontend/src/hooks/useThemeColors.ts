'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

export interface ThemeColors {
  // Background colors
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  card: string;
  cardHover: string;

  // Text colors
  text: string & { white: string };
  textSecondary: string;
  textMuted: string;

  // Border colors
  border: string;
  borderHover: string;

  // Accent colors
  accent: string;
  accentHover: string;
  accentLight: string;
  accentRgb: string;

  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    tertiary: string;
  };

  // Status colors
  status: {
    success: string;
    warning: string;
    danger: string;
    error: string;
    info: string;
  };
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Chart colors
  chart: string[];

  // Gradients
  gradient: {
    primary: string;
    secondary: string;
  };
  gradientPrimary: string;
  gradientSecondary: string;

  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;

  // Mode helpers
  isDark: boolean;
  isLight: boolean;
}

export function useThemeColors(): ThemeColors {
  const { colorMode } = useTheme();

  const colors = useMemo(() => {
    const isDark = colorMode === 'dark';

    if (isDark) {
      return {
        // Background colors
        bg: '#0f0a1f',
        bgSecondary: '#1a0b2e',
        bgTertiary: '#16213e',
        card: 'rgba(30, 20, 50, 0.98)',
        cardHover: 'rgba(40, 30, 70, 1)',

        // Text colors
        text: Object.assign('#f8fafc', { white: '#ffffff' }),
        textSecondary: '#cbd5e1',
        textMuted: '#a78bfa',

        // Border colors
        border: 'rgba(167, 139, 250, 0.2)',
        borderHover: 'rgba(167, 139, 250, 0.4)',

        // Accent colors
        accent: '#a78bfa',
        accentHover: '#c4b5fd',
        accentLight: '#ddd6fe',
        accentRgb: '167, 139, 250',

        // Brand colors
        brand: {
          primary: '#a78bfa',
          secondary: '#c4b5fd',
          tertiary: '#ddd6fe',
        },

        // Status colors
        status: {
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
          error: '#f87171',
          info: '#60a5fa',
        },
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',

        // Chart colors
        chart: [
          '#a78bfa',
          '#34d399',
          '#fbbf24',
          '#60a5fa',
          '#f87171',
          '#ec4899',
          '#8b5cf6',
          '#10b981',
        ],

        // Gradients
        gradient: {
          primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

        // Shadows
        shadowSm: '0 2px 8px rgba(167, 139, 250, 0.15)',
        shadowMd: '0 4px 16px rgba(167, 139, 250, 0.2)',
        shadowLg: '0 12px 32px rgba(167, 139, 250, 0.25)',

        // Mode helpers
        isDark: true,
        isLight: false,
      };
    } else {
      return {
        // Background colors
        bg: '#fdf2f8',
        bgSecondary: '#faf5ff',
        bgTertiary: '#f5f3ff',
        card: 'rgba(255, 255, 255, 0.98)',
        cardHover: 'rgba(255, 255, 255, 1)',

        // Text colors
        text: Object.assign('#1e1b4b', { white: '#ffffff' }),
        textSecondary: '#4c1d95',
        textMuted: '#6366f1',

        // Border colors
        border: 'rgba(139, 92, 246, 0.15)',
        borderHover: 'rgba(139, 92, 246, 0.3)',

        // Accent colors
        accent: '#8b5cf6',
        accentHover: '#7c3aed',
        accentLight: '#c4b5fd',
        accentRgb: '139, 92, 246',

        // Brand colors
        brand: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          tertiary: '#c4b5fd',
        },

        // Status colors
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          error: '#ef4444',
          info: '#3b82f6',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',

        // Chart colors
        chart: [
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#3b82f6',
          '#ef4444',
          '#ec4899',
          '#6366f1',
          '#059669',
        ],

        // Gradients
        gradient: {
          primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

        // Shadows
        shadowSm: '0 2px 8px rgba(139, 92, 246, 0.12)',
        shadowMd: '0 4px 16px rgba(139, 92, 246, 0.16)',
        shadowLg: '0 12px 32px rgba(139, 92, 246, 0.2)',

        // Mode helpers
        isDark: false,
        isLight: true,
      };
    }
  }, [colorMode]);

  return colors;
}

// CSS variable helper for inline styles
export function getCssVar(name: string): string {
  return `var(--${name})`;
}

// Generate themed styles object
export function getThemedStyles(isDark: boolean) {
  return {
    container: {
      background: isDark
        ? 'linear-gradient(135deg, #0f0a1f 0%, #1a0b2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #f5f3ff 100%)',
      color: isDark ? '#f8fafc' : '#1e1b4b',
    },
    card: {
      background: isDark
        ? 'rgba(30, 20, 50, 0.98)'
        : 'rgba(255, 255, 255, 0.98)',
      border: isDark
        ? '1px solid rgba(167, 139, 250, 0.2)'
        : '1px solid rgba(139, 92, 246, 0.15)',
      boxShadow: isDark
        ? '0 4px 16px rgba(167, 139, 250, 0.2)'
        : '0 4px 16px rgba(139, 92, 246, 0.16)',
    },
    button: {
      primary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      },
      secondary: {
        background: isDark
          ? 'rgba(167, 139, 250, 0.15)'
          : 'rgba(139, 92, 246, 0.1)',
        color: isDark ? '#a78bfa' : '#8b5cf6',
        border: isDark
          ? '1px solid rgba(167, 139, 250, 0.3)'
          : '1px solid rgba(139, 92, 246, 0.2)',
      },
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
      },
      danger: {
        background: isDark
          ? 'rgba(248, 113, 113, 0.15)'
          : 'rgba(239, 68, 68, 0.1)',
        color: isDark ? '#f87171' : '#ef4444',
        border: isDark
          ? '1px solid rgba(248, 113, 113, 0.3)'
          : '1px solid rgba(239, 68, 68, 0.2)',
      },
    },
    input: {
      background: isDark ? 'rgba(30, 20, 50, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      border: isDark
        ? '1px solid rgba(167, 139, 250, 0.3)'
        : '1px solid rgba(139, 92, 246, 0.2)',
      color: isDark ? '#f8fafc' : '#1e1b4b',
      placeholder: isDark ? '#94a3b8' : '#6366f1',
    },
    text: {
      primary: isDark ? '#f8fafc' : '#1e1b4b',
      secondary: isDark ? '#cbd5e1' : '#4c1d95',
      muted: isDark ? '#94a3b8' : '#6366f1',
    },
  };
}

export default useThemeColors;
