'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface QRHistory {
  id: string;
  text: string;
  timestamp: string;
  favorite?: boolean;
  type: string;
}

interface QRCodeAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function QRCodeApp({ isVisible, onClose }: QRCodeAppProps) {
  const colors = useThemeColors();
  const [text, setText] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrHistory, setQrHistory] = useState<QRHistory[]>([]);
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('colors.brand.primary');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'templates'>('generate');
  const [showStats, setShowStats] = useState(false);

  const templates = [
    { id: 't1', name: 'WiFi', template: 'WIFI:T:WPA;S:{SSID};P:{PASSWORD};;', icon: '📶' },
    { id: 't2', name: 'vCard', template: 'BEGIN:VCARD\nVERSION:3.0\nFN:{NAME}\nTEL:{PHONE}\nEMAIL:{EMAIL}\nEND:VCARD', icon: '👤' },
    { id: 't3', name: 'Email', template: 'mailto:{EMAIL}?subject={SUBJECT}', icon: '📧' },
    { id: 't4', name: 'SMS', template: 'sms:{PHONE}?body={MESSAGE}', icon: '💬' },
    { id: 't5', name: 'Phone', template: 'tel:{PHONE}', icon: '📞' },
    { id: 't6', name: 'URL', template: 'https://{DOMAIN}', icon: '🔗' },
    { id: 't7', name: 'Location', template: 'geo:{LAT},{LON}', icon: '📍' },
    { id: 't8', name: 'Event', template: 'BEGIN:VEVENT\nSUMMARY:{TITLE}\nEND:VEVENT', icon: '📅' }
  ];

  useEffect(() => {
    const history = localStorage.getItem('qr-history');
    if (history) {
      try {
        setQrHistory(JSON.parse(history));
      } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qr-history', JSON.stringify(qrHistory));
  }, [qrHistory]);

  const detectType = (text: string): string => {
    if (text.startsWith('http')) return 'URL';
    if (text.startsWith('WIFI:')) return 'WiFi';
    if (text.startsWith('mailto:')) return 'Email';
    if (text.startsWith('tel:')) return 'Phone';
    if (text.includes('VCARD')) return 'vCard';
    if (text.startsWith('sms:')) return 'SMS';
    if (text.startsWith('geo:')) return 'Location';
    return 'Text';
  };

  const generateQR = useCallback(() => {
    if (text.trim()) {
      setQrGenerated(true);
      const historyEntry: QRHistory = {
        id: `qr-${Date.now()}`,
        text,
        timestamp: new Date().toISOString(),
        type: detectType(text)
      };
      setQrHistory(prev => [historyEntry, ...prev].slice(0, 50));
    }
  }, [text]);

  const copyToClipboard = useCallback(async (str: string) => {
    try {
      await navigator.clipboard.writeText(str);
    } catch (err) { /* ignore */ }
  }, []);

  const downloadQR = useCallback(() => {
    // Simple pattern for demo
    const canvas = document.createElement('canvas');
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Simple pattern representation
    ctx.fillStyle = qrColor;
    const gridSize = 8;
    const cellSize = qrSize / gridSize;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0 || (i < 2 && j < 2) || (i < 2 && j > 5) || (i > 5 && j < 2)) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [qrSize, bgColor, qrColor]);

  const shareQR = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'QR Code', text });
      } catch (err) { /* ignore */ }
    } else {
      copyToClipboard(text);
    }
  }, [text, copyToClipboard]);

  const toggleFavorite = useCallback((id: string) => {
    setQrHistory(prev => prev.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setQrHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const stats = useMemo(() => {
    const favorites = qrHistory.filter(h => h.favorite).length;
    const typeCount = qrHistory.reduce((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total: qrHistory.length, favorites, typeBreakdown: typeCount };
  }, [qrHistory]);

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
      {/* Header */}
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
            <span>📱</span> QR Code Pro
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Generate, customize & share QR codes
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            background: showStats ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)' : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          📊 Stats
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div style={{
          padding: '16px 24px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'colors.brand.primary' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffd700' }}>{stats.favorites}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>Favorites</div>
          </div>
          {Object.entries(stats.typeBreakdown).slice(0, 2).map(([type, count]) => (
            <div key={type} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2ed573' }}>{count}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>{type}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', padding: '12px 24px', gap: '8px' }}>
        {[
          { id: 'generate', label: 'Generate', icon: '✨' },
          { id: 'templates', label: 'Templates', icon: '📋' },
          { id: 'history', label: `History (${qrHistory.length})`, icon: '🕒' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                : 'rgba(255, 255, 255, 0.1)',
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

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {activeTab === 'generate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, WiFi credentials, or any data..."
              rows={4}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9rem',
                resize: 'vertical',
                outline: 'none'
              }}
            />

            <button
              onClick={generateQR}
              disabled={!text.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: text.trim()
                  ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                opacity: text.trim() ? 1 : 0.5
              }}
            >
              📱 Generate QR Code
            </button>

            {/* Customization */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' }}>Customization</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '6px' }}>
                    Size: {qrSize}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '6px' }}>
                      QR Color
                    </label>
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '6px' }}>
                      Background
                    </label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Result */}
            {qrGenerated && text && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: qrSize,
                  height: qrSize,
                  margin: '0 auto 16px',
                  background: bgColor,
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '2px',
                  padding: '12px'
                }}>
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: ((i % 8) + Math.floor(i / 8)) % 2 === 0 ||
                          (i < 16 && (i % 8) < 2) ||
                          (i < 16 && (i % 8) > 5) ||
                          (i > 47 && (i % 8) < 2)
                          ? qrColor
                          : 'transparent',
                        borderRadius: '2px'
                      }}
                    />
                  ))}
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  wordBreak: 'break-all'
                }}>
                  {text.length > 100 ? text.substring(0, 100) + '...' : text}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={downloadQR}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    💾 Download
                  </button>
                  <button
                    onClick={shareQR}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📤 Share
                  </button>
                  <button
                    onClick={() => copyToClipboard(text)}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setText(template.template);
                  setActiveTab('generate');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  color: 'white'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{template.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{template.name}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {qrHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255, 255, 255, 0.5)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📱</div>
                <div>No QR codes generated yet</div>
              </div>
            ) : (
              qrHistory.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', gap: '8px' }}>
                      <span>{item.type}</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setText(item.text);
                      setActiveTab('generate');
                      generateQR();
                    }}
                    style={{
                      background: 'rgba(102, 126, 234, 0.3)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '4px'
                    }}
                  >
                    {item.favorite ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#ff4757',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
