'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

// Modern Theme Types
type ColorMode = 'light' | 'dark' | 'auto';
type ThemeVariant = 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'rose';

interface ThemeColors {
  // Primary palette
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary palette
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Accent colors
  accent: string;
  accentLight: string;
  accentDark: string;

  // Background system
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surface colors
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;
  borderHeavy: string;

  // State colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Interactive states
  hover: string;
  active: string;
  focus: string;

  // Shadows and effects
  shadow: string;
  shadowLarge: string;
  glow: string;
}

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number; // Font size in pixels (14-20)
}

interface ModernThemeContextType {
  // Current state
  colorMode: ColorMode;
  actualMode: 'light' | 'dark';
  variant: ThemeVariant;
  colors: ThemeColors;
  accessibility: AccessibilitySettings;
  isTransitioning: boolean;

  // Actions
  setColorMode: (mode: ColorMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggleMode: () => void;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;

  // Utilities
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
}

// Theme Variants with Light and Dark Modes
const THEME_VARIANTS: Record<ThemeVariant, { light: ThemeColors; dark: ThemeColors }> = {
  // Default - Modern Blue/Purple
  default: {
    light: {
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      secondary: '#8b5cf6',
      secondaryLight: '#a78bfa',
      secondaryDark: '#7c3aed',
      accent: '#ec4899',
      accentLight: '#f472b6',
      accentDark: '#db2777',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      surface: '#ffffff',
      surfaceElevated: '#f8fafc',
      surfaceHover: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      borderHeavy: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: 'rgba(59, 130, 246, 0.1)',
      active: 'rgba(59, 130, 246, 0.2)',
      focus: 'rgba(59, 130, 246, 0.3)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    },
    dark: {
      primary: '#60a5fa',
      primaryLight: '#93c5fd',
      primaryDark: '#3b82f6',
      secondary: '#a78bfa',
      secondaryLight: '#c4b5fd',
      secondaryDark: '#8b5cf6',
      accent: '#f472b6',
      accentLight: '#f9a8d4',
      accentDark: '#ec4899',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      surface: '#1e293b',
      surfaceElevated: '#334155',
      surfaceHover: '#475569',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      textInverse: '#0f172a',
      border: '#334155',
      borderLight: '#1e293b',
      borderHeavy: '#475569',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: 'rgba(96, 165, 250, 0.15)',
      active: 'rgba(96, 165, 250, 0.25)',
      focus: 'rgba(96, 165, 250, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
      glow: '0 0 30px rgba(96, 165, 250, 0.4)',
    },
  },

  // Ocean - Teal/Cyan
  ocean: {
    light: {
      primary: '#0891b2',
      primaryLight: '#06b6d4',
      primaryDark: '#0e7490',
      secondary: '#0ea5e9',
      secondaryLight: '#38bdf8',
      secondaryDark: '#0284c7',
      accent: '#14b8a6',
      accentLight: '#2dd4bf',
      accentDark: '#0d9488',
      background: '#ffffff',
      backgroundSecondary: '#f0fdfa',
      backgroundTertiary: '#ccfbf1',
      surface: '#ffffff',
      surfaceElevated: '#f0fdfa',
      surfaceHover: '#ccfbf1',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#99f6e4',
      borderLight: '#ccfbf1',
      borderHeavy: '#5eead4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      hover: 'rgba(8, 145, 178, 0.1)',
      active: 'rgba(8, 145, 178, 0.2)',
      focus: 'rgba(8, 145, 178, 0.3)',
      shadow: '0 4px 6px -1px rgba(8, 145, 178, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(8, 145, 178, 0.15)',
      glow: '0 0 20px rgba(8, 145, 178, 0.3)',
    },
    dark: {
      primary: '#22d3ee',
      primaryLight: '#67e8f9',
      primaryDark: '#06b6d4',
      secondary: '#38bdf8',
      secondaryLight: '#7dd3fc',
      secondaryDark: '#0ea5e9',
      accent: '#2dd4bf',
      accentLight: '#5eead4',
      accentDark: '#14b8a6',
      background: '#0c1222',
      backgroundSecondary: '#172033',
      backgroundTertiary: '#1e2a3f',
      surface: '#172033',
      surfaceElevated: '#1e2a3f',
      surfaceHover: '#2c3e5a',
      text: '#f0fdfa',
      textSecondary: '#ccfbf1',
      textTertiary: '#99f6e4',
      textInverse: '#0c1222',
      border: '#1e2a3f',
      borderLight: '#172033',
      borderHeavy: '#2c3e5a',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#38bdf8',
      hover: 'rgba(34, 211, 238, 0.15)',
      active: 'rgba(34, 211, 238, 0.25)',
      focus: 'rgba(34, 211, 238, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      glow: '0 0 30px rgba(34, 211, 238, 0.4)',
    },
  },

  // Sunset - Orange/Pink
  sunset: {
    light: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      primaryDark: '#ea580c',
      secondary: '#ec4899',
      secondaryLight: '#f472b6',
      secondaryDark: '#db2777',
      accent: '#f59e0b',
      accentLight: '#fbbf24',
      accentDark: '#d97706',
      background: '#ffffff',
      backgroundSecondary: '#fff7ed',
      backgroundTertiary: '#ffedd5',
      surface: '#ffffff',
      surfaceElevated: '#fff7ed',
      surfaceHover: '#ffedd5',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#fed7aa',
      borderLight: '#ffedd5',
      borderHeavy: '#fdba74',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: 'rgba(249, 115, 22, 0.1)',
      active: 'rgba(249, 115, 22, 0.2)',
      focus: 'rgba(249, 115, 22, 0.3)',
      shadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(249, 115, 22, 0.15)',
      glow: '0 0 20px rgba(249, 115, 22, 0.3)',
    },
    dark: {
      primary: '#fb923c',
      primaryLight: '#fdba74',
      primaryDark: '#f97316',
      secondary: '#f472b6',
      secondaryLight: '#f9a8d4',
      secondaryDark: '#ec4899',
      accent: '#fbbf24',
      accentLight: '#fcd34d',
      accentDark: '#f59e0b',
      background: '#1c0f0a',
      backgroundSecondary: '#2d1810',
      backgroundTertiary: '#3f2418',
      surface: '#2d1810',
      surfaceElevated: '#3f2418',
      surfaceHover: '#4f2d1f',
      text: '#fff7ed',
      textSecondary: '#ffedd5',
      textTertiary: '#fed7aa',
      textInverse: '#1c0f0a',
      border: '#3f2418',
      borderLight: '#2d1810',
      borderHeavy: '#4f2d1f',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: 'rgba(251, 146, 60, 0.15)',
      active: 'rgba(251, 146, 60, 0.25)',
      focus: 'rgba(251, 146, 60, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      glow: '0 0 30px rgba(251, 146, 60, 0.4)',
    },
  },

  // Forest - Green/Emerald
  forest: {
    light: {
      primary: '#059669',
      primaryLight: '#10b981',
      primaryDark: '#047857',
      secondary: '#14b8a6',
      secondaryLight: '#2dd4bf',
      secondaryDark: '#0d9488',
      accent: '#84cc16',
      accentLight: '#a3e635',
      accentDark: '#65a30d',
      background: '#ffffff',
      backgroundSecondary: '#f0fdf4',
      backgroundTertiary: '#dcfce7',
      surface: '#ffffff',
      surfaceElevated: '#f0fdf4',
      surfaceHover: '#dcfce7',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#bbf7d0',
      borderLight: '#dcfce7',
      borderHeavy: '#86efac',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: 'rgba(5, 150, 105, 0.1)',
      active: 'rgba(5, 150, 105, 0.2)',
      focus: 'rgba(5, 150, 105, 0.3)',
      shadow: '0 4px 6px -1px rgba(5, 150, 105, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(5, 150, 105, 0.15)',
      glow: '0 0 20px rgba(5, 150, 105, 0.3)',
    },
    dark: {
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      primaryDark: '#10b981',
      secondary: '#2dd4bf',
      secondaryLight: '#5eead4',
      secondaryDark: '#14b8a6',
      accent: '#a3e635',
      accentLight: '#bef264',
      accentDark: '#84cc16',
      background: '#0a150f',
      backgroundSecondary: '#132519',
      backgroundTertiary: '#1c3626',
      surface: '#132519',
      surfaceElevated: '#1c3626',
      surfaceHover: '#264a33',
      text: '#f0fdf4',
      textSecondary: '#dcfce7',
      textTertiary: '#bbf7d0',
      textInverse: '#0a150f',
      border: '#1c3626',
      borderLight: '#132519',
      borderHeavy: '#264a33',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: 'rgba(52, 211, 153, 0.15)',
      active: 'rgba(52, 211, 153, 0.25)',
      focus: 'rgba(52, 211, 153, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      glow: '0 0 30px rgba(52, 211, 153, 0.4)',
    },
  },

  // Lavender - Purple/Violet
  lavender: {
    light: {
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      secondary: '#a855f7',
      secondaryLight: '#c084fc',
      secondaryDark: '#9333ea',
      accent: '#d946ef',
      accentLight: '#e879f9',
      accentDark: '#c026d3',
      background: '#ffffff',
      backgroundSecondary: '#faf5ff',
      backgroundTertiary: '#f3e8ff',
      surface: '#ffffff',
      surfaceElevated: '#faf5ff',
      surfaceHover: '#f3e8ff',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#e9d5ff',
      borderLight: '#f3e8ff',
      borderHeavy: '#d8b4fe',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: 'rgba(139, 92, 246, 0.1)',
      active: 'rgba(139, 92, 246, 0.2)',
      focus: 'rgba(139, 92, 246, 0.3)',
      shadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(139, 92, 246, 0.15)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    },
    dark: {
      primary: '#a78bfa',
      primaryLight: '#c4b5fd',
      primaryDark: '#8b5cf6',
      secondary: '#c084fc',
      secondaryLight: '#d8b4fe',
      secondaryDark: '#a855f7',
      accent: '#e879f9',
      accentLight: '#f0abfc',
      accentDark: '#d946ef',
      background: '#130a1f',
      backgroundSecondary: '#1e1231',
      backgroundTertiary: '#2d1b47',
      surface: '#1e1231',
      surfaceElevated: '#2d1b47',
      surfaceHover: '#3d2859',
      text: '#faf5ff',
      textSecondary: '#f3e8ff',
      textTertiary: '#e9d5ff',
      textInverse: '#130a1f',
      border: '#2d1b47',
      borderLight: '#1e1231',
      borderHeavy: '#3d2859',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: 'rgba(167, 139, 250, 0.15)',
      active: 'rgba(167, 139, 250, 0.25)',
      focus: 'rgba(167, 139, 250, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      glow: '0 0 30px rgba(167, 139, 250, 0.4)',
    },
  },

  // Rose - Red/Pink
  rose: {
    light: {
      primary: '#e11d48',
      primaryLight: '#f43f5e',
      primaryDark: '#be123c',
      secondary: '#ec4899',
      secondaryLight: '#f472b6',
      secondaryDark: '#db2777',
      accent: '#fb7185',
      accentLight: '#fda4af',
      accentDark: '#f43f5e',
      background: '#ffffff',
      backgroundSecondary: '#fff1f2',
      backgroundTertiary: '#ffe4e6',
      surface: '#ffffff',
      surfaceElevated: '#fff1f2',
      surfaceHover: '#ffe4e6',
      text: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      border: '#fecdd3',
      borderLight: '#ffe4e6',
      borderHeavy: '#fda4af',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: 'rgba(225, 29, 72, 0.1)',
      active: 'rgba(225, 29, 72, 0.2)',
      focus: 'rgba(225, 29, 72, 0.3)',
      shadow: '0 4px 6px -1px rgba(225, 29, 72, 0.1)',
      shadowLarge: '0 20px 25px -5px rgba(225, 29, 72, 0.15)',
      glow: '0 0 20px rgba(225, 29, 72, 0.3)',
    },
    dark: {
      primary: '#fb7185',
      primaryLight: '#fda4af',
      primaryDark: '#f43f5e',
      secondary: '#f472b6',
      secondaryLight: '#f9a8d4',
      secondaryDark: '#ec4899',
      accent: '#fda4af',
      accentLight: '#fecdd3',
      accentDark: '#fb7185',
      background: '#1f0a12',
      backgroundSecondary: '#2d121c',
      backgroundTertiary: '#3f1b29',
      surface: '#2d121c',
      surfaceElevated: '#3f1b29',
      surfaceHover: '#522839',
      text: '#fff1f2',
      textSecondary: '#ffe4e6',
      textTertiary: '#fecdd3',
      textInverse: '#1f0a12',
      border: '#3f1b29',
      borderLight: '#2d121c',
      borderHeavy: '#522839',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: 'rgba(251, 113, 133, 0.15)',
      active: 'rgba(251, 113, 133, 0.25)',
      focus: 'rgba(251, 113, 133, 0.35)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLarge: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      glow: '0 0 30px rgba(251, 113, 133, 0.4)',
    },
  },
};

const ModernThemeContext = createContext<ModernThemeContextType | undefined>(undefined);

export function ModernThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('auto');
  const [variant, setVariant] = useState<ThemeVariant>('default');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 16, // Default 16px
  });

  // Get system preference
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Calculate actual mode
  const actualMode: 'light' | 'dark' = useMemo(() => {
    if (colorMode === 'auto') {
      return getSystemPreference();
    }
    return colorMode;
  }, [colorMode, getSystemPreference]);

  // Get current colors (with fallback for safety)
  const colors = useMemo(() => {
    const safeVariant = variant && THEME_VARIANTS[variant] ? variant : 'default';
    const safeMode = actualMode === 'dark' ? 'dark' : 'light';
    return THEME_VARIANTS[safeVariant][safeMode];
  }, [variant, actualMode]);

  // Boolean helpers
  const isDark = actualMode === 'dark';
  const isLight = actualMode === 'light';
  const isAuto = colorMode === 'auto';

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('echo-modern-color-mode') as ColorMode | null;
      const savedVariant = localStorage.getItem('echo-modern-variant') as ThemeVariant | null;
      const savedAccessibility = localStorage.getItem('echo-modern-accessibility');

      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setColorMode(savedMode);
      }

      if (savedVariant && ['default', 'ocean', 'sunset', 'forest', 'lavender', 'rose'].includes(savedVariant)) {
        setVariant(savedVariant);
      } else if (savedVariant) {
        // Clean up invalid old theme from localStorage
        localStorage.removeItem('echo-modern-variant');
        console.info('Cleared invalid theme variant from localStorage:', savedVariant);
      }

      if (savedAccessibility) {
        try {
          const prefs = JSON.parse(savedAccessibility);
          setAccessibility(prev => ({ ...prev, ...prefs }));
        } catch (error) {
          console.warn('Failed to parse accessibility settings:', error);
        }
      }

      // Detect system accessibility preferences
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setAccessibility(prev => ({ ...prev, reducedMotion, highContrast }));
    }
    setMounted(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    setIsTransitioning(true);

    // Apply color mode
    root.setAttribute('data-theme', actualMode);
    root.setAttribute('data-variant', variant);

    // Apply dark class for Tailwind
    if (actualMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply accessibility
    root.setAttribute('data-reduced-motion', accessibility.reducedMotion.toString());
    root.setAttribute('data-high-contrast', accessibility.highContrast.toString());
    root.setAttribute('data-font-size', String(accessibility.fontSize));

    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Legacy support
    body.style.backgroundColor = colors.background;
    body.style.color = colors.text;

    // Smooth transition
    if (!accessibility.reducedMotion) {
      root.classList.add('theme-transitioning');
      const timeout = setTimeout(() => {
        root.classList.remove('theme-transitioning');
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setIsTransitioning(false);
    }

    // Save preferences
    localStorage.setItem('echo-modern-color-mode', colorMode);
    localStorage.setItem('echo-modern-variant', variant);
    localStorage.setItem('echo-modern-accessibility', JSON.stringify(accessibility));
  }, [colorMode, variant, actualMode, colors, accessibility, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || colorMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Force re-render when system preference changes
      setColorMode('auto');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    setColorMode(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  }, []);

  // Update accessibility
  const updateAccessibility = useCallback((settings: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => ({ ...prev, ...settings }));
  }, []);

  const value = useMemo(() => ({
    colorMode,
    actualMode,
    variant,
    colors,
    accessibility,
    isTransitioning,
    setColorMode,
    setVariant,
    toggleMode,
    setAccessibility: updateAccessibility,
    isDark,
    isLight,
    isAuto,
  }), [
    colorMode,
    actualMode,
    variant,
    colors,
    accessibility,
    isTransitioning,
    toggleMode,
    updateAccessibility,
    isDark,
    isLight,
    isAuto,
  ]);

  return (
    <ModernThemeContext.Provider value={value}>
      {children}
    </ModernThemeContext.Provider>
  );
}

export function useModernTheme() {
  const context = useContext(ModernThemeContext);
  if (context === undefined) {
    throw new Error('useModernTheme must be used within a ModernThemeProvider');
  }
  return context;
}

export { THEME_VARIANTS };
export type { ColorMode, ThemeVariant, ThemeColors, AccessibilitySettings };
