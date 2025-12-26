/**
 * Analytics utilities
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  console.log('[Analytics]', event);
}

export function trackPageView(path: string): void {
  trackEvent({
    name: 'page_view',
    properties: { path },
    timestamp: Date.now(),
  });
}

export function setUserProperties(properties: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  console.log('[Analytics] Set user properties:', properties);
}

export function track(name: string, properties?: Record<string, any>): void {
  trackEvent({ name, properties, timestamp: Date.now() });
}

export const analytics = {
  trackEvent,
  trackPageView,
  setUserProperties,
  track,
};

export function getAnalytics() {
  return analytics;
}
