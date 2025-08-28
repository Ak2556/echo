/**
 * Theme Management Utilities
 * Enhanced utilities for theme management, accessibility, and user preferences
 */

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colorMode: 'light' | 'dark' | 'auto';
  palette: string;
  accentColor: string;
  preview: {
    background: string;
    foreground: string;
    accent: string;
  };
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  forcedColors: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  focusIndicators: 'subtle' | 'prominent';
}

export interface ThemeScheduleConfig {
  type: 'off' | 'sunset' | 'time' | 'location';
  lightTime?: string;
  darkTime?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  enabled: boolean;
}

/**
 * Predefined theme presets
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'auto',
    name: 'Auto',
    description: 'Follows your system preference',
    colorMode: 'auto',
    palette: 'mono',
    accentColor: '#007aff',
    preview: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      foreground: '#1e293b',
      accent: '#007aff'
    }
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    colorMode: 'light',
    palette: 'mono',
    accentColor: '#007aff',
    preview: {
      background: '#ffffff',
      foreground: '#1e293b',
      accent: '#007aff'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes in low light',
    colorMode: 'dark',
    palette: 'dark',
    accentColor: '#60a5fa',
    preview: {
      background: '#0f172a',
      foreground: '#f8fafc',
      accent: '#60a5fa'
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Calming blue tones',
    colorMode: 'light',
    palette: 'blue',
    accentColor: '#3b82f6',
    preview: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      foreground: '#1e3a8a',
      accent: '#3b82f6'
    }
  },
  {
    id: 'green',
    name: 'Nature Green',
    description: 'Fresh and natural',
    colorMode: 'light',
    palette: 'green',
    accentColor: '#10b981',
    preview: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      foreground: '#064e3b',
      accent: '#10b981'
    }
  },
  {
    id: 'red',
    name: 'Nothing Red',
    description: 'Bold Nothing Phone style',
    colorMode: 'light',
    palette: 'red',
    accentColor: '#ef4444',
    preview: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
      foreground: '#7f1d1d',
      accent: '#ef4444'
    }
  }
];

/**
 * Accessibility presets
 */
export const ACCESSIBILITY_PRESETS: Record<string, AccessibilitySettings> = {
  default: {
    reducedMotion: false,
    highContrast: false,
    forcedColors: false,
    fontSize: 'medium',
    focusIndicators: 'subtle'
  },
  accessible: {
    reducedMotion: true,
    highContrast: true,
    forcedColors: false,
    fontSize: 'large',
    focusIndicators: 'prominent'
  },
  lowVision: {
    reducedMotion: true,
    highContrast: true,
    forcedColors: true,
    fontSize: 'xl',
    focusIndicators: 'prominent'
  }
};

/**
 * Detects user's system preferences
 */
export function detectSystemPreferences(): {
  colorScheme: 'light' | 'dark';
  reducedMotion: boolean;
  highContrast: boolean;
  forcedColors: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      colorScheme: 'light',
      reducedMotion: false,
      highContrast: false,
      forcedColors: false
    };
  }

  return {
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    forcedColors: window.matchMedia('(forced-colors: active)').matches
  };
}

/**
 * Gets sunrise and sunset times for a location
 */
export async function getSunriseSunset(
  lat: number,
  lng: number,
  date?: Date
): Promise<{ sunrise: Date; sunset: Date } | null> {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`
    );
    
    if (!response.ok) throw new Error('Failed to fetch sunrise/sunset data');
    
    const data = await response.json();
    
    if (data.status !== 'OK') throw new Error('Invalid sunrise/sunset response');
    
    return {
      sunrise: new Date(data.results.sunrise),
      sunset: new Date(data.results.sunset)
    };
  } catch (error) {
    console.warn('Failed to fetch sunrise/sunset times:', error);
    return null;
  }
}

/**
 * Gets user's current location
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number; name?: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        try {
          // Try to get location name using reverse geocoding
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const name = data.city || data.locality || data.countryName || 'Unknown Location';
            resolve({ lat, lng, name });
          } else {
            resolve({ lat, lng });
          }
        } catch (error) {
          resolve({ lat, lng });
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Calculates if it should be dark mode based on schedule
 */
export function shouldUseDarkModeBySchedule(
  schedule: ThemeScheduleConfig,
  currentTime: Date = new Date()
): boolean {
  if (!schedule.enabled || schedule.type === 'off') {
    return false;
  }

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  if (schedule.type === 'time' && schedule.lightTime && schedule.darkTime) {
    const [lightHour, lightMin] = schedule.lightTime.split(':').map(Number);
    const [darkHour, darkMin] = schedule.darkTime.split(':').map(Number);
    
    const lightMinutes = lightHour * 60 + lightMin;
    const darkMinutes = darkHour * 60 + darkMin;

    if (lightMinutes > darkMinutes) {
      // Normal day (light time is after dark time)
      // Dark period: from darkTime to lightTime
      return currentMinutes >= darkMinutes && currentMinutes < lightMinutes;
    } else {
      // Overnight (light time is before dark time)
      // Light period: from lightTime to darkTime (crossing midnight)
      // Dark period: from darkTime to lightTime (next day)
      return currentMinutes >= darkMinutes || currentMinutes < lightMinutes;
    }
  }

  // For sunset/location-based scheduling, this would need to be implemented
  // with actual sunrise/sunset calculation
  return false;
}

/**
 * Validates theme configuration
 */
export function validateThemeConfig(config: any): boolean {
  try {
    if (!config || typeof config !== 'object') return false;
    
    // Check required properties
    if (!['light', 'dark', 'auto'].includes(config.colorMode)) return false;
    if (typeof config.accentColor !== 'string') return false;
    if (typeof config.palette !== 'string') return false;
    
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(config.accentColor)) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Exports theme configuration
 */
export function exportThemeConfig(theme: any): string {
  const config = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    theme: {
      colorMode: theme.colorMode,
      palette: theme.colorPalette,
      accentColor: theme.accentColor,
      accessibilityPrefs: theme.accessibilityPrefs,
      themeSchedule: theme.themeSchedule
    }
  };
  
  return JSON.stringify(config, null, 2);
}

/**
 * Imports theme configuration
 */
export function importThemeConfig(configString: string): any | null {
  try {
    const config = JSON.parse(configString);
    
    if (!config.theme || !validateThemeConfig(config.theme)) {
      throw new Error('Invalid theme configuration');
    }
    
    return config.theme;
  } catch (error) {
    console.error('Failed to import theme configuration:', error);
    return null;
  }
}

/**
 * Generates CSS custom properties for a theme
 */
export function generateThemeCSS(theme: any): string {
  const { colorMode, accentColor, accessibilityPrefs } = theme;
  
  let css = ':root {\n';
  css += `  --accent: ${accentColor};\n`;
  css += `  --accent-rgb: ${hexToRgb(accentColor)};\n`;
  
  if (accessibilityPrefs.highContrast) {
    css += '  --border-width: 2px;\n';
    css += '  --focus-ring-width: 3px;\n';
  }
  
  if (accessibilityPrefs.reducedMotion) {
    css += '  --transition-duration: 0ms;\n';
    css += '  --animation-duration: 0ms;\n';
  }
  
  css += '}\n';
  
  return css;
}

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Calculates color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex).split(', ').map(Number);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Checks if color combination meets WCAG accessibility standards
 */
export function meetsAccessibilityStandards(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}