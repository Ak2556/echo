'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ClientLanguageProviderProps {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: ClientLanguageProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Initialize i18n on client side
    const initI18n = async () => {
      try {
        await import('@/i18n/index');
        setIsClient(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsClient(true); // Still render children even if i18n fails
      }
    };

    initI18n();
  }, []);

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return <LanguageProvider>{children}</LanguageProvider>;
}