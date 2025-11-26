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

type Theme = 'nothing';
type ColorMode = 'dark' | 'light' | 'auto';
type ThemeSchedule = 'off' | 'sunset' | 'time' | 'location';

type PaletteEntry = { primary: string; secondary: string; accent: string };
type ThemePalettes = Record<string, PaletteEntry>;

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  forcedColors: boolean;
}

interface ThemeScheduleSettings {
  type: ThemeSchedule;
  lightTime?: string; // HH:MM format
  darkTime?: string; // HH:MM format
  location?: { lat: number; lng: number };
}

// Nothing Phone authentic color palettes
const COLOR_PALETTES: Record<Theme, ThemePalettes> = {
  nothing: {
    // Classic Nothing Phone monochrome with red accent
    red: { primary: '#FF3333', secondary: '#FF5555', accent: '#FF7777' },
    // Nothing Phone glyph blue
    blue: { primary: '#007AFF', secondary: '#4A9EFF', accent: '#7AB8FF' },
    // Minimal green accent
    green: { primary: '#34C759', secondary: '#5DD780', accent: '#86E6A8' },
    // Nothing's signature white/grey system
    mono: { primary: '#FFFFFF', secondary: '#F2F2F7', accent: '#E5E5EA' },
    // Dark mode inverse
    dark: { primary: '#1C1C1E', secondary: '#2C2C2E', accent: '#3A3A3C' },
    // Nothing Phone signature dotted pattern accent
    glyph: { primary: '#FF6B6B', secondary: '#FFB3B3', accent: '#FFCCCC' },
  },
};

const DEFAULT_PALETTE: Record<Theme, string> = {
  nothing: 'mono',
};

const isValidPalette = (theme: Theme, key: string): boolean => {
  return Boolean(
    COLOR_PALETTES[theme] && (COLOR_PALETTES[theme] as ThemePalettes)[key]
  );
};

interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  actualColorMode: 'dark' | 'light'; // The actual applied mode (resolved from auto)
  colorPalette: string;
  accentColor: string;
  accessibilityPrefs: AccessibilityPreferences;
  themeSchedule: ThemeScheduleSettings;
  isTransitioning: boolean;
  setTheme: (theme: Theme) => void;
  setColorMode: (mode: ColorMode) => void;
  setColorPalette: (palette: string) => void;
  setAccentColor: (color: string) => void;
  setAccessibilityPrefs: (prefs: Partial<AccessibilityPreferences>) => void;
  setThemeSchedule: (schedule: ThemeScheduleSettings) => void;
  toggleColorMode: () => void;
  previewTheme: (mode: 'dark' | 'light', duration?: number) => void;
  getColors: () => PaletteEntry | null;
  getSystemPreference: () => 'dark' | 'light';
  getSunriseSunset: (
    lat: number,
    lng: number
  ) => Promise<{ sunrise: string; sunset: string }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Always use the same defaults for SSR and initial client render to prevent hydration mismatch
  const [theme, setTheme] = useState<Theme>('nothing');
  const [colorMode, setColorMode] = useState<ColorMode>('auto'); // Default to auto mode
  const [colorPalette, setColorPalette] = useState<string>(
    DEFAULT_PALETTE['nothing']
  );
  const [accentColor, setAccentColor] = useState<string>('#007aff');
  const [accessibilityPrefs, setAccessibilityPrefs] =
    useState<AccessibilityPreferences>({
      reducedMotion: false,
      highContrast: false,
      forcedColors: false,
    });
  const [themeSchedule, setThemeSchedule] = useState<ThemeScheduleSettings>({
    type: 'off',
  });
  const [actualColorMode, setActualColorMode] = useState<'dark' | 'light'>(
    'light'
  );
  const [previewMode, setPreviewMode] = useState<'dark' | 'light' | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Utility functions
  const getSystemPreference = useCallback((): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  const detectAccessibilityPreferences =
    useCallback((): AccessibilityPreferences => {
      if (typeof window === 'undefined') {
        return {
          reducedMotion: false,
          highContrast: false,
          forcedColors: false,
        };
      }

      return {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
          .matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        forcedColors: window.matchMedia('(forced-colors: active)').matches,
      };
    }, []);

  const getSunriseSunset = useCallback(
    async (
      lat: number,
      lng: number
    ): Promise<{ sunrise: string; sunset: string }> => {
      try {
        // Using a free sunrise-sunset API
        const response = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
        );
        const data = await response.json();

        if (data.status === 'OK') {
          const sunrise = new Date(data.results.sunrise);
          const sunset = new Date(data.results.sunset);

          return {
            sunrise: sunrise.toTimeString().slice(0, 5),
            sunset: sunset.toTimeString().slice(0, 5),
          };
        }
      } catch (error) {
        console.warn('Failed to fetch sunrise/sunset times:', error);
      }

      // Fallback times
      return { sunrise: '06:00', sunset: '18:00' };
    },
    []
  );

  const resolveColorMode = useCallback(
    (mode: ColorMode): 'dark' | 'light' => {
      if (mode === 'auto') {
        return getSystemPreference();
      }
      return mode;
    },
    [getSystemPreference]
  );

  const shouldUseDarkMode = useCallback((): boolean => {
    if (previewMode) return previewMode === 'dark';

    const resolvedMode = resolveColorMode(colorMode);
    if (resolvedMode === 'dark') return true;
    if (resolvedMode === 'light') return false;

    // Check schedule
    if (
      themeSchedule.type === 'time' &&
      themeSchedule.lightTime &&
      themeSchedule.darkTime
    ) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const lightTime = themeSchedule.lightTime;
      const darkTime = themeSchedule.darkTime;

      if (darkTime > lightTime) {
        // Normal day (dark time is after light time)
        return currentTime >= darkTime || currentTime < lightTime;
      } else {
        // Overnight (dark time is before light time)
        return currentTime >= darkTime && currentTime < lightTime;
      }
    }

    return false;
  }, [colorMode, themeSchedule, previewMode, resolveColorMode]);

  // Load saved preferences after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('echo-theme') as Theme | null;
      const savedColorMode = localStorage.getItem(
        'echo-color-mode'
      ) as ColorMode | null;
      const savedPalette = localStorage.getItem('echo-color-palette');
      const savedAccentColor = localStorage.getItem('echo-accent-color');
      const savedAccessibilityPrefs = localStorage.getItem(
        'echo-accessibility-prefs'
      );
      const savedThemeSchedule = localStorage.getItem('echo-theme-schedule');

      if (savedTheme && ['nothing'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      if (
        savedColorMode &&
        ['dark', 'light', 'auto'].includes(savedColorMode)
      ) {
        setColorMode(savedColorMode);
      }
      if (
        savedPalette &&
        isValidPalette(savedTheme || 'nothing', savedPalette)
      ) {
        setColorPalette(savedPalette);
      }
      if (savedAccentColor) {
        setAccentColor(savedAccentColor);
      }
      if (savedAccessibilityPrefs) {
        try {
          const prefs = JSON.parse(savedAccessibilityPrefs);
          setAccessibilityPrefs(prefs);
        } catch (error) {
          console.warn('Failed to parse accessibility preferences:', error);
        }
      }
      if (savedThemeSchedule) {
        try {
          const schedule = JSON.parse(savedThemeSchedule);
          setThemeSchedule(schedule);
        } catch (error) {
          console.warn('Failed to parse theme schedule:', error);
        }
      }

      // Detect system accessibility preferences
      const detectedPrefs = detectAccessibilityPreferences();
      setAccessibilityPrefs((prev) => ({ ...detectedPrefs, ...prev }));
    }
    setMounted(true);
  }, [detectAccessibilityPreferences]);

  // Apply theme to document body
  useEffect(() => {
    if (!mounted) return; // Don't apply theme before mounting

    const body = document.body;
    const root = document.documentElement;

    // Start transition
    setIsTransitioning(true);

    // Determine actual color mode
    const isDark = shouldUseDarkMode();
    const newActualMode = isDark ? 'dark' : 'light';
    setActualColorMode(newActualMode);

    // Body theme class for legacy/theme-specific decorations
    body.classList.remove('theme-nothing');
    body.classList.add(`theme-${theme}`);

    // Set color mode as data attribute for CSS
    root.setAttribute('data-theme', newActualMode);

    // Apply accessibility preferences
    root.setAttribute(
      'data-reduced-motion',
      accessibilityPrefs.reducedMotion.toString()
    );
    root.setAttribute(
      'data-high-contrast',
      accessibilityPrefs.highContrast.toString()
    );
    root.setAttribute(
      'data-forced-colors',
      accessibilityPrefs.forcedColors.toString()
    );

    // Add transition class for smooth theme changes
    if (!accessibilityPrefs.reducedMotion) {
      root.classList.add('theme-transitioning');
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsTransitioning(false);
    }

    // Ensure palette validity; if invalid, swap to default for current theme
    const paletteKey = isValidPalette(theme, colorPalette)
      ? colorPalette
      : DEFAULT_PALETTE[theme];
    if (paletteKey !== colorPalette) setColorPalette(paletteKey);

    const palette = COLOR_PALETTES[theme][paletteKey];
    if (palette) {
      root.style.setProperty('--accent', palette.primary);
      root.style.setProperty('--accent-secondary', palette.secondary);
      root.style.setProperty('--accent-tertiary', palette.accent);

      // Update Nothing Phone specific properties
      root.style.setProperty('--nothing-glyph', palette.primary);

      // Convert hex to RGB for rgba usage
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      const rgb = hexToRgb(palette.primary);
      if (rgb) {
        root.style.setProperty(
          '--nothing-glyph-rgb',
          `${rgb.r}, ${rgb.g}, ${rgb.b}`
        );
      }
    } else {
      // Fallback: only primary accent available
      root.style.setProperty('--accent', accentColor);
      root.style.setProperty('--nothing-glyph', accentColor);

      const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(accentColor);
      if (rgb) {
        const r = parseInt(rgb[1], 16);
        const g = parseInt(rgb[2], 16);
        const b = parseInt(rgb[3], 16);
        root.style.setProperty('--nothing-glyph-rgb', `${r}, ${g}, ${b}`);
      }
    }

    // Persist only after mount
    if (typeof window !== 'undefined') {
      localStorage.setItem('echo-theme', theme);
      localStorage.setItem('echo-color-mode', colorMode);
      localStorage.setItem('echo-color-palette', paletteKey);
      localStorage.setItem('echo-accent-color', accentColor);
      localStorage.setItem(
        'echo-accessibility-prefs',
        JSON.stringify(accessibilityPrefs)
      );
      localStorage.setItem(
        'echo-theme-schedule',
        JSON.stringify(themeSchedule)
      );
    }
  }, [
    theme,
    colorMode,
    colorPalette,
    accentColor,
    accessibilityPrefs,
    themeSchedule,
    mounted,
    shouldUseDarkMode,
  ]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (colorMode === 'auto') {
        // Force re-evaluation when system preference changes
        setActualColorMode(getSystemPreference());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode, getSystemPreference]);

  // Listen for storage changes across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'echo-theme' && e.newValue) setTheme(e.newValue as Theme);
      if (e.key === 'echo-color-mode' && e.newValue)
        setColorMode(e.newValue as ColorMode);
      if (e.key === 'echo-color-palette' && e.newValue)
        setColorPalette(e.newValue);
      if (e.key === 'echo-accent-color' && e.newValue)
        setAccentColor(e.newValue);
      if (e.key === 'echo-accessibility-prefs' && e.newValue) {
        try {
          setAccessibilityPrefs(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            'Failed to parse accessibility preferences from storage:',
            error
          );
        }
      }
      if (e.key === 'echo-theme-schedule' && e.newValue) {
        try {
          setThemeSchedule(JSON.parse(e.newValue));
        } catch (error) {
          console.warn('Failed to parse theme schedule from storage:', error);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Schedule-based theme switching
  useEffect(() => {
    if (themeSchedule.type === 'off') return;

    const checkSchedule = () => {
      const newMode = shouldUseDarkMode() ? 'dark' : 'light';
      if (newMode !== actualColorMode) {
        setActualColorMode(newMode);
      }
    };

    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [themeSchedule, shouldUseDarkMode, actualColorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  }, []);

  const previewTheme = useCallback(
    (mode: 'dark' | 'light', duration: number = 3000) => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }

      setPreviewMode(mode);
      const timeout = setTimeout(() => {
        setPreviewMode(null);
        setPreviewTimeout(null);
      }, duration);

      setPreviewTimeout(timeout);
    },
    [previewTimeout]
  );

  const updateAccessibilityPrefs = useCallback(
    (prefs: Partial<AccessibilityPreferences>) => {
      setAccessibilityPrefs((prev) => ({ ...prev, ...prefs }));
    },
    []
  );

  const updateThemeSchedule = useCallback((schedule: ThemeScheduleSettings) => {
    setThemeSchedule(schedule);
  }, []);

  const getColors = useCallback((): PaletteEntry | null => {
    const themePalettes = COLOR_PALETTES[theme];
    const key = isValidPalette(theme, colorPalette)
      ? colorPalette
      : DEFAULT_PALETTE[theme];
    return themePalettes && (themePalettes as ThemePalettes)[key]
      ? (themePalettes as ThemePalettes)[key]
      : null;
  }, [theme, colorPalette]);

  const value = useMemo(
    () => ({
      theme,
      colorMode,
      actualColorMode,
      colorPalette,
      accentColor,
      accessibilityPrefs,
      themeSchedule,
      isTransitioning,
      setTheme,
      setColorMode,
      setColorPalette,
      setAccentColor,
      setAccessibilityPrefs: updateAccessibilityPrefs,
      setThemeSchedule: updateThemeSchedule,
      toggleColorMode,
      previewTheme,
      getColors,
      getSystemPreference,
      getSunriseSunset,
    }),
    [
      theme,
      colorMode,
      actualColorMode,
      colorPalette,
      accentColor,
      accessibilityPrefs,
      themeSchedule,
      isTransitioning,
      toggleColorMode,
      previewTheme,
      getColors,
      getSystemPreference,
      getSunriseSunset,
      updateAccessibilityPrefs,
      updateThemeSchedule,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { COLOR_PALETTES };
