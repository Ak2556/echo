'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface TranslationHistory {
  id: string;
  from: string;
  to: string;
  original: string;
  translated: string;
  timestamp: number;
  favorite?: boolean;
}

interface LanguageTranslatorAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function LanguageTranslatorApp({ isVisible, onClose }: LanguageTranslatorAppProps) {
  const colors = useThemeColors();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'translate' | 'history' | 'stats'>('translate');
  const [showTips, setShowTips] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];

  const aiTips = useMemo(() => {
    const tips: string[] = [];
    if (inputText.length > 0) {
      if (inputText.length > 500) tips.push('Consider breaking long texts into smaller paragraphs for better accuracy.');
      if (inputText.includes('...')) tips.push('Avoid using ellipses for more precise translations.');
      if (inputText === inputText.toUpperCase() && inputText.length > 10) tips.push('Using all caps may affect translation context.');
      if (/[!?]{2,}/.test(inputText)) tips.push('Multiple punctuation marks may not translate well.');
    }
    if (tips.length === 0) tips.push('Type naturally for best translation results.');
    return tips;
  }, [inputText]);

  const stats = useMemo(() => {
    const totalTranslations = history.length;
    const favorites = history.filter(h => h.favorite).length;
    const langPairs: Record<string, number> = {};
    const wordCount = history.reduce((acc, h) => acc + h.original.split(' ').length, 0);

    history.forEach(h => {
      const pair = `${h.from}-${h.to}`;
      langPairs[pair] = (langPairs[pair] || 0) + 1;
    });

    const mostUsedPair = Object.entries(langPairs).sort((a, b) => b[1] - a[1])[0];

    return {
      totalTranslations,
      favorites,
      wordCount,
      mostUsedPair: mostUsedPair ? mostUsedPair[0] : 'N/A',
      avgLength: totalTranslations > 0 ? Math.round(wordCount / totalTranslations) : 0
    };
  }, [history]);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const translations: Record<string, Record<string, string>> = {
      en: {
        es: 'Texto traducido al espanol',
        fr: 'Texte traduit en francais',
        de: 'Text ins Deutsche ubersetzt',
        ja: 'テキストが翻訳されました'
      }
    };

    const result = translations[sourceLang]?.[targetLang] ||
      `[${languages.find(l => l.code === targetLang)?.name}] ${inputText}`;

    setTranslatedText(result);
    setHistory(prev => [{
      id: Date.now().toString(),
      from: sourceLang,
      to: targetLang,
      original: inputText,
      translated: result,
      timestamp: Date.now()
    }, ...prev].slice(0, 50));
    setIsTranslating(false);
  }, [inputText, sourceLang, targetLang, languages]);

  const swapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  }, [sourceLang, targetLang, inputText, translatedText]);

  const copyToClipboard = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, favorite: !h.favorite } : h));
  }, []);

  const getLangName = (code: string) => languages.find(l => l.code === code)?.name || code;
  const getLangFlag = (code: string) => languages.find(l => l.code === code)?.flag || '';

  if (!isVisible) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌐</span> Translator Pro
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            AI-powered translation tips & statistics
          </p>
        </div>
        <button onClick={() => setShowTips(!showTips)} style={{
          background: showTips ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)' : 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          padding: '8px 12px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}>
          💡 Tips
        </button>
      </div>

      {showTips && (
        <div style={{ padding: '12px 24px', background: 'rgba(102, 126, 234, 0.1)', borderBottom: '1px solid rgba(102, 126, 234, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🤖</span> AI Translation Tips
          </div>
          {aiTips.map((tip, idx) => (
            <div key={idx} style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '4px' }}>
              {tip}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', padding: '12px 24px', gap: '8px' }}>
        {[
          { id: 'translate', label: 'Translate', icon: '🌐' },
          { id: 'history', label: `History (${history.length})`, icon: '🕒' },
          { id: 'stats', label: 'Stats', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {activeTab === 'translate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', color: 'white', fontSize: '0.9rem' }}>
                {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
              </select>
              <button onClick={swapLanguages} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', padding: '12px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
                ⇄
              </button>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', color: 'white', fontSize: '0.9rem' }}>
                {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
              </select>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                {getLangFlag(sourceLang)} {getLangName(sourceLang)}
              </div>
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text to translate..." rows={4} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', resize: 'none', outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>{inputText.length} characters</span>
                <button onClick={() => copyToClipboard(inputText)} style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', fontSize: '0.8rem' }}>📋</button>
              </div>
            </div>

            <button onClick={handleTranslate} disabled={!inputText.trim() || isTranslating} style={{
              padding: '14px',
              background: inputText.trim() && !isTranslating ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: inputText.trim() && !isTranslating ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isTranslating ? 1 : 0.5
            }}>
              {isTranslating ? '🔄 Translating...' : '🌐 Translate'}
            </button>

            {translatedText && (
              <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  {getLangFlag(targetLang)} {getLangName(targetLang)}
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{translatedText}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button onClick={() => copyToClipboard(translatedText)} style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', fontSize: '0.8rem' }}>📋 Copy</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255, 255, 255, 0.5)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🕒</div>
                <div>No translation history yet</div>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>{getLangFlag(item.from)} → {getLangFlag(item.to)}</span>
                    <button onClick={() => toggleFavorite(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>{item.favorite ? '⭐' : '☆'}</button>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{item.original}</div>
                  <div style={{ fontSize: '0.85rem', color: 'colors.brand.primary' }}>{item.translated}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'colors.brand.primary' }}>{stats.totalTranslations}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Translations</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffd700' }}>{stats.favorites}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Favorites</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2ed573' }}>{stats.wordCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Words</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff6b6b' }}>{stats.avgLength}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Avg Words</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Most Used Language Pair</div>
              <div style={{ fontSize: '1.1rem', color: 'colors.brand.primary' }}>
                {stats.mostUsedPair !== 'N/A' ? (
                  <>{getLangFlag(stats.mostUsedPair.split('-')[0])} {getLangName(stats.mostUsedPair.split('-')[0])} → {getLangFlag(stats.mostUsedPair.split('-')[1])} {getLangName(stats.mostUsedPair.split('-')[1])}</>
                ) : 'No data yet'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
