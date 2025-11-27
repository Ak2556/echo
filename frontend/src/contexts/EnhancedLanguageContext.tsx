'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SUPPORTED_LANGUAGES, 
  type SupportedLanguageCode, 
  type LanguageInfo,
  isRTL,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatDate,
  formatList,
  getCurrencyForRegion
} from '@/lib/i18n';

interface LanguageContextType {
  // Current language
  language: SupportedLanguageCode;
  languageInfo: LanguageInfo;
  
  // Language management
  setLanguage: (language: SupportedLanguageCode) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  
  // Translation functions
  t: (key: string, options?: any) => string;
  tWithNamespace: (namespace: string, key: string, options?: any) => string;
  
  // RTL support
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  
  // Formatting functions
  formatRelativeTime: (date: Date) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatList: (items: string[], type?: 'conjunction' | 'disjunction') => string;
  formatPercent: (value: number) => string;
  formatBytes: (bytes: number) => string;
  formatDuration: (seconds: number) => string;
  
  // Pluralization
  plural: (key: string, count: number, options?: any) => string;
  
  // Language detection and preferences
  detectLanguage: () => SupportedLanguageCode;
  getUserPreferredLanguages: () => SupportedLanguageCode[];
  
  // Loading states
  isLoading: boolean;
  isChangingLanguage: boolean;
  
  // Error handling
  error: string | null;
  
  // Advanced features
  translateText: (text: string, targetLang?: SupportedLanguageCode) => Promise<string>;
  getLanguageCompletion: () => number;
  getMissingTranslations: () => string[];
  
  // Accessibility
  announceLanguageChange: (language: string) => void;
  getLanguageDisplayName: (code: SupportedLanguageCode, displayLang?: SupportedLanguageCode) => string;
}

const EnhancedLanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface EnhancedLanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguageCode;
  fallbackLanguage?: SupportedLanguageCode;
  enableAutoDetection?: boolean;
  enablePersistence?: boolean;
  enableTranslationAPI?: boolean;
}

export function EnhancedLanguageProvider({
  children,
  defaultLanguage = 'en',
  fallbackLanguage = 'en',
  enableAutoDetection = true,
  enablePersistence = true,
  enableTranslationAPI = false,
}: EnhancedLanguageProviderProps) {
  const { i18n, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current language info
  const currentLanguage = (i18n.language || defaultLanguage) as SupportedLanguageCode;
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const currentIsRTL = isRTL(currentLanguage);

  // Detect user's preferred language
  const detectLanguage = useCallback((): SupportedLanguageCode => {
    if (typeof navigator === 'undefined') return defaultLanguage;
    
    // Check navigator languages in order of preference
    const navigatorLanguages = navigator.languages || [navigator.language];
    
    for (const navLang of navigatorLanguages) {
      const baseCode = navLang.split('-')[0].toLowerCase();
      const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === baseCode);
      if (supported) {
        return supported.code;
      }
    }
    
    return defaultLanguage;
  }, [defaultLanguage]);

  // Get user's preferred languages
  const getUserPreferredLanguages = useCallback((): SupportedLanguageCode[] => {
    if (typeof navigator === 'undefined') return [defaultLanguage];
    
    const navigatorLanguages = navigator.languages || [navigator.language];
    const preferredLanguages: SupportedLanguageCode[] = [];
    
    for (const navLang of navigatorLanguages) {
      const baseCode = navLang.split('-')[0].toLowerCase();
      const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === baseCode);
      if (supported && !preferredLanguages.includes(supported.code)) {
        preferredLanguages.push(supported.code);
      }
    }
    
    if (preferredLanguages.length === 0) {
      preferredLanguages.push(defaultLanguage);
    }
    
    return preferredLanguages;
  }, [defaultLanguage]);

  // Change language with loading state and error handling
  const setLanguage = useCallback(async (newLanguage: SupportedLanguageCode) => {
    if (newLanguage === currentLanguage) return;
    
    setIsChangingLanguage(true);
    setError(null);
    
    try {
      await i18n.changeLanguage(newLanguage);
      
      // Persist language preference
      if (enablePersistence && typeof localStorage !== 'undefined') {
        localStorage.setItem('echo-language', newLanguage);
      }
      
      // Update document attributes
      if (typeof document !== 'undefined') {
        const newIsRTL = isRTL(newLanguage);
        document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = newLanguage;
        
        // Update CSS custom properties for RTL
        document.documentElement.style.setProperty('--text-align-start', newIsRTL ? 'right' : 'left');
        document.documentElement.style.setProperty('--text-align-end', newIsRTL ? 'left' : 'right');
        document.documentElement.style.setProperty('--margin-start', newIsRTL ? 'margin-right' : 'margin-left');
        document.documentElement.style.setProperty('--margin-end', newIsRTL ? 'margin-left' : 'margin-right');
        document.documentElement.style.setProperty('--padding-start', newIsRTL ? 'padding-right' : 'padding-left');
        document.documentElement.style.setProperty('--padding-end', newIsRTL ? 'padding-left' : 'padding-right');
        document.documentElement.style.setProperty('--border-start', newIsRTL ? 'border-right' : 'border-left');
        document.documentElement.style.setProperty('--border-end', newIsRTL ? 'border-left' : 'border-right');
        document.documentElement.style.setProperty('--inset-start', newIsRTL ? 'right' : 'left');
        document.documentElement.style.setProperty('--inset-end', newIsRTL ? 'left' : 'right');
      }
      
      // Announce language change for accessibility
      announceLanguageChange(SUPPORTED_LANGUAGES.find(lang => lang.code === newLanguage)?.name || newLanguage);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change language');
      console.error('Language change failed:', err);
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, i18n, enablePersistence]);

  // Translation with namespace support
  const tWithNamespace = useCallback((namespace: string, key: string, options?: any) => {
    return t(`${namespace}:${key}`, options);
  }, [t]);

  // Formatting functions with current locale
  const formatRelativeTimeLocal = useCallback((date: Date) => {
    return formatRelativeTime(date, currentLanguage);
  }, [currentLanguage]);

  const formatNumberLocal = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return formatNumber(value, currentLanguage, options);
  }, [currentLanguage]);

  const formatCurrencyLocal = useCallback((value: number, currency?: string) => {
    return formatCurrency(value, currentLanguage, currency);
  }, [currentLanguage]);

  const formatDateLocal = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return formatDate(date, currentLanguage, options);
  }, [currentLanguage]);

  const formatListLocal = useCallback((items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') => {
    return formatList(items, currentLanguage, type);
  }, [currentLanguage]);

  const formatPercent = useCallback((value: number) => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }, [currentLanguage]);

  const formatBytes = useCallback((bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${formatNumberLocal(size, { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
  }, [formatNumberLocal]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  // Pluralization helper
  const plural = useCallback((key: string, count: number, options?: any) => {
    return t(key, { count, ...options });
  }, [t]);

  // Translation API (mock implementation)
  const translateText = useCallback(async (text: string, targetLang: SupportedLanguageCode = currentLanguage): Promise<string> => {
    if (!enableTranslationAPI) {
      throw new Error('Translation API is not enabled');
    }
    
    // Mock implementation - in production, this would call a real translation service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[${targetLang.toUpperCase()}] ${text}`);
      }, 1000);
    });
  }, [currentLanguage, enableTranslationAPI]);

  // Get translation completion percentage
  const getLanguageCompletion = useCallback((): number => {
    // Mock implementation - in production, this would check actual translation coverage
    const completionMap: Record<SupportedLanguageCode, number> = {
      'en': 100,
      'es': 95,
      'fr': 90,
      'de': 88,
      'zh': 85,
      'ja': 82,
      'ko': 80,
      'pt': 78,
      'hi': 75,
      'ar': 70,
      'ru': 68,
      'it': 85,
      'nl': 82,
      'sv': 80,
      'tr': 75,
      'pl': 72,
      'th': 65,
      'vi': 62,
      'id': 60,
      'ms': 58,
    };
    
    return completionMap[currentLanguage] || 50;
  }, [currentLanguage]);

  // Get missing translation keys
  const getMissingTranslations = useCallback((): string[] => {
    // Mock implementation - in production, this would return actual missing keys
    return [];
  }, []);

  // Accessibility announcement
  const announceLanguageChange = useCallback((languageName: string) => {
    if (typeof document === 'undefined') return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = `Language changed to ${languageName}`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Get language display name in specified language
  const getLanguageDisplayName = useCallback((code: SupportedLanguageCode, displayLang: SupportedLanguageCode = currentLanguage): string => {
    try {
      const displayNames = new Intl.DisplayNames([displayLang], { type: 'language' });
      return displayNames.of(code) || code;
    } catch {
      // Fallback to our static data
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
      return lang?.name || code;
    }
  }, [currentLanguage]);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      try {
        let targetLanguage = defaultLanguage;
        
        // Check for persisted language
        if (enablePersistence && typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem('echo-language');
          if (stored && SUPPORTED_LANGUAGES.find(lang => lang.code === stored)) {
            targetLanguage = stored as SupportedLanguageCode;
          }
        }
        
        // Auto-detect if enabled and no stored preference
        if (enableAutoDetection && targetLanguage === defaultLanguage) {
          targetLanguage = detectLanguage();
        }
        
        // Set initial language
        if (targetLanguage !== currentLanguage) {
          await setLanguage(targetLanguage);
        } else {
          // Still need to set document attributes
          if (typeof document !== 'undefined') {
            document.documentElement.dir = currentIsRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = currentLanguage;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize language');
        console.error('Language initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeLanguage();
  }, [defaultLanguage, enableAutoDetection, enablePersistence, detectLanguage, setLanguage, currentLanguage, currentIsRTL]);

  // Listen for system language changes
  useEffect(() => {
    if (!enableAutoDetection) return;
    
    const handleLanguageChange = () => {
      const detectedLanguage = detectLanguage();
      if (detectedLanguage !== currentLanguage) {
        setLanguage(detectedLanguage);
      }
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [enableAutoDetection, detectLanguage, currentLanguage, setLanguage]);

  const value: LanguageContextType = {
    // Current language
    language: currentLanguage,
    languageInfo,
    
    // Language management
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    
    // Translation functions
    t,
    tWithNamespace,
    
    // RTL support
    isRTL: currentIsRTL,
    direction: currentIsRTL ? 'rtl' : 'ltr',
    
    // Formatting functions
    formatRelativeTime: formatRelativeTimeLocal,
    formatNumber: formatNumberLocal,
    formatCurrency: formatCurrencyLocal,
    formatDate: formatDateLocal,
    formatList: formatListLocal,
    formatPercent,
    formatBytes,
    formatDuration,
    
    // Pluralization
    plural,
    
    // Language detection and preferences
    detectLanguage,
    getUserPreferredLanguages,
    
    // Loading states
    isLoading,
    isChangingLanguage,
    
    // Error handling
    error,
    
    // Advanced features
    translateText,
    getLanguageCompletion,
    getMissingTranslations,
    
    // Accessibility
    announceLanguageChange,
    getLanguageDisplayName,
  };

  return (
    <EnhancedLanguageContext.Provider value={value}>
      {children}
    </EnhancedLanguageContext.Provider>
  );
}

export function useEnhancedLanguage(): LanguageContextType {
  const context = useContext(EnhancedLanguageContext);
  if (context === undefined) {
    throw new Error('useEnhancedLanguage must be used within an EnhancedLanguageProvider');
  }
  return context;
}

// Backward compatibility hook
export function useLanguage(): Pick<LanguageContextType, 'language' | 'setLanguage' | 't' | 'isRTL' | 'supportedLanguages'> {
  const context = useContext(EnhancedLanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within an EnhancedLanguageProvider');
  }
  
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t: context.t,
    isRTL: context.isRTL,
    supportedLanguages: context.supportedLanguages,
  };
}

export default EnhancedLanguageContext;