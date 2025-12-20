'use client';

import { useEffect } from 'react';

export default function I18nInit() {
  useEffect(() => {
    // Initialize i18n on client side only
    const initI18n = async () => {
      try {
        // Dynamic import to ensure client-side only
        await import('@/i18n/index');
        console.log('i18n system initialized on client');
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      }
    };
    
    initI18n();
  }, []);

  return null;
}