'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from '@/lib/i18n';

type LanguageContextType = {
  language: SupportedLanguageCode;
  setLanguage: (language: SupportedLanguageCode) => Promise<void> | void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t, ready } = useTranslation();

  const setLanguage = async (newLanguage: SupportedLanguageCode) => {
    try {
      if (i18n && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(newLanguage);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('echo-language', newLanguage);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // RTL languages detection
  const currentLanguage = i18n?.language || 'en';
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  // Apply RTL class to document
  useEffect(() => {
    if (typeof document !== 'undefined' && currentLanguage) {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage, isRTL]);

  const value: LanguageContextType = {
    language: currentLanguage as SupportedLanguageCode,
    setLanguage,
    t: ready ? t : (key: string) => key,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Provide a fallback context instead of throwing an error
    console.warn('useLanguage called outside of LanguageProvider, using fallback');
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string) => key,
      isRTL: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}

// Export for backward compatibility
export { SUPPORTED_LANGUAGES };
export type SupportedLanguage = SupportedLanguageCode;