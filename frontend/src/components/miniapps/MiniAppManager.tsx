'use client';

import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { useModernTheme } from '@/contexts/ModernThemeContext';

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
    demo: '🎨 Mini Apps Demo',
  };

  return titles[appId] || '📱 Mini App';
}

export default function MiniAppManager({
  activeApp,
  onClose,
}: MiniAppManagerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { colors, colorMode, toggleMode } = useModernTheme();
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
        return (
          <LanguageTranslatorApp isVisible={true} onClose={handleAppClose} />
        );

      // 14. Whiteboard - Drawing and sketching
      case 'whiteboard':
      case 'draw':
        return <WhiteboardApp isVisible={true} onClose={handleAppClose} />;

      // 15. Dairy Farm Manager ⭐ - Comprehensive farm management
      case 'dairyfarm':
      case 'farm':
      case 'dairy':
        return (
          <DairyFarmManagerApp isVisible={true} onClose={handleAppClose} />
        );

      // Tuition Marketplace (Special - will be in navbar)
      case 'tuition':
      case 'tuitionmarketplace':
      case 'education':
        return (
          <TuitionMarketplaceApp isVisible={true} onClose={handleAppClose} />
        );

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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9999,
          opacity: 1,
          transition: 'opacity 0.2s ease-out',
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
          maxWidth: isFullscreen ? 'none' : '900px',
          maxHeight: isFullscreen ? 'none' : 'calc(100vh - 80px)',
          marginLeft: isFullscreen ? '0' : '-45vw',
          background: colors.surface,
          border: isFullscreen ? 'none' : `1px solid ${colors.border}`,
          borderRadius: isFullscreen ? '0' : '24px',
          boxShadow: isFullscreen ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          overflow: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          isolation: 'isolate',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${colors.border}`,
            background: `linear-gradient(135deg, ${colors.surfaceElevated}, ${colors.surface})`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: colors.text }}>
            {getAppTitle(activeApp)}
          </h3>

          {/* Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleMode}
              className="miniapp-header-btn"
              title={`Current mode: ${colorMode}${colorMode === 'auto' ? ' (click to cycle)' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                color: colors.textSecondary,
                transition: 'background 0.15s ease, color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {colorMode === 'dark' ? '🌙' : colorMode === 'light' ? '☀️' : '🌍'}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="miniapp-header-btn"
              title={
                isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'
              }
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                color: colors.textSecondary,
                transition: 'background 0.15s ease, color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? '⊖' : '⊞'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="miniapp-close-btn"
              title="Close mini app"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
                color: colors.textSecondary,
                transition: 'background 0.15s ease, color 0.15s ease',
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
            maxHeight: isFullscreen
              ? 'calc(100vh - 80px)'
              : 'calc(100vh - 160px)',
            height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <div className="miniapp-content-container">{activeAppComponent}</div>
        </div>
      </div>

      <style jsx>{`
        .miniapp-backdrop {
          animation: backdropFadeIn 0.2s ease-out;
        }

        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .miniapp-dropdown:not(.fullscreen) {
          animation: dropdownFadeIn 0.2s ease-out;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .miniapp-dropdown.fullscreen {
          animation: fullscreenFadeIn 0.2s ease-out;
        }

        @keyframes fullscreenFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .miniapp-dropdown {
          --bg: ${colors.background};
          --surface: ${colors.surface};
          --border: ${colors.border};
          --fg: ${colors.text};
          --muted: ${colors.textSecondary};
          --hover: ${colors.hover};
          --accent: ${colors.accent};
          --primary: ${colors.primary};
          transform: translateZ(0);
        }

        /* Header button hover states */
        .miniapp-header-btn:hover {
          background: ${colors.hover} !important;
          color: ${colors.text} !important;
        }

        .miniapp-close-btn:hover {
          background: ${colors.error}20 !important;
          color: ${colors.error} !important;
        }

        .miniapp-header-btn,
        .miniapp-close-btn {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Ensure all mini apps inherit the CSS variables */
        .miniapp-content-wrapper {
          --bg: ${colors.background};
          --surface: ${colors.surface};
          --border: ${colors.border};
          --fg: ${colors.text};
          --muted: ${colors.textSecondary};
          --hover: ${colors.hover};
          --accent: ${colors.accent};
          --primary: ${colors.primary};
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .miniapp-content-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .miniapp-content-wrapper::-webkit-scrollbar-track {
          background: ${colors.surfaceElevated};
          border-radius: 4px;
        }

        .miniapp-content-wrapper::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 4px;
        }

        .miniapp-content-wrapper::-webkit-scrollbar-thumb:hover {
          background: ${colors.textTertiary};
        }

        .miniapp-content-container {
          min-height: 100%;
          display: flex;
          flex-direction: column;
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

        .miniapp-content-wrapper
          :global(.miniapp-container.miniapp-integration) {
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

        .miniapp-content-wrapper
          :global(.nothing-calculator.miniapp-integration) {
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
