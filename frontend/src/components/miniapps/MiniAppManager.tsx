'use client';

import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Import only the final 15 best mini apps
import CalculatorApp from './CalculatorApp';
import TimerApp from './TimerApp';
import WeatherApp from './WeatherApp';
import TaskManagerApp from './TaskManagerApp';
import PasswordManagerApp from './PasswordManagerApp';
import QRCodeApp from './QRCodeApp';
import FinanceManagerApp from './FinanceManagerApp';
import NotesApp from './NotesApp';
import MediaPlayerApp from './MediaPlayerApp';
import CalendarApp from './CalendarApp';
import FileManagerApp from './FileManagerApp';
import RecipeBookApp from './RecipeBookApp';
import LanguageTranslatorApp from './LanguageTranslatorApp';
import WhiteboardApp from './WhiteboardApp';
import DairyFarmManagerApp from './DairyFarmManagerApp';
import TuitionMarketplaceApp from './TuitionMarketplaceApp';
// import MiniAppShowcase from './MiniAppShowcase';

interface MiniAppManagerProps {
  activeApp: string | null;
  onClose: () => void;
}

// Helper function to get app titles
function getAppTitle(appId: string): string {
  const titles: Record<string, string> = {
    calculator: '🧮 Calculator',
    timer: '⏱️ Timer',
    stopwatch: '⏱️ Stopwatch', 
    pomodoro: '🍅 Pomodoro',
    weather: '🌤️ Weather',
    tasks: '✅ Task Manager',
    taskmanager: '✅ Task Manager',
    password: '🔐 Password Manager',
    'password-generator': '🔐 Password Manager',
    passwordmanager: '🔐 Password Manager',
    qr: '📱 QR Code',
    'qr-code': '📱 QR Code',
    qrcode: '📱 QR Code',
    finance: '💰 Finance Manager',
    financemanager: '💰 Finance Manager',
    budget: '💰 Budget',
    notes: '📝 Notes',
    media: '🎵 Media Player',
    mediaplayer: '🎵 Media Player',
    musicplayer: '🎵 Music Player',
    videoplayer: '🎬 Video Player',
    calendar: '📅 Calendar',
    files: '📁 File Manager',
    filemanager: '📁 File Manager',
    recipes: '🍳 Recipe Book',
    recipebook: '🍳 Recipe Book',
    translator: '🌍 Translator',
    translate: '🌍 Translator',
    whiteboard: '🎨 Whiteboard',
    draw: '🎨 Whiteboard',
    dairyfarm: '🐄 Dairy Farm Manager',
    farm: '🐄 Farm Manager',
    dairy: '🐄 Dairy Manager',
    tuition: '🎓 Tuition Marketplace',
    tuitionmarketplace: '🎓 Tuition Marketplace',
    education: '🎓 Education',
    'design-system': '🎨 Design System',
    showcase: '🎨 Design System Showcase',
    demo: '🎨 Mini Apps Demo'
  };
  
  return titles[appId] || '📱 Mini App';
}

export default function MiniAppManager({ activeApp, onClose }: MiniAppManagerProps) {

  const contentRef = useRef<HTMLDivElement>(null);
  const { colorMode, toggleColorMode } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Stable onClose function
  const handleAppClose = () => {};

  // Memoize the active app to prevent unnecessary re-renders
  const activeAppComponent = useMemo(() => {
    switch (activeApp) {
      // 1. Calculator - Scientific calculator with converter
      case 'calculator':
        return <CalculatorApp isVisible={true} onClose={handleAppClose} />;

      // 2. Timer - Includes stopwatch and pomodoro
      case 'timer':
      case 'stopwatch':
      case 'pomodoro':
        return <TimerApp isVisible={true} onClose={handleAppClose} />;

      // 3. Weather - Real-time weather info
      case 'weather':
        return <WeatherApp isVisible={true} onClose={handleAppClose} />;

      // 4. Task Manager - To-do lists and productivity
      case 'tasks':
      case 'taskmanager':
        return <TaskManagerApp isVisible={true} onClose={handleAppClose} />;

      // 5. Password Manager - Secure password generator
      case 'password':
      case 'password-generator':
      case 'passwordmanager':
        return <PasswordManagerApp isVisible={true} onClose={handleAppClose} />;

      // 6. QR Code - Generator and scanner
      case 'qr':
      case 'qr-code':
      case 'qrcode':
        return <QRCodeApp isVisible={true} onClose={handleAppClose} />;

      // 7. Finance Manager - Budget and expense tracking
      case 'finance':
      case 'financemanager':
      case 'budget':
        return <FinanceManagerApp isVisible={true} onClose={handleAppClose} />;

      // 8. Notes - Note taking app
      case 'notes':
        return <NotesApp isVisible={true} onClose={handleAppClose} />;

      // 9. Media Player - Music and video player
      case 'media':
      case 'mediaplayer':
      case 'musicplayer':
      case 'videoplayer':
        return <MediaPlayerApp isVisible={true} onClose={handleAppClose} />;

      // 10. Calendar - Scheduling and events
      case 'calendar':
        return <CalendarApp isVisible={true} onClose={handleAppClose} />;

      // 11. File Manager - File browser and manager
      case 'files':
      case 'filemanager':
        return <FileManagerApp isVisible={true} onClose={handleAppClose} />;

      // 12. Recipe Book - Cooking recipes and meal planning
      case 'recipes':
      case 'recipebook':
        return <RecipeBookApp isVisible={true} onClose={handleAppClose} />;

      // 13. Translator - Language translation
      case 'translator':
      case 'translate':
        return <LanguageTranslatorApp isVisible={true} onClose={handleAppClose} />;

      // 14. Whiteboard - Drawing and sketching
      case 'whiteboard':
      case 'draw':
        return <WhiteboardApp isVisible={true} onClose={handleAppClose} />;

      // 15. Dairy Farm Manager ⭐ - Comprehensive farm management
      case 'dairyfarm':
      case 'farm':
      case 'dairy':
        return <DairyFarmManagerApp isVisible={true} onClose={handleAppClose} />;

      // Tuition Marketplace (Special - will be in navbar)
      case 'tuition':
      case 'tuitionmarketplace':
      case 'education':
        return <TuitionMarketplaceApp isVisible={true} onClose={handleAppClose} />;

      // Design System Showcase
      case 'design-system':
      case 'showcase':
      case 'demo':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>🎨 Design System Showcase</h2>
            <p>The design system showcase is temporarily unavailable.</p>
            <p>Please check the documentation files for more information.</p>
          </div>
        );

      default:
        return null;
    }
  }, [activeApp]);

  if (!activeApp) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="miniapp-backdrop" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease'
        }}
      />
      
      {/* Dropdown Container */}
      <div
        className={`miniapp-dropdown ${isFullscreen ? 'fullscreen' : ''}`}
        style={{
          position: 'fixed',
          top: isFullscreen ? '0' : '64px',
          left: isFullscreen ? '0' : '50%',
          width: isFullscreen ? '100vw' : '90vw',
          height: isFullscreen ? '100vh' : 'auto',
          maxWidth: isFullscreen ? 'none' : '800px',
          maxHeight: isFullscreen ? 'none' : 'calc(100vh - 80px)',
          background: 'var(--bg, #ffffff)',
          border: isFullscreen ? 'none' : '1px solid var(--border, #e0e0e0)',
          borderRadius: isFullscreen ? '0' : '16px',
          boxShadow: isFullscreen ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          overflow: 'hidden',
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border, #e0e0e0)',
            background: 'var(--surface, #f8f9fa)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            {getAppTitle(activeApp)}
          </h3>
          
          {/* Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleColorMode}
              title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                color: 'var(--muted, #666)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover, #f0f0f0)';
                e.currentTarget.style.color = 'var(--fg, #000)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--muted, #666)';
              }}
            >
              {colorMode === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                color: 'var(--muted, #666)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover, #f0f0f0)';
                e.currentTarget.style.color = 'var(--fg, #000)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--muted, #666)';
              }}
            >
              {isFullscreen ? '⊖' : '⊞'}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close mini app"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                color: 'var(--muted, #666)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hover, #f0f0f0)';
                e.currentTarget.style.color = 'var(--fg, #000)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--muted, #666)';
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="miniapp-content-wrapper miniapp-force-static"
          style={{
            padding: '1.5rem',
            maxHeight: isFullscreen ? 'calc(100vh - 80px)' : 'calc(100vh - 160px)',
            height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
            overflowY: 'auto',
            position: 'relative'
          }}
        >
          <div className="miniapp-content-container">
            {activeAppComponent}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        .miniapp-dropdown {
          --bg: #ffffff;
          --surface: #f8f9fa;
          --border: #e0e0e0;
          --fg: #000000;
          --muted: #666666;
          --hover: #f0f0f0;
          --accent: #007bff;
          --primary: #28a745;
        }
        
        [data-theme='dark'] .miniapp-dropdown {
          --bg: #1a1a1a;
          --surface: #2a2a2a;
          --border: #404040;
          --fg: #ffffff;
          --muted: #888888;
          --hover: #333333;
          --accent: #007bff;
          --primary: #28a745;
        }
        
        /* Ensure all mini apps inherit the CSS variables */
        .miniapp-content-wrapper {
          --bg: #ffffff;
          --surface: #f8f9fa;
          --border: #e0e0e0;
          --fg: #000000;
          --muted: #666666;
          --hover: #f0f0f0;
          --accent: #007bff;
          --primary: #28a745;
        }
        
        [data-theme='dark'] .miniapp-content-wrapper {
          --bg: #1a1a1a;
          --surface: #2a2a2a;
          --border: #404040;
          --fg: #ffffff;
          --muted: #888888;
          --hover: #333333;
          --accent: #007bff;
          --primary: #28a745;
        }
        
        /* Override individual app positioning for mini bar integration */
        .miniapp-content-wrapper :global(.miniapp-integration) {
          position: static !important;
          background: none !important;
          backdrop-filter: none !important;
          z-index: auto !important;
          animation: none !important;
          border: none !important;
          border-radius: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          transform: none !important;
        }
        
        .miniapp-content-wrapper :global(.miniapp-overlay.miniapp-integration) {
          position: static !important;
          background: none !important;
          backdrop-filter: none !important;
          z-index: auto !important;
          animation: none !important;
        }
        
        .miniapp-content-wrapper :global(.miniapp-container.miniapp-integration) {
          position: static !important;
          background: none !important;
          border: none !important;
          border-radius: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          animation: none !important;
          transform: none !important;
        }
        
        .miniapp-content-wrapper :global(.miniapp-header.miniapp-integration) {
          display: none !important;
        }
        
        .miniapp-content-wrapper :global(.nothing-calculator.miniapp-integration) {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          max-height: none !important;
          border: none !important;
          box-shadow: none !important;
          animation: none !important;
        }
      `}</style>
    </>
  );
}