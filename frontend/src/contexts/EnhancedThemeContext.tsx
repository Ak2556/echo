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

// Enhanced theme types for flagship UI
type ThemeMode = 'electric' | 'professional' | 'modern' | 'creator';
type ColorMode = 'dark' | 'light' | 'auto';

interface ThemeColors {
  // Core colors
  primary: string;
  secondary: string;
  accent: string;
  
  // Background system
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text system
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Interactive states
  hover: string;
  active: string;
  focus: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Borders and dividers
  border: string;
  borderSubtle: string;
  
  // Shadows and glows
  shadow: string;
  glow: string;
  
  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
  gradientAccent: string;
}

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  forcedColors: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  // Theme state
  themeMode: ThemeMode;
  colorMode: ColorMode;
  actualColorMode: 'dark' | 'light';
  
  // Theme data
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  shadows: Record<string, string>;
  
  // Accessibility
  accessibility: AccessibilityPreferences;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setAccessibility: (prefs: Partial<AccessibilityPreferences>) => void;
  
  // Utilities
  getThemeClass: () => string;
  isTransitioning: boolean;
}

// Theme definitions for all 4 flagship themes
const THEME_DEFINITIONS: Record<ThemeMode, { light: ThemeColors; dark: ThemeColors }> = {
  // Electric Purple × Black (Neon Creator Mode)
  electric: {
    light: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      hover: 'rgba(139, 92, 246, 0.1)',
      active: 'rgba(139, 92, 246, 0.2)',
      focus: 'rgba(139, 92, 246, 0.3)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(139, 92, 246, 0.2)',
      borderSubtle: 'rgba(139, 92, 246, 0.1)',
      shadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      gradientPrimary: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      gradientSecondary: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      gradientAccent: 'linear-gradient(135deg, #C084FC 0%, #DDD6FE 100%)',
    },
    dark: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#000000',
      surface: '#0A0A0A',
      surfaceElevated: '#141414',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      hover: 'rgba(139, 92, 246, 0.2)',
      active: 'rgba(139, 92, 246, 0.3)',
      focus: 'rgba(139, 92, 246, 0.4)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(139, 92, 246, 0.3)',
      borderSubtle: 'rgba(139, 92, 246, 0.1)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(139, 92, 246, 0.5)',
      gradientPrimary: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      gradientSecondary: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      gradientAccent: 'linear-gradient(135deg, #C084FC 0%, #DDD6FE 100%)',
    },
  },
  
  // Premium Blue × White (Clean Professional Mode)
  professional: {
    light: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      hover: 'rgba(59, 130, 246, 0.1)',
      active: 'rgba(59, 130, 246, 0.2)',
      focus: 'rgba(59, 130, 246, 0.3)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(59, 130, 246, 0.2)',
      borderSubtle: 'rgba(59, 130, 246, 0.1)',
      shadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      gradientPrimary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      gradientSecondary: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
      gradientAccent: 'linear-gradient(135deg, #93C5FD 0%, #DBEAFE 100%)',
    },
    dark: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceElevated: '#334155',
      textPrimary: '#F1F5F9',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      hover: 'rgba(59, 130, 246, 0.2)',
      active: 'rgba(59, 130, 246, 0.3)',
      focus: 'rgba(59, 130, 246, 0.4)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(59, 130, 246, 0.3)',
      borderSubtle: 'rgba(59, 130, 246, 0.1)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(59, 130, 246, 0.5)',
      gradientPrimary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      gradientSecondary: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
      gradientAccent: 'linear-gradient(135deg, #93C5FD 0%, #DBEAFE 100%)',
    },
  },
  
  // MKBHD Red × Charcoal (Ultra Modern)
  modern: {
    light: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      hover: 'rgba(239, 68, 68, 0.1)',
      active: 'rgba(239, 68, 68, 0.2)',
      focus: 'rgba(239, 68, 68, 0.3)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(239, 68, 68, 0.2)',
      borderSubtle: 'rgba(239, 68, 68, 0.1)',
      shadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
      glow: '0 0 20px rgba(239, 68, 68, 0.3)',
      gradientPrimary: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      gradientSecondary: 'linear-gradient(135deg, #F87171 0%, #FCA5A5 100%)',
      gradientAccent: 'linear-gradient(135deg, #FCA5A5 0%, #FEE2E2 100%)',
    },
    dark: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      background: '#1C1C1C',
      surface: '#262626',
      surfaceElevated: '#404040',
      textPrimary: '#FFFFFF',
      textSecondary: '#E5E5E5',
      textMuted: '#A3A3A3',
      hover: 'rgba(239, 68, 68, 0.2)',
      active: 'rgba(239, 68, 68, 0.3)',
      focus: 'rgba(239, 68, 68, 0.4)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(239, 68, 68, 0.3)',
      borderSubtle: 'rgba(239, 68, 68, 0.1)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(239, 68, 68, 0.5)',
      gradientPrimary: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      gradientSecondary: 'linear-gradient(135deg, #F87171 0%, #FCA5A5 100%)',
      gradientAccent: 'linear-gradient(135deg, #FCA5A5 0%, #FEE2E2 100%)',
    },
  },
  
  // Sunset Gradient × Dark (Creator Social Mode)
  creator: {
    light: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#EC4899',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceElevated: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B',
      hover: 'rgba(249, 115, 22, 0.1)',
      active: 'rgba(249, 115, 22, 0.2)',
      focus: 'rgba(249, 115, 22, 0.3)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(249, 115, 22, 0.2)',
      borderSubtle: 'rgba(249, 115, 22, 0.1)',
      shadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)',
      glow: '0 0 20px rgba(249, 115, 22, 0.3)',
      gradientPrimary: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
      gradientSecondary: 'linear-gradient(135deg, #FB923C 0%, #F472B6 100%)',
      gradientAccent: 'linear-gradient(135deg, #EC4899 0%, #FBCFE8 100%)',
    },
    dark: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#EC4899',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceElevated: '#334155',
      textPrimary: '#F1F5F9',
      textSecondary: '#E2E8F0',
      textMuted: '#94A3B8',
      hover: 'rgba(249, 115, 22, 0.2)',
      active: 'rgba(249, 115, 22, 0.3)',
      focus: 'rgba(249, 115, 22, 0.4)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: 'rgba(249, 115, 22, 0.3)',
      borderSubtle: 'rgba(249, 115, 22, 0.1)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(249, 115, 22, 0.5)',
      gradientPrimary: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
      gradientSecondary: 'linear-gradient(135deg, #FB923C 0%, #F472B6 100%)',
      gradientAccent: 'linear-gradient(135deg, #EC4899 0%, #FBCFE8 100%)',
    },
  },
};

// Design system tokens
const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '3rem',    // 48px
  '5xl': '4rem',    // 64px
  '6xl': '6rem',    // 96px
};

const TYPOGRAPHY = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function EnhancedThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>('professional');
  const [colorMode, setColorMode] = useState<ColorMode>('auto');
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    forcedColors: false,
    fontSize: 'medium',
  });

  // Determine actual color mode
  const getSystemPreference = useCallback((): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const actualColorMode = useMemo(() => {
    if (colorMode === 'auto') {
      return getSystemPreference();
    }
    return colorMode;
  }, [colorMode, getSystemPreference]);

  // Get current theme colors
  const colors = useMemo(() => {
    return THEME_DEFINITIONS[themeMode][actualColorMode];
  }, [themeMode, actualColorMode]);

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('echo-theme-mode') as ThemeMode | null;
      const savedColorMode = localStorage.getItem('echo-color-mode') as ColorMode | null;
      const savedAccessibility = localStorage.getItem('echo-accessibility');

      if (savedTheme && ['electric', 'professional', 'modern', 'creator'].includes(savedTheme)) {
        setThemeMode(savedTheme);
      }
      if (savedColorMode && ['dark', 'light', 'auto'].includes(savedColorMode)) {
        setColorMode(savedColorMode);
      }
      if (savedAccessibility) {
        try {
          const prefs = JSON.parse(savedAccessibility);
          setAccessibility(prev => ({ ...prev, ...prefs }));
        } catch (error) {
          console.warn('Failed to parse accessibility preferences:', error);
        }
      }

      // Detect system accessibility preferences
      const mediaQueries = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        forcedColors: window.matchMedia('(forced-colors: active)').matches,
      };
      
      setAccessibility(prev => ({ ...prev, ...mediaQueries }));
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    setIsTransitioning(true);

    // Apply theme class
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${themeMode}`);

    // Apply color mode
    root.setAttribute('data-theme', actualColorMode);
    root.setAttribute('data-theme-mode', themeMode);

    // Apply accessibility preferences
    root.setAttribute('data-reduced-motion', accessibility.reducedMotion.toString());
    root.setAttribute('data-high-contrast', accessibility.highContrast.toString());
    root.setAttribute('data-forced-colors', accessibility.forcedColors.toString());
    root.setAttribute('data-font-size', accessibility.fontSize);

    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(SPACING).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(TYPOGRAPHY).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });

    Object.entries(SHADOWS).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Add transition class
    if (!accessibility.reducedMotion) {
      root.classList.add('theme-transitioning');
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsTransitioning(false);
    }

    // Save preferences
    localStorage.setItem('echo-theme-mode', themeMode);
    localStorage.setItem('echo-color-mode', colorMode);
    localStorage.setItem('echo-accessibility', JSON.stringify(accessibility));
  }, [themeMode, actualColorMode, accessibility, colors, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (colorMode === 'auto') {
        // Force re-render when system preference changes
        setColorMode('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  }, []);

  const updateAccessibility = useCallback((prefs: Partial<AccessibilityPreferences>) => {
    setAccessibility(prev => ({ ...prev, ...prefs }));
  }, []);

  const getThemeClass = useCallback(() => {
    return `theme-${themeMode} ${actualColorMode}`;
  }, [themeMode, actualColorMode]);

  const value = useMemo(() => ({
    themeMode,
    colorMode,
    actualColorMode,
    colors,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    shadows: SHADOWS,
    accessibility,
    setThemeMode,
    setColorMode,
    toggleColorMode,
    setAccessibility: updateAccessibility,
    getThemeClass,
    isTransitioning,
  }), [
    themeMode,
    colorMode,
    actualColorMode,
    colors,
    accessibility,
    toggleColorMode,
    updateAccessibility,
    getThemeClass,
    isTransitioning,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}

export { THEME_DEFINITIONS, SPACING, TYPOGRAPHY, SHADOWS };
export type { ThemeMode, ColorMode, ThemeColors, AccessibilityPreferences };