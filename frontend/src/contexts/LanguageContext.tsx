'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '@/lib/i18n';

type LanguageContextType = {
  language: SupportedLanguageCode;
  setLanguage: (language: SupportedLanguageCode) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();

  const setLanguage = (newLanguage: SupportedLanguageCode) => {

    i18n.changeLanguage(newLanguage);
    localStorage.setItem('echo-language', newLanguage);
  };

  // RTL languages detection
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  // Apply RTL class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language, isRTL]);

  const value: LanguageContextType = {
    language: i18n.language as SupportedLanguageCode,
    setLanguage,
    t,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export for backward compatibility
export { SUPPORTED_LANGUAGES };
export type SupportedLanguage = SupportedLanguageCode;