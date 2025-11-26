'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from '@/lib/utils';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  fps: number;
  loadTime: number;
  interactionTime: number;
}

interface UsePerformanceOptions {
  trackFPS?: boolean;
  trackMemory?: boolean;
  trackInteractions?: boolean;
  sampleRate?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    trackFPS = true,
    trackMemory = true,
    trackInteractions = true,
    sampleRate = 1000, // ms
    onMetricsUpdate,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    fps: 0,
    loadTime: 0,
    interactionTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  const animationFrameId = useRef<number>(0);

  // Measure render time
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics((prev) => ({ ...prev, renderTime }));
    }
  }, []);

  // Measure FPS
  const measureFPS = useCallback(() => {
    if (!trackFPS) return;

    const now = performance.now();
    frameCount.current++;

    if (lastFrameTime.current === 0) {
      lastFrameTime.current = now;
    }

    const elapsed = now - lastFrameTime.current;
    if (elapsed >= sampleRate) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      setMetrics((prev) => ({ ...prev, fps }));
      frameCount.current = 0;
      lastFrameTime.current = now;
    }

    animationFrameId.current = requestAnimationFrame(measureFPS);
  }, [trackFPS, sampleRate]);

  // Measure memory usage
  const measureMemory = useCallback(() => {
    if (!trackMemory || !performance.memory) return;

    const memory = performance.memory;
    const memoryUsage = {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round(
        (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      ),
    };

    setMetrics((prev) => ({ ...prev, memoryUsage }));
  }, [trackMemory]);

  // Measure interaction time
  const startInteraction = useCallback(() => {
    if (!trackInteractions) return;
    interactionStartTime.current = performance.now();
  }, [trackInteractions]);

  const endInteraction = useCallback(() => {
    if (!trackInteractions || interactionStartTime.current === 0) return;

    const interactionTime = performance.now() - interactionStartTime.current;
    setMetrics((prev) => ({ ...prev, interactionTime }));
    interactionStartTime.current = 0;
  }, [trackInteractions]);

  // Debounced metrics update
  const debouncedMetricsUpdate = useCallback(
    debounce((newMetrics: PerformanceMetrics) => {
      onMetricsUpdate?.(newMetrics);
    }, 500),
    [onMetricsUpdate]
  );

  // Setup performance monitoring
  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.timing
      ? performance.timing.loadEventEnd - performance.timing.navigationStart
      : 0;

    setMetrics((prev) => ({ ...prev, loadTime }));

    // Start FPS monitoring
    if (trackFPS) {
      measureFPS();
    }

    // Setup memory monitoring
    let memoryInterval: NodeJS.Timeout;
    if (trackMemory) {
      measureMemory();
      memoryInterval = setInterval(measureMemory, sampleRate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    };
  }, [trackFPS, trackMemory, sampleRate, measureFPS, measureMemory]);

  // Notify about metrics updates
  useEffect(() => {
    debouncedMetricsUpdate(metrics);
  }, [metrics, debouncedMetricsUpdate]);

  return {
    metrics,
    startRender,
    endRender,
    startInteraction,
    endInteraction,
  };
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName?: string) {
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);
  const [averageRenderTime, setAverageRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    renderCount.current++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      totalRenderTime.current += renderTime;

      const average = totalRenderTime.current / renderCount.current;
      setAverageRenderTime(average);

      if (componentName && renderTime > 16) {
        // Warn if render takes longer than 16ms
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime,
    totalRenderTime: totalRenderTime.current,
  };
}

// Hook for monitoring network performance
export function useNetworkPerformance() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    if ('connection' in navigator && navigator.connection) {
      const connection = navigator.connection;

      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// Hook for monitoring bundle size and loading performance
export function useBundlePerformance() {
  const [bundleMetrics, setBundleMetrics] = useState<{
    totalSize: number;
    loadedSize: number;
    loadingProgress: number;
    resourceCount: number;
  }>({
    totalSize: 0,
    loadedSize: 0,
    loadingProgress: 0,
    resourceCount: 0,
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalSize = 0;
      let loadedSize = 0;
      let resourceCount = 0;

      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.transferSize) {
            totalSize += resourceEntry.transferSize;
            loadedSize += resourceEntry.transferSize;
            resourceCount++;
          }
        }
      });

      if (totalSize > 0) {
        setBundleMetrics({
          totalSize,
          loadedSize,
          loadingProgress: (loadedSize / totalSize) * 100,
          resourceCount,
        });
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return bundleMetrics;
}

// Utility function to format performance metrics
export function formatPerformanceMetrics(metrics: PerformanceMetrics) {
  return {
    renderTime: `${metrics.renderTime.toFixed(2)}ms`,
    fps: `${metrics.fps} FPS`,
    loadTime: `${(metrics.loadTime / 1000).toFixed(2)}s`,
    interactionTime: `${metrics.interactionTime.toFixed(2)}ms`,
    memoryUsage: metrics.memoryUsage
      ? `${metrics.memoryUsage.used}MB / ${metrics.memoryUsage.total}MB (${metrics.memoryUsage.percentage}%)`
      : 'N/A',
  };
}

// Performance monitoring component
export function PerformanceMonitor({
  children,
  onMetricsUpdate,
}: {
  children: React.ReactNode;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}) {
  const { startRender, endRender } = usePerformance({ onMetricsUpdate });

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return <>{children}</>;
}
