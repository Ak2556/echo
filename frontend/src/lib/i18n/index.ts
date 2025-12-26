import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages with comprehensive metadata
export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    region: 'US',
    pluralRules: 'en',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    region: 'ES',
    pluralRules: 'es',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    region: 'FR',
    pluralRules: 'fr',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    region: 'DE',
    pluralRules: 'de',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    region: 'CN',
    pluralRules: 'zh',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    region: 'JP',
    pluralRules: 'ja',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    region: 'KR',
    pluralRules: 'ko',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    region: 'BR',
    pluralRules: 'pt',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    region: 'IN',
    pluralRules: 'hi',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    region: 'SA',
    pluralRules: 'ar',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false,
    region: 'RU',
    pluralRules: 'ru',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    region: 'IT',
    pluralRules: 'it',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    rtl: false,
    region: 'NL',
    pluralRules: 'nl',
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    rtl: false,
    region: 'SE',
    pluralRules: 'sv',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    rtl: false,
    region: 'TR',
    pluralRules: 'tr',
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    rtl: false,
    region: 'PL',
    pluralRules: 'pl',
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    rtl: false,
    region: 'TH',
    pluralRules: 'th',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    rtl: false,
    region: 'VN',
    pluralRules: 'vi',
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    rtl: false,
    region: 'ID',
    pluralRules: 'id',
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    rtl: false,
    region: 'MY',
    pluralRules: 'ms',
  },
] as const;

export type SupportedLanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]['code'];
export type LanguageInfo = (typeof SUPPORTED_LANGUAGES)[number];

// Namespaces for organized translations
export const NAMESPACES = [
  'common',
  'navigation',
  'auth',
  'feed',
  'profile',
  'settings',
  'messages',
  'discover',
  'live',
  'shop',
  'ai',
  'miniapps',
  'notifications',
  'errors',
  'success',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

// Language detection configuration
const detectionOptions = {
  // Order of detection methods
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

  // Keys for localStorage
  lookupLocalStorage: 'echo-language',

  // Cache user language
  caches: ['localStorage'],

  // Exclude certain detection methods
  excludeCacheFor: ['cimode'],

  // Check for language in HTML tag
  checkWhitelist: true,

  // Convert language codes (e.g., en-US -> en)
  convertDetectedLanguage: (lng: string) => {
    // Extract base language code
    const baseCode = lng.split('-')[0].toLowerCase();
    // Check if we support this language
    return (
      SUPPORTED_LANGUAGES.find((lang) => lang.code === baseCode)?.code || 'en'
    );
  },
};

// Backend configuration for loading translations
const backendOptions = {
  // Path to load translations from
  loadPath: '/locales/{{lng}}/{{ns}}.json',

  // Allow cross domain requests
  crossDomain: false,

  // Parse data after loading
  parse: (data: string) => JSON.parse(data),

  // Request timeout
  requestOptions: {
    cache: 'default',
  },
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Fallback language
    fallbackLng: 'en',

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // Default namespace
    defaultNS: 'common',

    // Available namespaces
    ns: NAMESPACES,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize')
          return value.charAt(0).toUpperCase() + value.slice(1);

        // Date formatting
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        if (format === 'datetime') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(value));
        }
        if (format === 'time') {
          return new Intl.DateTimeFormat(lng, {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(value));
        }

        // Number formatting
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          const lang = SUPPORTED_LANGUAGES.find((l) => l.code === lng);
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: getCurrencyForRegion(lang?.region || 'US'),
          }).format(value);
        }
        if (format === 'percent') {
          return new Intl.NumberFormat(lng, {
            style: 'percent',
          }).format(value);
        }

        return value;
      },
    },

    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },

    // Detection options
    detection: detectionOptions,

    // Backend options
    backend: backendOptions,

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Load languages
    preload: ['en'], // Always preload English as fallback

    // Whitelist supported languages
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    nonExplicitSupportedLngs: true,

    // Clean code
    cleanCode: true,

    // Save missing translations
    saveMissing: process.env.NODE_ENV === 'development',
    saveMissingTo: 'current',

    // Missing key handler
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}:${ns}:${key}`);
      }
    },

    // Post processor
    postProcess: ['interval'],

    // Keyseparator
    keySeparator: '.',
    nsSeparator: ':',

    // Return objects
    returnObjects: false,
    returnEmptyString: false,
    returnNull: false,

    // Join arrays
    joinArrays: false,

    // Override options
    overloadTranslationOptionHandler: (args) => {
      return {
        defaultValue: args[1],
      };
    },
  });

// Helper functions
export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function isRTL(code: string): boolean {
  const lang = getLanguageInfo(code);
  return lang?.rtl || false;
}

export function getDefaultLanguage(): SupportedLanguageCode {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supported = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === browserLang
  );

  return supported?.code || 'en';
}

export function getCurrencyForRegion(region: string): string {
  const currencyMap: Record<string, string> = {
    US: 'USD',
    ES: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    CN: 'CNY',
    JP: 'JPY',
    KR: 'KRW',
    BR: 'BRL',
    IN: 'INR',
    SA: 'SAR',
    RU: 'RUB',
    SE: 'SEK',
    TR: 'TRY',
    PL: 'PLN',
    TH: 'THB',
    VN: 'VND',
    ID: 'IDR',
    MY: 'MYR',
  };

  return currencyMap[region] || 'USD';
}

export function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(
        diffInSeconds < 0 ? -count : count,
        interval.label as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return rtf.format(0, 'second');
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  locale: string,
  currency?: string
): string {
  const lang = getLanguageInfo(locale);
  const currencyCode = currency || getCurrencyForRegion(lang?.region || 'US');

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatList(
  items: string[],
  locale: string,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, { style: 'long', type }).format(items);
}

// Export the configured i18n instance
export default i18n;
