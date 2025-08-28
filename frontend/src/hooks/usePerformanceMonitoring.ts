import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface PerformanceConfig {
  trackPageLoad?: boolean;
  trackUserInteractions?: boolean;
  trackResourceLoading?: boolean;
  trackMemoryUsage?: boolean;
  reportingInterval?: number; // milliseconds
}

interface ComponentPerformanceData {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryUsage?: number;
}

export function usePerformanceMonitoring(
  componentName: string,
  config: PerformanceConfig = {}
) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastReportTime = useRef(Date.now());

  const {
    trackPageLoad = true,
    trackUserInteractions = true,
    trackResourceLoading = true,
    trackMemoryUsage = true,
    reportingInterval = 60000, // 1 minute
  } = config;

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      renderCount.current += 1;
      renderTimes.current.push(renderTime);

      // Keep only last 10 render times to calculate average
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }

      // Report performance data periodically
      const now = Date.now();
      if (now - lastReportTime.current >= reportingInterval) {
        reportComponentPerformance();
        lastReportTime.current = now;
      }
    };
  });

  const reportComponentPerformance = () => {
    const averageRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      : 0;

    const performanceData: ComponentPerformanceData = {
      componentName,
      renderCount: renderCount.current,
      averageRenderTime,
      lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    };

    // Add memory usage if available and enabled
    if (trackMemoryUsage && performance.memory) {
      const memoryInfo = performance.memory;
      performanceData.memoryUsage = memoryInfo.usedJSHeapSize;
    }

    analytics.track('component_performance', {
      ...performanceData,
      timestamp: Date.now(),
    });
  };

  const trackInteraction = (interactionType: string, details?: any) => {
    if (!trackUserInteractions) return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      analytics.track('user_interaction_performance', {
        componentName,
        interactionType,
        duration,
        details,
        timestamp: Date.now(),
      });
    };
  };

  const trackAsyncOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;

      analytics.track('async_operation_performance', {
        componentName,
        operationName,
        duration,
        success: true,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      analytics.track('async_operation_performance', {
        componentName,
        operationName,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });

      throw error;
    }
  };

  const measureFunction = <T extends any[], R>(
    functionName: string,
    fn: (...args: T) => R
  ) => {
    return (...args: T): R => {
      const startTime = performance.now();

      try {
        const result = fn(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        analytics.track('function_performance', {
          componentName,
          functionName,
          duration,
          success: true,
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        analytics.track('function_performance', {
          componentName,
          functionName,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        });

        throw error;
      }
    };
  };

  return {
    trackInteraction,
    trackAsyncOperation,
    measureFunction,
    reportComponentPerformance,
    getPerformanceData: () => ({
      componentName,
      renderCount: renderCount.current,
      averageRenderTime: renderTimes.current.length > 0
        ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
        : 0,
      lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    }),
  };
}

// Custom hook for page-level performance monitoring
export function usePagePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();

    // Track page load performance
    const trackPageLoad = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      analytics.track('page_performance', {
        pageName,
        loadTime,
        timestamp: Date.now(),
      });
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const sessionTime = performance.now() - startTime;
        analytics.track('page_session', {
          pageName,
          sessionTime,
          timestamp: Date.now(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('load', trackPageLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Final session tracking
      const sessionTime = performance.now() - startTime;
      analytics.track('page_session_end', {
        pageName,
        sessionTime,
        timestamp: Date.now(),
      });
    };
  }, [pageName]);
}

// Hook for monitoring API call performance
export function useAPIPerformanceMonitoring() {
  const trackAPICall = async <T>(
    endpoint: string,
    request: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await request();
      const endTime = performance.now();
      const duration = endTime - startTime;

      analytics.track('api_performance', {
        endpoint,
        duration,
        success: true,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      analytics.track('api_performance', {
        endpoint,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });

      throw error;
    }
  };

  return { trackAPICall };
}