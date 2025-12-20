'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { actualColorMode, accessibilityPrefs, isTransitioning } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Apply theme to HTML element
    html.setAttribute('data-theme', actualColorMode);

    // Apply accessibility preferences
    html.setAttribute(
      'data-reduced-motion',
      accessibilityPrefs.reducedMotion.toString()
    );
    html.setAttribute(
      'data-high-contrast',
      accessibilityPrefs.highContrast.toString()
    );
    // Check for OS-level forced colors mode
    const forcedColors = window.matchMedia('(forced-colors: active)').matches;
    html.setAttribute(
      'data-forced-colors',
      forcedColors.toString()
    );

    // Apply transition class for smooth theme changes
    if (!accessibilityPrefs.reducedMotion && isTransitioning) {
      html.classList.add('theme-transitioning');
      const timeout = setTimeout(() => {
        html.classList.remove('theme-transitioning');
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      html.classList.remove('theme-transitioning');
    }

    // Ensure body has proper background and text color
    body.style.backgroundColor = 'var(--bg-primary)';
    body.style.color = 'var(--fg-primary)';

    // Apply theme class to body for legacy support
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add('theme-nothing');
  }, [actualColorMode, accessibilityPrefs, isTransitioning]);

  return <>{children}</>;
}
