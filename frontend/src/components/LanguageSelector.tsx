'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, getLanguage, isRTL } from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function LanguageSelector({ className = '', style = {} }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage(i18n.language) || languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentLanguage(getLanguage(i18n.language) || languages[0]);
  }, [i18n.language]);

  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    setCurrentLanguage(getLanguage(languageCode) || languages[0]);
    setIsOpen(false);

    // Update document direction for RTL languages
    const isRtl = isRTL(languageCode);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;

    // Update CSS custom property for RTL support
    document.documentElement.style.setProperty('--reading-direction', isRtl ? 'rtl' : 'ltr');
  };

  return (
    <div
      ref={dropdownRef}
      className={`language-selector ${className}`}
      style={{ position: 'relative', ...style }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--fg)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-rgb), 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label={t('language')}
        title={t('language')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span>
          <span style={{ fontWeight: 500 }}>{currentLanguage.code.toUpperCase()}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="language-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ padding: '0.5rem 0' }}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="language-option"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: currentLanguage.code === language.code ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                  border: 'none',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentLanguage.code !== language.code) {
                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLanguage.code !== language.code) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem', minWidth: '20px' }}>{language.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {language.nativeName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                    {language.name}
                  </div>
                </div>
                {currentLanguage.code === language.code && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: 'var(--accent)' }}
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .language-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .language-dropdown::-webkit-scrollbar-track {
          background: var(--bg);
          border-radius: 3px;
        }

        .language-dropdown::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }

        .language-dropdown::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
      `}</style>
    </div>
  );
}