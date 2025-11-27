'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedLanguage } from '@/contexts/EnhancedLanguageContext';
import { TranslateIcon, XIcon, CheckIcon, GlobeIcon } from 'lucide-react';

interface LanguageDetectorProps {
  text: string;
  onTranslate?: (translatedText: string, detectedLanguage: string) => void;
  onDismiss?: () => void;
  autoDetect?: boolean;
  showConfidence?: boolean;
  minConfidence?: number;
  className?: string;
}

interface DetectedLanguage {
  code: string;
  name: string;
  confidence: number;
}

export default function LanguageDetector({
  text,
  onTranslate,
  onDismiss,
  autoDetect = true,
  showConfidence = false,
  minConfidence = 0.7,
  className = '',
}: LanguageDetectorProps) {
  const {
    language: currentLanguage,
    supportedLanguages,
    translateText,
    getLanguageDisplayName,
    t,
  } = useEnhancedLanguage();

  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock language detection function
  const detectLanguage = async (text: string): Promise<DetectedLanguage | null> => {
    // In production, this would call a real language detection API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock detection logic
        const textLower = text.toLowerCase();
        
        // Simple heuristics for demo purposes
        if (textLower.includes('hola') || textLower.includes('gracias') || textLower.includes('por favor')) {
          resolve({ code: 'es', name: 'Spanish', confidence: 0.95 });
        } else if (textLower.includes('bonjour') || textLower.includes('merci') || textLower.includes('s\'il vous plaît')) {
          resolve({ code: 'fr', name: 'French', confidence: 0.92 });
        } else if (textLower.includes('guten tag') || textLower.includes('danke') || textLower.includes('bitte')) {
          resolve({ code: 'de', name: 'German', confidence: 0.88 });
        } else if (textLower.includes('こんにちは') || textLower.includes('ありがとう')) {
          resolve({ code: 'ja', name: 'Japanese', confidence: 0.98 });
        } else if (textLower.includes('你好') || textLower.includes('谢谢')) {
          resolve({ code: 'zh', name: 'Chinese', confidence: 0.96 });
        } else if (textLower.includes('مرحبا') || textLower.includes('شكرا')) {
          resolve({ code: 'ar', name: 'Arabic', confidence: 0.94 });
        } else if (textLower.includes('привет') || textLower.includes('спасибо')) {
          resolve({ code: 'ru', name: 'Russian', confidence: 0.90 });
        } else if (textLower.includes('ciao') || textLower.includes('grazie')) {
          resolve({ code: 'it', name: 'Italian', confidence: 0.87 });
        } else if (textLower.includes('olá') || textLower.includes('obrigado')) {
          resolve({ code: 'pt', name: 'Portuguese', confidence: 0.85 });
        } else if (textLower.includes('안녕하세요') || textLower.includes('감사합니다')) {
          resolve({ code: 'ko', name: 'Korean', confidence: 0.93 });
        } else if (textLower.includes('नमस्ते') || textLower.includes('धन्यवाद')) {
          resolve({ code: 'hi', name: 'Hindi', confidence: 0.91 });
        } else {
          // Default to English if no patterns match
          resolve({ code: 'en', name: 'English', confidence: 0.6 });
        }
      }, 500);
    });
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!detectedLanguage || isTranslating) return;

    setIsTranslating(true);
    setError(null);

    try {
      const translated = await translateText(text, currentLanguage);
      setTranslatedText(translated);
      setShowTranslation(true);
      onTranslate?.(translated, detectedLanguage.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-detect language when text changes
  useEffect(() => {
    if (!autoDetect || !text || text.length < 10) {
      setDetectedLanguage(null);
      return;
    }

    const detectAsync = async () => {
      try {
        const detected = await detectLanguage(text);
        if (detected && detected.confidence >= minConfidence && detected.code !== currentLanguage) {
          setDetectedLanguage(detected);
        } else {
          setDetectedLanguage(null);
        }
      } catch (err) {
        console.error('Language detection failed:', err);
        setDetectedLanguage(null);
      }
    };

    const timeoutId = setTimeout(detectAsync, 1000); // Debounce detection
    return () => clearTimeout(timeoutId);
  }, [text, autoDetect, minConfidence, currentLanguage]);

  // Don't render if no language detected or same as current language
  if (!detectedLanguage || detectedLanguage.code === currentLanguage) {
    return null;
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <GlobeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('common.language_detected')}
            </h4>
            {showConfidence && (
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                {Math.round(detectedLanguage.confidence * 100)}% {t('common.confidence')}
              </span>
            )}
          </div>

          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {t('common.text_appears_to_be_in', { 
              language: getLanguageDisplayName(detectedLanguage.code as any) 
            })}. {t('common.would_you_like_to_translate')}?
          </p>

          {/* Translation Result */}
          {showTranslation && translatedText && (
            <div className="mb-3 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <TranslateIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  {t('common.translated_to', { language: getLanguageDisplayName(currentLanguage) })}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {translatedText}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isTranslating ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.translating')}
                </>
              ) : (
                <>
                  <TranslateIcon className="w-4 h-4" />
                  {t('common.translate')}
                </>
              )}
            </button>

            {showTranslation && (
              <button
                onClick={() => setShowTranslation(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
              >
                {t('common.show_original')}
              </button>
            )}

            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors"
            >
              <XIcon className="w-3 h-3" />
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      </div>

      {/* Language Info */}
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
          <span>
            {t('common.detected_language')}: {detectedLanguage.name} ({detectedLanguage.code.toUpperCase()})
          </span>
          <span>
            {t('common.target_language')}: {getLanguageDisplayName(currentLanguage)} ({currentLanguage.toUpperCase()})
          </span>
        </div>
      </div>
    </div>
  );
}