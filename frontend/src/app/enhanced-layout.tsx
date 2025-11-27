'use client';

import React from 'react';
import { EnhancedThemeProvider } from '@/contexts/EnhancedThemeContext';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import EnhancedFooter from '@/components/EnhancedFooter';
import { useNavigation } from '@/components/navigation/NavigationProvider';

interface EnhancedLayoutProps {
  children: React.ReactNode;
}

export default function EnhancedLayout({ children }: EnhancedLayoutProps) {
  const { navigate } = useNavigation();

  const handleOpenMiniApp = (appName: string) => {
    // Handle mini app opening logic
    console.log('Opening mini app:', appName);
    // You can dispatch events or call specific handlers here
    window.dispatchEvent(new CustomEvent('openMiniApp', { detail: appName }));
  };

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <EnhancedThemeProvider>
      <div className="enhanced-app">
        {/* Enhanced Navigation */}
        <EnhancedNavigation onOpenMiniApp={handleOpenMiniApp} />
        
        {/* Main Content */}
        <main className="enhanced-main">
          {children}
        </main>
        
        {/* Enhanced Footer */}
        <EnhancedFooter onNavigate={handleNavigation} />

        <style jsx>{`
          .enhanced-app {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: var(--color-background);
            color: var(--color-textPrimary);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .enhanced-main {
            flex: 1;
            padding-top: var(--spacing-lg);
            animation: fadeInUp var(--duration-slow) var(--ease-out);
          }

          /* Global animation keyframes */
          :global(@keyframes fadeInUp) {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          :global(@keyframes ripple) {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          :global(@keyframes shimmer) {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          :global(@keyframes float) {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          :global(@keyframes pulse) {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          :global(@keyframes glow) {
            0%, 100% {
              box-shadow: var(--shadow-md);
            }
            50% {
              box-shadow: var(--shadow-xl), var(--color-glow);
            }
          }

          /* Theme transition class */
          :global(.theme-transitioning) {
            transition: 
              background-color var(--duration-slow) var(--ease-out),
              color var(--duration-slow) var(--ease-out),
              border-color var(--duration-slow) var(--ease-out);
          }

          :global(.theme-transitioning *) {
            transition: 
              background-color var(--duration-slow) var(--ease-out),
              color var(--duration-slow) var(--ease-out),
              border-color var(--duration-slow) var(--ease-out);
          }

          /* Accessibility improvements */
          :global(.focus-ring:focus-visible) {
            outline: 3px solid var(--color-focus);
            outline-offset: 2px;
            border-radius: var(--radius-sm);
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            :global(.focus-ring:focus-visible) {
              outline-width: 4px;
              outline-offset: 3px;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .enhanced-app,
            .enhanced-main,
            :global(*) {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* Performance optimizations */
          .enhanced-app {
            contain: layout style;
          }

          .enhanced-main {
            contain: layout style paint;
          }
        `}</style>
      </div>
    </EnhancedThemeProvider>
  );
}