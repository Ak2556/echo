'use client';

import { useEffect } from 'react';
import { pwaManager } from '@/lib/pwa';

export default function PWAInit() {
  useEffect(() => {
    // Initialize PWA manager (already happens automatically in constructor)
    // Cache important pages for offline access
    const importantUrls = [
      '/',
      '/ai',
      '/apps',
      '/dsa',
      '/settings',
      '/offline',
    ];

    pwaManager.cacheImportantUrls(importantUrls);

    // Request persistent storage
    pwaManager.requestPersistentStorage().then((granted) => {
      if (granted) {

      }
    });

    // Log storage usage periodically
    const logStorageUsage = async () => {
      const usage = await pwaManager.getStorageUsage();
      if (usage) {
        const usedMB = Math.round(usage.used / 1024 / 1024);
        const quotaMB = Math.round(usage.quota / 1024 / 1024);

      }
    };

    logStorageUsage();

    // Set up periodic storage check (every 5 minutes)
    const storageInterval = setInterval(logStorageUsage, 5 * 60 * 1000);

    return () => {
      clearInterval(storageInterval);
    };
  }, []);

  return null;
}