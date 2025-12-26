/**
 * PWA utilities
 */

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function canInstallPWA(): boolean {
  return typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function usePWA() {
  return {
    isPWAInstalled: isPWAInstalled(),
    canInstall: canInstallPWA(),
    requestNotificationPermission,
    showInstallPrompt,
    getInstallationState,
    isInstallationSupported,
    getIOSInstallInstructions,
    updateServiceWorker,
    skipWaiting,
  };
}

export async function cacheImportantUrls(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  const cache = await caches.open('pwa-cache');
  await cache.addAll(['/']);
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('storage' in navigator))
    return false;
  return await navigator.storage.persist();
}

export async function getStorageUsage(): Promise<{
  used: number;
  quota: number;
  usage: number;
}> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return { used: 0, quota: 0, usage: 0 };
  }
  const estimate = await navigator.storage.estimate();
  const used = estimate.usage || 0;
  const quota = estimate.quota || 0;
  return {
    used,
    quota,
    usage: used,
  };
}

export async function showInstallPrompt(): Promise<boolean> {
  console.log('Install prompt requested');
  return true;
}

export function getInstallationState(): {
  isInstalled: boolean;
  platform: string;
} {
  const isInstalled = isPWAInstalled();
  const platform =
    typeof navigator !== 'undefined'
      ? /iPhone|iPad|iPod/.test(navigator.userAgent)
        ? 'ios'
        : /Android/.test(navigator.userAgent)
          ? 'android'
          : 'desktop'
      : 'unknown';

  return { isInstalled, platform };
}

export function isInstallationSupported(): boolean {
  return canInstallPWA();
}

export function getIOSInstallInstructions(): string[] {
  return [
    'Tap the Share button',
    'Scroll down and tap "Add to Home Screen"',
    'Tap "Add" to confirm',
  ];
}

export function updateServiceWorker(): void {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) reg.update();
    });
  }
}

export function skipWaiting(): void {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }
}

export const pwaManager = {
  isPWAInstalled,
  canInstallPWA,
  requestNotificationPermission,
  usePWA,
  cacheImportantUrls,
  requestPersistentStorage,
  getStorageUsage,
  showInstallPrompt,
  getInstallationState,
  isInstallationSupported,
  getIOSInstallInstructions,
  updateServiceWorker,
  skipWaiting,
};
