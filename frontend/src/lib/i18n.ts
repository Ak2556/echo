/**
 * Internationalization utilities
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi' | 'pa';

export function getDefaultLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.split('-')[0];
  return SUPPORTED_LANGUAGES.find(l => l.code === lang)?.code as LanguageCode || 'en';
}

export type LanguageInfo = { code: string; name: string; nativeName: string; flag: string };

export function getLanguage(code?: string): LanguageInfo | undefined {
  if (!code) {
    if (typeof window === 'undefined') {
      const defaultCode = getDefaultLanguage();
      return SUPPORTED_LANGUAGES.find(l => l.code === defaultCode);
    }
    const stored = localStorage.getItem('language');
    if (stored) {
      return SUPPORTED_LANGUAGES.find(l => l.code === stored);
    }
    const defaultCode = getDefaultLanguage();
    return SUPPORTED_LANGUAGES.find(l => l.code === defaultCode);
  }
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
}

export function isRTL(lang: string): boolean {
  const rtlLanguages: string[] = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang);
}

export const languages = SUPPORTED_LANGUAGES;

export type SupportedLanguageCode = LanguageCode;

export default {
  SUPPORTED_LANGUAGES,
  languages,
  getDefaultLanguage,
  getLanguage,
  isRTL
};
