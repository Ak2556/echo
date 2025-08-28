/**
 * @fileoverview Responsive Design Hook
 * @description Custom hook for detecting viewport size and responsive breakpoints
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  breakpoint: 'sm' | 'md' | 'lg' | 'xl';
  isPortrait?: boolean;
  isLandscape?: boolean;
  isTouchDevice?: boolean;
  prefersReducedMotion?: boolean;
  prefersHighContrast?: boolean;
  prefersDarkMode?: boolean;
}

interface BreakpointConfig {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  xl?: string;
}

/**
 * Hook to detect current viewport size and breakpoints
 */
export function useResponsive(customBreakpoints?: BreakpointConfig): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR-safe initial state
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        isPortrait: false,
        isLandscape: true,
        isTouchDevice: false,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersDarkMode: false,
      };
    }

    // Calculate initial state based on current window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024 && width < 1280;
    const isLargeDesktop = width >= 1280;
    const breakpoint: ResponsiveState['breakpoint'] =
      isMobile ? 'sm' :
      isTablet ? 'md' :
      isLargeDesktop ? 'xl' : 'lg';

    return {
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      width,
      height,
      breakpoint,
      isPortrait: height > width,
      isLandscape: width >= height,
      isTouchDevice: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersDarkMode: false,
    };
  });

  const mediaQueries = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return null;
    }

    // Use custom breakpoints if provided, otherwise use defaults
    const breakpoints = customBreakpoints || {
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1023px)',
      desktop: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
    };

    try {
      return {
        mobile: window.matchMedia(breakpoints.mobile || '(max-width: 767px)'),
        tablet: window.matchMedia(breakpoints.tablet || '(min-width: 768px) and (max-width: 1023px)'),
        desktop: window.matchMedia(breakpoints.desktop || '(min-width: 1024px)'),
        xl: window.matchMedia(breakpoints.xl || '(min-width: 1280px)'),
        portrait: window.matchMedia('(orientation: portrait)'),
        landscape: window.matchMedia('(orientation: landscape)'),
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
        highContrast: window.matchMedia('(prefers-contrast: high)'),
        darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      };
    } catch (error) {
      // Handle invalid media query syntax
      console.warn('Invalid media query syntax:', error);
      return null;
    }
  }, [customBreakpoints]);

  // PERFORMANCE FIX: Memoize updateState with useCallback to prevent recreating on every render
  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Use window dimensions as fallback if matchMedia is not available
    let isMobile, isTablet, isDesktop, isLargeDesktop;

    if (mediaQueries) {
      isMobile = mediaQueries.mobile.matches;
      isTablet = mediaQueries.tablet.matches;
      isDesktop = mediaQueries.desktop.matches && !mediaQueries.xl.matches;
      isLargeDesktop = mediaQueries.xl.matches;
    } else {
      // Fallback to window dimensions
      isMobile = width < 768;
      isTablet = width >= 768 && width < 1024;
      isDesktop = width >= 1024 && width < 1280;
      isLargeDesktop = width >= 1280;
    }

    const breakpoint: ResponsiveState['breakpoint'] =
      isMobile ? 'sm' :
      isTablet ? 'md' :
      isLargeDesktop ? 'xl' : 'lg';

    setState({
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      width,
      height,
      breakpoint,
      isPortrait: mediaQueries ? mediaQueries.portrait.matches : height > width,
      isLandscape: mediaQueries ? mediaQueries.landscape.matches : width >= height,
      isTouchDevice: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
      prefersReducedMotion: mediaQueries ? mediaQueries.reducedMotion.matches : false,
      prefersHighContrast: mediaQueries ? mediaQueries.highContrast.matches : false,
      prefersDarkMode: mediaQueries ? mediaQueries.darkMode.matches : false,
    });
  }, [mediaQueries]);

  useEffect(() => {
    // PERFORMANCE FIX: Debounce resize events with requestAnimationFrame
    let rafId: number | null = null;
    const debouncedUpdateState = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updateState();
        rafId = null;
      });
    }

    // Initial call
    updateState();

    // Add event listeners
    if (mediaQueries) {
      const queries = Object.values(mediaQueries);
      queries.forEach(query => {
        if (query && query.addEventListener) {
          // Use updateState directly for media query changes (they're already specific)
          query.addEventListener('change', updateState);
        }
      });
    }

    // PERFORMANCE FIX: Use debounced version for resize events (fires frequently)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedUpdateState);
    }

    // Cleanup
    return () => {
      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      if (mediaQueries) {
        const queries = Object.values(mediaQueries);
        queries.forEach(query => {
          if (query && query.removeEventListener) {
            query.removeEventListener('change', updateState);
          }
        });
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedUpdateState);
      }
    };
  }, [mediaQueries, updateState]);

  return state;
}

/**
 * Hook to check if viewport matches specific breakpoint
 */
export function useBreakpoint(breakpoint: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    function updateMatches() {
      const width = window.innerWidth;
      
      // Handle both media query strings and breakpoint names
      if (breakpoint.includes('(')) {
        // It's a media query string
        if (window.matchMedia) {
          const mediaQuery = window.matchMedia(breakpoint);
          setMatches(mediaQuery.matches);
        }
      } else {
        // It's a breakpoint name, use width-based logic
        let result = false;
        switch (breakpoint) {
          case 'sm':
            result = width < 768;
            break;
          case 'md':
            result = width >= 768 && width < 1024;
            break;
          case 'lg':
            result = width >= 1024 && width < 1280;
            break;
          case 'xl':
            result = width >= 1280;
            break;
          default:
            // For other strings, try as media query if matchMedia is available
            if (window.matchMedia) {
              const mediaQuery = window.matchMedia(breakpoint);
              result = mediaQuery.matches;
            }
        }
        setMatches(result);
      }
    }

    updateMatches();
    
    // Set up listeners
    if (breakpoint.includes('(') && window.matchMedia) {
      const mediaQuery = window.matchMedia(breakpoint);
      mediaQuery.addEventListener('change', updateMatches);
      window.addEventListener('resize', updateMatches);
      return () => {
        mediaQuery.removeEventListener('change', updateMatches);
        window.removeEventListener('resize', updateMatches);
      };
    } else {
      window.addEventListener('resize', updateMatches);
      return () => window.removeEventListener('resize', updateMatches);
    }
  }, [breakpoint]);

  return matches;
}

/**
 * Hook for window dimensions
 * PERFORMANCE FIX: Debounced with requestAnimationFrame
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let rafId: number | null = null;

    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        rafId = null;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

/**
 * Hook for orientation detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    function handleOrientationChange() {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    }

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
}

export default useResponsive;
