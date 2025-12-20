// Internationalization utilities for global-scale app

export const currencies = {
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR', locale: 'en-IN' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY', locale: 'ja-JP' },
  AUD: {
    symbol: 'A$',
    name: 'Australian Dollar',
    code: 'AUD',
    locale: 'en-AU',
  },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD', locale: 'en-CA' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY', locale: 'zh-CN' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL', locale: 'pt-BR' },
  MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN', locale: 'es-MX' },
};

export const languages = {
  en: { name: 'English', native: 'English', locale: 'en-US', rtl: false },
  hi: { name: 'Hindi', native: 'हिंदी', locale: 'hi-IN', rtl: false },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', locale: 'pa-IN', rtl: false },
  bn: { name: 'Bengali', native: 'বাংলা', locale: 'bn-IN', rtl: false },
  te: { name: 'Telugu', native: 'తెలుగు', locale: 'te-IN', rtl: false },
  mr: { name: 'Marathi', native: 'मराठी', locale: 'mr-IN', rtl: false },
  ta: { name: 'Tamil', native: 'தமிழ்', locale: 'ta-IN', rtl: false },
  gu: { name: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN', rtl: false },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN', rtl: false },
  ml: { name: 'Malayalam', native: 'മലയാളം', locale: 'ml-IN', rtl: false },
  or: { name: 'Odia', native: 'ଓଡ଼ିଆ', locale: 'or-IN', rtl: false },
  as: { name: 'Assamese', native: 'অসমীয়া', locale: 'as-IN', rtl: false },
  ur: { name: 'Urdu', native: 'اردو', locale: 'ur-PK', rtl: true },
  ar: { name: 'Arabic', native: 'العربية', locale: 'ar-SA', rtl: true },
  es: { name: 'Spanish', native: 'Español', locale: 'es-ES', rtl: false },
  fr: { name: 'French', native: 'Français', locale: 'fr-FR', rtl: false },
  de: { name: 'German', native: 'Deutsch', locale: 'de-DE', rtl: false },
  pt: { name: 'Portuguese', native: 'Português', locale: 'pt-PT', rtl: false },
  ru: { name: 'Russian', native: 'Русский', locale: 'ru-RU', rtl: false },
  ja: { name: 'Japanese', native: '日本語', locale: 'ja-JP', rtl: false },
  ko: { name: 'Korean', native: '한국어', locale: 'ko-KR', rtl: false },
  zh: { name: 'Chinese', native: '中文', locale: 'zh-CN', rtl: false },
  id: {
    name: 'Indonesian',
    native: 'Bahasa Indonesia',
    locale: 'id-ID',
    rtl: false,
  },
  th: { name: 'Thai', native: 'ไทย', locale: 'th-TH', rtl: false },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt', locale: 'vi-VN', rtl: false },
};

export const timezones = [
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: '+05:30' },
  { value: 'America/New_York', label: 'New York (EST)', offset: '-05:00' },
  {
    value: 'America/Los_Angeles',
    label: 'Los Angeles (PST)',
    offset: '-08:00',
  },
  { value: 'America/Chicago', label: 'Chicago (CST)', offset: '-06:00' },
  { value: 'Europe/London', label: 'London (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: '+01:00' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: '+11:00' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: '+13:00' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: '-03:00' },
  {
    value: 'America/Mexico_City',
    label: 'Mexico City (CST)',
    offset: '-06:00',
  },
  {
    value: 'Africa/Johannesburg',
    label: 'Johannesburg (SAST)',
    offset: '+02:00',
  },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: '+02:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
];

// Format currency with locale
export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR'
): string {
  const currency =
    currencies[currencyCode as keyof typeof currencies] || currencies.INR;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

// Format numbers with locale
export function formatNumber(num: number, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (error) {
    return num.toLocaleString();
  }
}

// Format large numbers (1.2K, 1.5M, etc.)
export function formatCompactNumber(
  num: number,
  locale: string = 'en-US'
): string {
  if (num < 1000) return num.toString();

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(num);
  } catch (error) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
}

// Format date/time with locale and timezone
export function formatDateTime(
  date: Date,
  locale: string = 'en-US',
  timezone: string = 'Asia/Kolkata',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    return date.toLocaleString();
  }
}

// Format relative time (2 hours ago, 3 days ago)
export function formatRelativeTime(
  date: Date,
  locale: string = 'en-US'
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
      style: 'short',
    });

    if (diffSecs < 60) {
      return rtf.format(-diffSecs, 'second');
    } else if (diffMins < 60) {
      return rtf.format(-diffMins, 'minute');
    } else if (diffHours < 24) {
      return rtf.format(-diffHours, 'hour');
    } else if (diffDays < 7) {
      return rtf.format(-diffDays, 'day');
    } else if (diffDays < 30) {
      return rtf.format(-Math.floor(diffDays / 7), 'week');
    } else if (diffDays < 365) {
      return rtf.format(-Math.floor(diffDays / 30), 'month');
    } else {
      return rtf.format(-Math.floor(diffDays / 365), 'year');
    }
  } catch (error) {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}

// Get user's locale from browser
export function getUserLocale(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'en-US';
  }
  return 'en-US';
}

// Get user's timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC';
  }
}

// Translate content moderation reasons
export const moderationReasons = {
  spam: {
    en: 'Spam or misleading',
    hi: 'स्पैम या भ्रामक',
    es: 'Spam o engañoso',
    fr: 'Spam ou trompeur',
    de: 'Spam oder irreführend',
    ar: 'بريد عشوائي أو مضلل',
    ja: 'スパムまたは誤解を招く',
    zh: '垃圾邮件或误导性',
  },
  harassment: {
    en: 'Harassment or bullying',
    hi: 'उत्पीड़न या धमकाना',
    es: 'Acoso o intimidación',
    fr: 'Harcèlement ou intimidation',
    de: 'Belästigung oder Mobbing',
    ar: 'مضايقة أو تنمر',
    ja: 'ハラスメントまたはいじめ',
    zh: '骚扰或欺凌',
  },
  hateSpeech: {
    en: 'Hate speech or discrimination',
    hi: 'घृणास्पद भाषण या भेदभाव',
    es: 'Discurso de odio o discriminación',
    fr: 'Discours haineux ou discrimination',
    de: 'Hassrede oder Diskriminierung',
    ar: 'خطاب الكراهية أو التمييز',
    ja: 'ヘイトスピーチまたは差別',
    zh: '仇恨言论或歧视',
  },
  violence: {
    en: 'Violence or dangerous content',
    hi: 'हिंसा या खतरनाक सामग्री',
    es: 'Violencia o contenido peligroso',
    fr: 'Violence ou contenu dangereux',
    de: 'Gewalt oder gefährliche Inhalte',
    ar: 'عنف أو محتوى خطير',
    ja: '暴力または危険なコンテンツ',
    zh: '暴力或危险内容',
  },
  nsfw: {
    en: 'Adult or sexual content',
    hi: 'वयस्क या यौन सामग्री',
    es: 'Contenido para adultos o sexual',
    fr: 'Contenu pour adultes ou sexuel',
    de: 'Erwachsenen- oder sexuelle Inhalte',
    ar: 'محتوى للبالغين أو جنسي',
    ja: 'アダルトまたは性的コンテンツ',
    zh: '成人或性内容',
  },
  copyright: {
    en: 'Copyright infringement',
    hi: 'कॉपीराइट उल्लंघन',
    es: 'Infracción de derechos de autor',
    fr: "Violation du droit d'auteur",
    de: 'Urheberrechtsverletzung',
    ar: 'انتهاك حقوق النشر',
    ja: '著作権侵害',
    zh: '侵犯版权',
  },
  misinformation: {
    en: 'False information or misinformation',
    hi: 'गलत जानकारी या भ्रामक सूचना',
    es: 'Información falsa o desinformación',
    fr: 'Fausse information ou désinformation',
    de: 'Falsche Informationen oder Fehlinformationen',
    ar: 'معلومات خاطئة أو تضليل',
    ja: '虚偽情報または誤情報',
    zh: '虚假信息或错误信息',
  },
  other: {
    en: 'Other',
    hi: 'अन्य',
    es: 'Otro',
    fr: 'Autre',
    de: 'Andere',
    ar: 'آخر',
    ja: 'その他',
    zh: '其他',
  },
};

// Get translated moderation reason
export function getModerationReason(
  reason: keyof typeof moderationReasons,
  lang: string = 'en'
): string {
  const langCode = lang.split('-')[0];
  const reasons = moderationReasons[reason];
  return reasons[langCode as keyof typeof reasons] || reasons.en;
}

// Detect content language (simple heuristic)
export function detectLanguage(text: string): string {
  // This is a simple detection - in production, use a proper library
  const hasHindi = /[\u0900-\u097F]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasChinese = /[\u4E00-\u9FFF]/.test(text);
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);
  const hasThai = /[\u0E00-\u0E7F]/.test(text);

  if (hasHindi) return 'hi';
  if (hasArabic) return 'ar';
  if (hasChinese) return 'zh';
  if (hasJapanese) return 'ja';
  if (hasKorean) return 'ko';
  if (hasThai) return 'th';

  return 'en';
}

// Pluralization helper
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: string = 'en'
): string {
  const rules = new Intl.PluralRules(locale);
  const rule = rules.select(count);

  switch (rule) {
    case 'one':
      return `${count} ${singular}`;
    default:
      return `${count} ${plural}`;
  }
}

// Check if language is RTL
export function isRTL(lang: string): boolean {
  const langInfo = languages[lang as keyof typeof languages];
  return langInfo?.rtl || false;
}

// Format file size
export function formatFileSize(
  bytes: number,
  locale: string = 'en-US'
): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// Format percentage
export function formatPercentage(
  value: number,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  } catch (error) {
    return `${value}%`;
  }
}
