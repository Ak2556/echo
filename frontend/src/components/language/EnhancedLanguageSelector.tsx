'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEnhancedLanguage } from '@/contexts/EnhancedLanguageContext';
import { ChevronDownIcon, CheckIcon, GlobeIcon, Languages } from 'lucide-react';

interface EnhancedLanguageSelectorProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showNativeName?: boolean;
  showCompletion?: boolean;
  showSearch?: boolean;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover';
  disabled?: boolean;
  onLanguageChange?: (language: string) => void;
}

export default function EnhancedLanguageSelector({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showNativeName = true,
  showCompletion = false,
  showSearch = false,
  className = '',
  placement = 'bottom',
  trigger = 'click',
  disabled = false,
  onLanguageChange,
}: EnhancedLanguageSelectorProps) {
  const {
    language,
    languageInfo,
    setLanguage,
    supportedLanguages,
    isChangingLanguage,
    getLanguageCompletion,
    getLanguageDisplayName,
    t,
    isRTL,
  } = useEnhancedLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter languages based on search query
  const filteredLanguages = supportedLanguages.filter(lang => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  // Handle language selection
  const handleLanguageSelect = async (langCode: string) => {
    if (langCode === language || isChangingLanguage) return;
    
    try {
      await setLanguage(langCode as any);
      onLanguageChange?.(langCode);
      setIsOpen(false);
      setSearchQuery('');
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredLanguages.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLanguages.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredLanguages.length) {
          handleLanguageSelect(filteredLanguages[focusedIndex].code);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(filteredLanguages.length - 1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  };

  const dropdownSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'inline') {
    return (
      <div className={`inline-flex flex-wrap gap-2 ${className}`}>
        {supportedLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            disabled={disabled || isChangingLanguage}
            className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all
              ${language === lang.code
                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {showFlag && <span className="text-lg">{lang.flag}</span>}
            <span className="font-medium">
              {showNativeName ? lang.nativeName : lang.name}
            </span>
            {showCompletion && (
              <span className="text-xs opacity-75">
                {getLanguageCompletion()}%
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => trigger === 'hover' && !disabled && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && !disabled && setIsOpen(false)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isChangingLanguage}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('common.select_language')}
        className={`
          inline-flex items-center gap-2 border rounded-lg transition-all
          ${sizeClasses[size]}
          ${disabled || isChangingLanguage
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
            : 'cursor-pointer bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
          }
          ${isOpen
            ? 'border-blue-300 ring-2 ring-blue-100 dark:border-blue-600 dark:ring-blue-900/30'
            : 'border-gray-300 dark:border-gray-600'
          }
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
      >
        {showFlag && (
          <span className="text-lg flex-shrink-0">{languageInfo.flag}</span>
        )}
        
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {showNativeName ? languageInfo.nativeName : languageInfo.name}
        </span>
        
        {showCompletion && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getLanguageCompletion()}%
          </span>
        )}
        
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
        
        {isChangingLanguage && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg max-h-80 overflow-hidden
            ${dropdownSizeClasses[size]}
            ${placement === 'top' ? 'bottom-full mb-1' : ''}
            ${placement === 'left' ? 'right-0' : ''}
            ${placement === 'right' ? 'left-0' : ''}
            ${isRTL ? 'left-0' : 'right-0'}
          `}
          style={{ minWidth: '200px' }}
          role="listbox"
          aria-label={t('common.language_options')}
        >
          {/* Search Input */}
          {showSearch && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search_languages')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Language List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                {t('common.no_languages_found')}
              </div>
            ) : (
              filteredLanguages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-3 transition-colors
                    ${language === lang.code
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${index === focusedIndex
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                    }
                  `}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  {showFlag && (
                    <span className="text-lg flex-shrink-0">{lang.flag}</span>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {showNativeName ? lang.nativeName : lang.name}
                    </div>
                    {showNativeName && lang.name !== lang.nativeName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {lang.name}
                      </div>
                    )}
                  </div>
                  
                  {showCompletion && (
                    <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {getLanguageCompletion()}%
                    </div>
                  )}
                  
                  {language === lang.code && (
                    <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{t('common.languages_available', { count: supportedLanguages.length })}</span>
              <div className="flex items-center gap-1">
                <GlobeIcon className="w-3 h-3" />
                <span>{getLanguageCompletion()}% {t('common.complete')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}