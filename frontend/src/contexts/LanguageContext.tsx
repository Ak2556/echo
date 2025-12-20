'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [i18nInstance, setI18nInstance] = useState<any>(null);
  const [tFunction, setTFunction] = useState<(key: string) => string>(() => (key: string) => key);

  // Initialize i18n and translation function
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { useTranslation } = await import('react-i18next');
        const i18nModule = await import('@/i18n/index');
        
        setI18nInstance(i18nModule.default);
        
        // Get stored language or use default
        const storedLanguage = typeof localStorage !== 'undefined' 
          ? localStorage.getItem('echo-language') as SupportedLanguageCode
          : null;
        
        const initialLanguage = storedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === storedLanguage)
          ? storedLanguage
          : 'en';
        
        setCurrentLanguage(initialLanguage);
        
        // Set language in i18n if available
        if (i18nModule.default && typeof i18nModule.default.changeLanguage === 'function') {
          await i18nModule.default.changeLanguage(initialLanguage);
        }
        
        setIsI18nReady(true);
        console.log('i18n initialized in LanguageProvider');
      } catch (error) {
        console.error('Failed to initialize i18n in LanguageProvider:', error);
        // Still set as ready with fallback
        setIsI18nReady(true);
      }
    };

    initializeI18n();
  }, []);

  // Update translation function when i18n is ready
  useEffect(() => {
    if (isI18nReady && i18nInstance) {
      try {
        // Try to get the translation function
        const { useTranslation } = require('react-i18next');
        // Note: We can't use useTranslation hook here directly due to rules of hooks
        // So we'll create a simple translation function
        setTFunction(() => (key: string) => {
          try {
            return i18nInstance.t ? i18nInstance.t(key) : key;
          } catch {
            return key;
          }
        });
      } catch (error) {
        console.error('Failed to setup translation function:', error);
        setTFunction(() => (key: string) => key);
      }
    }
  }, [isI18nReady, i18nInstance]);

  const setLanguage = async (newLanguage: SupportedLanguageCode) => {
    try {
      console.log('Attempting to change language to:', newLanguage);
      
      // Update local state immediately
      setCurrentLanguage(newLanguage);
      
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('echo-language', newLanguage);
      }
      
      // Update i18n instance if available
      if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
        await i18nInstance.changeLanguage(newLanguage);
        console.log('Language changed via i18n instance to:', newLanguage);
      } else {
        // Fallback: try to import and use i18n directly
        try {
          const { default: i18nFallback } = await import('@/i18n/index');
          if (i18nFallback && typeof i18nFallback.changeLanguage === 'function') {
            await i18nFallback.changeLanguage(newLanguage);
            console.log('Language changed via fallback to:', newLanguage);
          }
        } catch (fallbackError) {
          console.error('Fallback language change failed:', fallbackError);
        }
      }
      
      // Update document attributes
      const isRTL = ['ar', 'he', 'fa', 'ur'].includes(newLanguage);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = newLanguage;
      }
      
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // RTL languages detection
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  // Apply RTL class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage, isRTL]);

  const value: LanguageContextType = {
    language: currentLanguage,
    setLanguage,
    t: tFunction,
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
    
    // Create a fallback setLanguage that tries to change the language directly via i18n
    const fallbackSetLanguage = async (newLanguage: SupportedLanguageCode) => {
      try {
        // Try to access the global i18n instance
        const { default: i18n } = await import('@/i18n/index');
        if (i18n && typeof i18n.changeLanguage === 'function') {
          await i18n.changeLanguage(newLanguage);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('echo-language', newLanguage);
          }
          // Force a page refresh to apply the language change
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to change language in fallback:', error);
      }
    };
    
    return {
      language: 'en',
      setLanguage: fallbackSetLanguage,
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