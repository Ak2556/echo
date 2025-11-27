'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ClientLanguageProviderProps {
  children: React.ReactNode;
}

export default function ClientLanguageProvider({ children }: ClientLanguageProviderProps) {
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

  // Render children immediately on client, but provide fallback context until i18n is ready
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  if (!isInitialized) {
    // Render children with fallback context while i18n initializes
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return <LanguageProvider>{children}</LanguageProvider>;
}