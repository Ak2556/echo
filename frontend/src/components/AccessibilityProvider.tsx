/**
 * Accessibility Provider Component
 * Provides global accessibility context and enhancements
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  AccessibilityReport,
  AccessibilityEnhancer,
} from '@/utils/accessibility';
import {
  useAccessibility,
  useScreenReader,
  useReducedMotion,
  useHighContrast,
} from '@/hooks/useAccessibility';

interface AccessibilityContextType {
  report: AccessibilityReport | null;
  isAnalyzing: boolean;
  analyzeAccessibility: () => Promise<void>;
  enhanceAccessibility: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
}

interface AccessibilitySettings {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableScreenReaderOptimizations: boolean;
  enableKeyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  contrastLevel: 'normal' | 'high' | 'maximum';
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      'useAccessibilityContext must be used within an AccessibilityProvider'
    );
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const { report, isAnalyzing, analyzeAccessibility, enhanceAccessibility } =
    useAccessibility();
  const { announce } = useScreenReader();
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') {
      return {
        enableHighContrast: false,
        enableReducedMotion: false,
        enableLargeText: false,
        enableScreenReaderOptimizations: true,
        enableKeyboardNavigation: true,
        fontSize: 'medium',
        contrastLevel: 'normal',
      };
    }

    const saved = localStorage.getItem('echo_accessibility_settings');
    return saved
      ? JSON.parse(saved)
      : {
          enableHighContrast: false,
          enableReducedMotion: false,
          enableLargeText: false,
          enableScreenReaderOptimizations: true,
          enableKeyboardNavigation: true,
          fontSize: 'medium',
          contrastLevel: 'normal',
        };
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(
        'echo_accessibility_settings',
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  // Apply accessibility settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // High contrast mode
    if (settings.enableHighContrast || prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.enableReducedMotion || prefersReducedMotion) {
      root.classList.add('reduced-motion');
      root.style.setProperty('--animation-duration', '0.001ms');
      root.style.setProperty('--transition-duration', '0.001ms');
    } else {
      root.classList.remove('reduced-motion');
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Large text
    if (settings.enableLargeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // Contrast level
    root.setAttribute('data-contrast', settings.contrastLevel);

    // Screen reader optimizations
    if (settings.enableScreenReaderOptimizations) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }

    // Keyboard navigation
    if (settings.enableKeyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [settings, prefersReducedMotion, prefersHighContrast]);

  // Auto-analyze accessibility on mount
  useEffect(() => {
    analyzeAccessibility();
  }, [analyzeAccessibility]);

  const contextValue: AccessibilityContextType = {
    report,
    isAnalyzing,
    analyzeAccessibility,
    enhanceAccessibility,
    announce,
    prefersReducedMotion,
    prefersHighContrast,
    settings,
    updateSettings,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <AccessibilityEnhancements />
    </AccessibilityContext.Provider>
  );
}

/**
 * Component that applies accessibility enhancements
 */
function AccessibilityEnhancements() {
  const { settings } = useAccessibilityContext();

  useEffect(() => {
    // Add skip link styles
    const skipLinkStyles = document.createElement('style');
    skipLinkStyles.textContent = `
      .skip-link {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        z-index: 999999;
        background: var(--accent);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      }

      .skip-link:focus {
        position: fixed;
        top: 10px;
        left: 10px;
        width: auto;
        height: auto;
        overflow: visible;
      }

      /* High contrast mode styles */
      .high-contrast {
        --bg: #000000;
        --fg: #ffffff;
        --accent: #ffff00;
        --border: #ffffff;
        --card: #1a1a1a;
        --muted: #cccccc;
      }

      .high-contrast img {
        filter: contrast(150%) brightness(120%);
      }

      .high-contrast .glass {
        background: var(--card);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      /* Large text mode */
      .large-text {
        font-size: 120% !important;
      }

      .large-text h1 { font-size: 2.5rem !important; }
      .large-text h2 { font-size: 2rem !important; }
      .large-text h3 { font-size: 1.75rem !important; }
      .large-text h4 { font-size: 1.5rem !important; }
      .large-text h5 { font-size: 1.25rem !important; }
      .large-text h6 { font-size: 1.125rem !important; }

      /* Font size variations */
      [data-font-size="small"] { font-size: 14px; }
      [data-font-size="medium"] { font-size: 16px; }
      [data-font-size="large"] { font-size: 18px; }
      [data-font-size="x-large"] { font-size: 20px; }

      /* Contrast level variations */
      [data-contrast="high"] {
        filter: contrast(150%);
      }

      [data-contrast="maximum"] {
        filter: contrast(200%) brightness(120%);
      }

      /* Reduced motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }

      /* Screen reader optimizations */
      .screen-reader-optimized .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }

      /* Keyboard navigation enhancements */
      .keyboard-navigation :focus-visible {
        outline: 3px solid var(--accent) !important;
        outline-offset: 2px !important;
        border-radius: 4px;
      }

      .keyboard-navigation button:focus-visible,
      .keyboard-navigation [role="button"]:focus-visible {
        outline: 3px solid var(--accent) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px rgba(var(--nothing-glyph-rgb), 0.2) !important;
      }

      .keyboard-navigation a:focus-visible {
        outline: 3px solid var(--accent) !important;
        outline-offset: 2px !important;
        text-decoration: underline !important;
      }

      /* Ensure interactive elements are large enough */
      .keyboard-navigation button,
      .keyboard-navigation [role="button"],
      .keyboard-navigation a,
      .keyboard-navigation input,
      .keyboard-navigation select,
      .keyboard-navigation textarea {
        min-height: 44px;
        min-width: 44px;
      }

      /* Live region styles */
      #status-messages,
      #alert-messages {
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      /* Error state styles for better visibility */
      [aria-invalid="true"] {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
      }

      /* Required field indicators */
      .field-required::after {
        content: " *";
        color: #dc2626;
        font-weight: bold;
      }

      /* Improve button and link contrast */
      .high-contrast button,
      .high-contrast [role="button"] {
        border: 2px solid var(--fg) !important;
        background: var(--bg) !important;
        color: var(--fg) !important;
      }

      .high-contrast button:hover,
      .high-contrast [role="button"]:hover {
        background: var(--fg) !important;
        color: var(--bg) !important;
      }

      .high-contrast a {
        color: var(--accent) !important;
        text-decoration: underline !important;
      }

      /* Improve form contrast */
      .high-contrast input,
      .high-contrast textarea,
      .high-contrast select {
        border: 2px solid var(--fg) !important;
        background: var(--bg) !important;
        color: var(--fg) !important;
      }
    `;

    document.head.appendChild(skipLinkStyles);

    return () => {
      document.head.removeChild(skipLinkStyles);
    };
  }, []);

  return null;
}

export default AccessibilityProvider;
