'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '@/lib/utils';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

type ColorMode = 'light' | 'dark' | 'system';
type ReducedMotion = 'no-preference' | 'reduce';
type FontSize = 'small' | 'medium' | 'large';
type Contrast = 'normal' | 'high';

interface ThemeContextType {
  // Current theme state
  currentTheme: Theme;
  colorMode: ColorMode;
  reducedMotion: ReducedMotion;
  fontSize: FontSize;
  contrast: Contrast;

  // Available themes
  themes: Theme[];

  // Theme actions
  setTheme: (themeId: string) => void;
  setColorMode: (mode: ColorMode) => void;
  setReducedMotion: (motion: ReducedMotion) => void;
  setFontSize: (size: FontSize) => void;
  setContrast: (contrast: Contrast) => void;

  // Utility functions
  getColor: (colorKey: keyof ThemeColors) => string;
  toggleColorMode: () => void;
  resetToDefaults: () => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useAdvancedTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useAdvancedTheme must be used within an AdvancedThemeProvider'
    );
  }
  return context;
}

// Default themes
const defaultThemes: Theme[] = [
  {
    id: 'echo-default',
    name: 'Echo Default',
    description: 'The classic Echo experience',
    colors: {
      light: {
        primary: '#007AFF',
        secondary: '#5856D6',
        accent: '#FF3B30',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        text: '#000000',
        textSecondary: '#6D6D70',
        border: '#C6C6C8',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#007AFF',
      },
      dark: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        accent: '#FF453A',
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#EBEBF5',
        border: '#38383A',
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF453A',
        info: '#64D2FF',
      },
    },
    fonts: {
      primary:
        '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif',
      secondary: 'Georgia, \"Times New Roman\", serif',
      mono: '\"SF Mono\", Monaco, \"Cascadia Code\", \"Roboto Mono\", monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      fast: '150ms ease',
      normal: '300ms ease',
      slow: '500ms ease',
    },
  },
  {
    id: 'echo-minimal',
    name: 'Minimal',
    description: 'Clean and minimal design',
    colors: {
      light: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0066CC',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#000000',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#00AA00',
        warning: '#FF8800',
        error: '#CC0000',
        info: '#0066CC',
      },
      dark: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        accent: '#3399FF',
        background: '#000000',
        surface: '#111111',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: '#333333',
        success: '#00DD00',
        warning: '#FFAA00',
        error: '#FF3333',
        info: '#3399FF',
      },
    },
    fonts: {
      primary: '\"Inter\", -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: '\"Inter\", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '\"JetBrains Mono\", \"Fira Code\", monospace',
    },
    spacing: {
      xs: '0.125rem',
      sm: '0.25rem',
      md: '0.75rem',
      lg: '1.25rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      xl: '0.75rem',
    },
    shadows: {
      sm: '0 1px 1px rgba(0, 0, 0, 0.05)',
      md: '0 2px 4px rgba(0, 0, 0, 0.1)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
      xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
    },
    animations: {
      fast: '100ms linear',
      normal: '200ms ease-out',
      slow: '400ms ease-in-out',
    },
  },
  {
    id: 'echo-vibrant',
    name: 'Vibrant',
    description: 'Bold and colorful experience',
    colors: {
      light: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        accent: '#FFD23F',
        background: '#FFFFFF',
        surface: '#FFF8F0',
        text: '#2D3748',
        textSecondary: '#718096',
        border: '#E2E8F0',
        success: '#48BB78',
        warning: '#ED8936',
        error: '#F56565',
        info: '#4299E1',
      },
      dark: {
        primary: '#FF8A65',
        secondary: '#FFB74D',
        accent: '#FFF176',
        background: '#1A202C',
        surface: '#2D3748',
        text: '#F7FAFC',
        textSecondary: '#E2E8F0',
        border: '#4A5568',
        success: '#68D391',
        warning: '#F6AD55',
        error: '#FC8181',
        info: '#63B3ED',
      },
    },
    fonts: {
      primary: '\"Poppins\", -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: '\"Playfair Display\", Georgia, serif',
      mono: '\"Source Code Pro\", monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2.5rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    shadows: {
      sm: '0 2px 4px rgba(255, 107, 53, 0.1)',
      md: '0 4px 8px rgba(255, 107, 53, 0.15)',
      lg: '0 8px 16px rgba(255, 107, 53, 0.2)',
      xl: '0 16px 32px rgba(255, 107, 53, 0.25)',
    },
    animations: {
      fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '600ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
];

interface AdvancedThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  persistSettings?: boolean;
}

export function AdvancedThemeProvider({
  children,
  defaultTheme = 'echo-default',
  persistSettings = true,
}: AdvancedThemeProviderProps) {
  const [themes] = useState<Theme[]>(defaultThemes);
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return persistSettings
      ? storage.get('echo-theme-id', defaultTheme)
      : defaultTheme;
  });
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    return persistSettings
      ? (storage.get('echo-color-mode', 'system') as ColorMode)
      : 'system';
  });
  const [reducedMotion, setReducedMotionState] = useState<ReducedMotion>(() => {
    return persistSettings
      ? (storage.get('echo-reduced-motion', 'no-preference') as ReducedMotion)
      : 'no-preference';
  });
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return persistSettings ? (storage.get('echo-font-size', 'medium') as FontSize) : 'medium';
  });
  const [contrast, setContrastState] = useState<Contrast>(() => {
    return persistSettings ? (storage.get('echo-contrast', 'normal') as Contrast) : 'normal';
  });

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect system color mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (colorMode === 'system') {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    // Detect reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      const newMotion = motionQuery.matches ? 'reduce' : 'no-preference';
      setReducedMotionState(newMotion);
      if (persistSettings) {
        storage.set('echo-reduced-motion', newMotion);
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);
    handleMotionChange();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [colorMode, persistSettings]);

  // Apply theme to document
  const applyTheme = useCallback(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark =
      colorMode === 'dark' ||
      (colorMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const colors = isDark
      ? currentTheme.colors.dark
      : currentTheme.colors.light;

    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply font settings
    Object.entries(currentTheme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Apply spacing
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Apply shadows
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animations
    Object.entries(currentTheme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value);
    });

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[fontSize]);

    // Apply contrast
    root.style.setProperty('--contrast-mode', contrast);
    if (contrast === 'high') {
      root.style.setProperty('--color-border', isDark ? '#FFFFFF' : '#000000');
    }

    // Apply reduced motion
    if (reducedMotion === 'reduce') {
      root.style.setProperty('--animation-fast', '0ms');
      root.style.setProperty('--animation-normal', '0ms');
      root.style.setProperty('--animation-slow', '0ms');
    }

    // Set data attributes
    root.setAttribute('data-theme', currentTheme.id);
    root.setAttribute('data-color-mode', isDark ? 'dark' : 'light');
    root.setAttribute('data-font-size', fontSize);
    root.setAttribute('data-contrast', contrast);
    root.setAttribute('data-reduced-motion', reducedMotion);
  }, [currentTheme, colorMode, fontSize, contrast, reducedMotion]);

  // Apply theme when dependencies change
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Persist settings
  useEffect(() => {
    if (persistSettings && currentThemeId) {
      storage.set('echo-theme-id', currentThemeId);
      storage.set('echo-color-mode', colorMode);
      storage.set('echo-font-size', fontSize);
      storage.set('echo-contrast', contrast);
    }
  }, [currentThemeId, colorMode, fontSize, contrast, persistSettings]);

  const setTheme = useCallback((themeId: string) => {
    setCurrentThemeId(themeId);
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const setReducedMotion = useCallback((motion: ReducedMotion) => {
    setReducedMotionState(motion);
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
  }, []);

  const setContrast = useCallback((contrastMode: Contrast) => {
    setContrastState(contrastMode);
  }, []);

  const getColor = useCallback(
    (colorKey: keyof ThemeColors) => {
      const isDark =
        colorMode === 'dark' ||
        (colorMode === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      return isDark
        ? currentTheme.colors.dark[colorKey]
        : currentTheme.colors.light[colorKey];
    },
    [currentTheme, colorMode]
  );

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  }, [colorMode, setColorMode]);

  const resetToDefaults = useCallback(() => {
    setCurrentThemeId(defaultTheme);
    setColorModeState('system');
    setFontSizeState('medium');
    setContrastState('normal');
    setReducedMotionState('no-preference');
  }, [defaultTheme]);

  const exportTheme = useCallback(() => {
    const themeData = {
      themeId: currentThemeId,
      colorMode,
      fontSize,
      contrast,
      reducedMotion,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(themeData, null, 2);
  }, [currentThemeId, colorMode, fontSize, contrast, reducedMotion]);

  const importTheme = useCallback(
    (themeData: string) => {
      try {
        const parsed = JSON.parse(themeData);
        if (parsed.themeId && themes.find((t) => t.id === parsed.themeId)) {
          setCurrentThemeId(parsed.themeId);
        }
        if (parsed.colorMode) setColorModeState(parsed.colorMode);
        if (parsed.fontSize) setFontSizeState(parsed.fontSize);
        if (parsed.contrast) setContrastState(parsed.contrast);
        if (parsed.reducedMotion) setReducedMotionState(parsed.reducedMotion);
        return true;
      } catch (error) {
        return false;
      }
    },
    [themes]
  );

  const value: ThemeContextType = {
    currentTheme,
    colorMode,
    reducedMotion,
    fontSize,
    contrast,
    themes,
    setTheme,
    setColorMode,
    setReducedMotion,
    setFontSize,
    setContrast,
    getColor,
    toggleColorMode,
    resetToDefaults,
    exportTheme,
    importTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Theme transition component
export function ThemeTransition({ children }: { children: ReactNode }) {
  const { currentTheme, reducedMotion } = useAdvancedTheme();

  if (reducedMotion === 'reduce') {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTheme.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
