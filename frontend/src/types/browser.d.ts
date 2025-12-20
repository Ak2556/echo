/**
 * Extended browser API type definitions
 * These types extend the standard TypeScript DOM types with non-standard browser APIs
 */

// Performance Memory API (Chrome/Edge only)
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Performance {
  memory?: PerformanceMemory;
}

// Network Information API
interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  rtt: number;
  saveData: boolean;
}

interface Navigator {
  connection?: NetworkInformation;
}

// WebKit Audio Context (Safari)
interface Window {
  webkitAudioContext?: typeof AudioContext;
}

// Google Analytics gtag
interface Window {
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}
