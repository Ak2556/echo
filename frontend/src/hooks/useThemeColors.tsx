'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

/**
 * Comprehensive theme color system for consistent styling across all components
 * Automatically adapts to light/dark mode
 */
export function useThemeColors() {
  const { actualColorMode } = useTheme();
  const isDark = actualColorMode === 'dark';

  const colors = useMemo(() => ({
    // Base backgrounds
    bg: {
      primary: isDark ? '#0f172a' : '#ffffff',
      secondary: isDark ? '#1e293b' : '#f8fafc',
      tertiary: isDark ? '#334155' : '#f1f5f9',
      elevated: isDark ? '#1e293b' : '#ffffff',
      inverse: isDark ? '#ffffff' : '#0f172a',
    },

    // Text colors with proper contrast
    text: {
      primary: isDark ? '#f8fafc' : '#0f172a',
      secondary: isDark ? '#e2e8f0' : '#334155',
      tertiary: isDark ? '#cbd5e1' : '#64748b',
      muted: isDark ? '#94a3b8' : '#94a3b8',
      inverse: isDark ? '#0f172a' : '#f8fafc',
      white: '#ffffff',
      black: '#000000',
    },

    // Borders and dividers
    border: {
      primary: isDark ? '#334155' : '#e2e8f0',
      secondary: isDark ? '#475569' : '#cbd5e1',
      strong: isDark ? '#64748b' : '#94a3b8',
      focus: isDark ? '#60a5fa' : '#3b82f6',
      subtle: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },

    // Interactive states
    interactive: {
      hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      active: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      focus: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      disabled: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },

    // Brand colors (consistent across themes)
    brand: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#3b82f6',
    },

    // Status colors (adjusted for theme)
    status: {
      success: isDark ? '#34d399' : '#10b981',
      warning: isDark ? '#fbbf24' : '#f59e0b',
      error: isDark ? '#f87171' : '#ef4444',
      info: isDark ? '#60a5fa' : '#3b82f6',
    },

    // Status backgrounds (subtle)
    statusBg: {
      success: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      warning: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      error: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      info: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    },

    // Gradients (theme-aware)
    gradient: {
      primary: isDark
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: isDark
        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: isDark
        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
        : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      purple: isDark
        ? 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)'
        : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
      ocean: isDark
        ? 'linear-gradient(135deg, #2afadf 0%, #4c83ff 100%)'
        : 'linear-gradient(135deg, #2afadf 0%, #4c83ff 100%)',
      sunset: isDark
        ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      dark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    },

    // Shadow colors (theme-aware)
    shadow: {
      sm: isDark ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: isDark ? '0 4px 6px rgba(0, 0, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: isDark ? '0 10px 15px rgba(0, 0, 0, 0.5)' : '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: isDark ? '0 20px 25px rgba(0, 0, 0, 0.6)' : '0 20px 25px rgba(0, 0, 0, 0.1)',
      inner: isDark ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)' : 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    },

    // Glass morphism
    glass: {
      bg: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
      blur: isDark ? 'blur(16px)' : 'blur(12px)',
    },

    // Modal overlays
    overlay: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      heavy: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
    },

    // Social media brand colors (consistent)
    social: {
      facebook: '#1877f2',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      linkedin: '#0a66c2',
      youtube: '#ff0000',
      tiktok: '#000000',
      discord: '#5865f2',
      slack: '#4a154b',
    },

    // Common UI colors
    like: '#ef4444', // Red for likes
    share: '#3b82f6', // Blue for share
    comment: '#10b981', // Green for comments
    bookmark: '#f59e0b', // Yellow/Orange for bookmarks

    // Special purpose colors
    premium: {
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#ea580c',
    },

    // Chart/Data visualization colors
    chart: [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Orange
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f97316', // Deep Orange
      '#6366f1', // Indigo
    ],
  }), [isDark]);

  return colors;
}

/**
 * Helper hook for common component styles
 */
export function useCommonStyles() {
  const colors = useThemeColors();
  const { actualColorMode } = useTheme();
  const isDark = actualColorMode === 'dark';

  const styles = useMemo(() => ({
    // Card styles
    card: {
      background: colors.bg.secondary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '12px',
      boxShadow: colors.shadow.sm,
    },

    // Elevated card (on hover)
    cardElevated: {
      background: colors.bg.elevated,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '12px',
      boxShadow: colors.shadow.md,
    },

    // Glass card
    cardGlass: {
      background: colors.glass.bg,
      backdropFilter: colors.glass.blur,
      border: `1px solid ${colors.glass.border}`,
      borderRadius: '12px',
    },

    // Button primary
    buttonPrimary: {
      background: colors.gradient.purple,
      color: colors.text.white,
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: colors.shadow.sm,
    },

    // Button secondary
    buttonSecondary: {
      background: colors.bg.secondary,
      color: colors.text.primary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontWeight: 500,
      cursor: 'pointer',
    },

    // Input field
    input: {
      background: colors.bg.secondary,
      color: colors.text.primary,
      border: `2px solid ${colors.border.primary}`,
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      width: '100%',
    },

    // Input focus
    inputFocus: {
      outline: 'none',
      borderColor: colors.border.focus,
      boxShadow: `0 0 0 4px ${colors.interactive.focus}`,
    },

    // Modal
    modal: {
      background: colors.bg.primary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '16px',
      boxShadow: colors.shadow.xl,
      padding: '2rem',
    },

    // Modal overlay
    modalOverlay: {
      background: colors.overlay.heavy,
      backdropFilter: 'blur(4px)',
    },

    // Divider
    divider: {
      borderTop: `1px solid ${colors.border.primary}`,
    },
  }), [colors]);

  return { colors, styles, isDark };
}
