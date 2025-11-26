'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function AnalyticsInit() {
  useEffect(() => {
    // Initialize analytics on client side only
    if (typeof window !== 'undefined') {
      // Set build version
      if (process.env.NEXT_PUBLIC_BUILD_VERSION) {
        analytics.setUserProperties({
          buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
        });
      }

      // Track initial application load
      analytics.track('app_initialized', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof Storage !== 'undefined',
        webGL: !!window.WebGLRenderingContext,
        indexedDB: !!window.indexedDB,
        serviceWorker: 'serviceWorker' in navigator,
        pushNotifications: 'PushManager' in window,
        geolocation: 'geolocation' in navigator,
        touchScreen: 'ontouchstart' in window,
      });

      // Track performance on load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;

          if (navigation) {
            analytics.track('page_load_performance', {
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              dnsLookup:
                navigation.domainLookupEnd - navigation.domainLookupStart,
              tcpConnect: navigation.connectEnd - navigation.connectStart,
              request: navigation.responseStart - navigation.requestStart,
              response: navigation.responseEnd - navigation.responseStart,
              domProcessing:
                navigation.domComplete - navigation.domContentLoadedEventStart,
              totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
            });
          }

          // Get paint metrics
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach((entry) => {
            analytics.track('paint_metric', {
              metric: entry.name,
              time: entry.startTime,
            });
          });
        }, 0);
      });
    }
  }, []);

  return null;
}
