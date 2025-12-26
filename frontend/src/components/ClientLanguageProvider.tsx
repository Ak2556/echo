'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ClientLanguageProviderProps {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({
  children,
}: ClientLanguageProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize i18n on client side
    const initI18n = async () => {
      try {
        await import('@/i18n/index');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsInitialized(true); // Still render children even if i18n fails
      }
    };

    initI18n();
  }, []);

  // Always wrap with LanguageProvider, but it will use fallback context until i18n is ready
  return <LanguageProvider>{children}</LanguageProvider>;
}
