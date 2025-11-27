/**
 * @fileoverview Main Application Component
 * @description Core application shell that manages routing, navigation, and page rendering
 * @version 1.0.0
 * @author Echo Team
 */

'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  NavigationProvider,
  useNavigation,
} from './navigation/NavigationProvider';
import ResponsiveLayout from './layout/ResponsiveLayout';
import { NotificationProvider } from './notifications/NotificationCenter';
import NotificationBell from './NotificationBell';
import GlobalSearch from './search/GlobalSearch';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { useTiltCards } from '@/hooks/useTiltCards';
import { useResponsive } from '@/hooks/useResponsive';
import { MobileNav } from './navigation/MobileNav';
import { FeedSkeleton, PageSkeleton } from './ui/Skeleton';
import { NavigationRail } from './navigation/NavigationRail';

// Dynamic imports for better performance
const SocialMediaHub = dynamic(() => import('./SocialMediaHub'), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
});
const FeedPage = dynamic(() => import('./FeedPage'));
const DiscoverPage = dynamic(() => import('./DiscoverPage'));
const ShopPage = dynamic(() => import('./ShopPage'));
const TuitionPage = dynamic(() => import('./TuitionPage'));
const LivePage = dynamic(() => import('./LivePage'));
const MessagesPage = dynamic(() => import('./ProductionMessagesPage'));
const SettingsPage = dynamic(() => import('./SettingsPage'));
const ProfilePage = dynamic(() => import('./ProfilePage'));
const AiChat = dynamic(() => import('./AiChat'), {
  ssr: false,
  loading: () => null,
});

/**
 * Props for the MainApp component
 */
interface MainAppProps {
  /** Callback function to handle mini app opening */
  onOpenMiniApp: (appName: string) => void;
}

/**
 * MainApp Component
 *
 * @description The main application shell that provides:
 * - Client-side routing between different pages (feed, discover, live, messages, settings, profile)
 * - Application header with navigation
 * - Tilt card interactions for enhanced UX
 * - AI chat integration
 * - Responsive layout and theming support
 *
 * @param {MainAppProps} props - Component props
 * @param {function} props.onOpenMiniApp - Callback to open mini applications
 *
 * @returns {JSX.Element} The main application shell
 *
 * @example
 * ```tsx
 * <MainApp onOpenMiniApp={(appName) => console.log(`Opening ${appName}`)} />
 * ```
 *
 * @since 1.0.0
 */
// Enhanced Main App Content Component
function MainAppContent({ onOpenMiniApp }: MainAppProps) {
  const { currentRoute, navigate } = useNavigation();
  const { isMobile, isTablet } = useResponsive();

  // Initialize tilt card interactions only for non-profile pages
  // Disabled to prevent unwanted zoom effects
  // useTiltCards();

  /**
   * Renders the appropriate page content based on current route
   */
  const renderContent = () => {
    const pageContent = (() => {
      switch (currentRoute) {
        case 'feed':
          return <SocialMediaHub />;
        case 'discover':
          return <DiscoverPage />;
        case 'shop':
          return <ShopPage />;
        case 'tuition':
          return <TuitionPage />;
        case 'live':
          return <LivePage />;
        case 'messages':
          return <MessagesPage />;
        case 'settings':
          return <SettingsPage />;
        case 'profile':
          return <ProfilePage />;
        default:
          return <SocialMediaHub />;
      }
    })();

    // Use FeedSkeleton for feed page, PageSkeleton for others
    const fallback =
      currentRoute === 'feed' ? <FeedSkeleton count={2} /> : <PageSkeleton />;

    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>{pageContent}</Suspense>
      </ErrorBoundary>
    );
  };

  // Mobile-only header
  const mobileHeader = (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(var(--bg-rgb), 0.9)',
      }}
    >
      <MobileNav onOpenMiniApp={onOpenMiniApp} />
      <h1
        style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--accent), #9c44ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        📱 Echo Social
      </h1>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <NotificationBell />
        <GlobalSearch />
      </div>
    </header>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--echo-bg-primary)]">
      {/* Desktop Navigation Rail - Hidden on Mobile/Tablet */}
      {!isMobile && !isTablet && (
        <div className="flex-shrink-0">
          <NavigationRail
            activeRoute={currentRoute}
            onNavigate={navigate}
            unreadMessages={0}
            onOpenMiniApp={onOpenMiniApp}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Only show on mobile/tablet */}
        {(isMobile || isTablet) && mobileHeader}

        {/* Page Content with Wave Animation */}
        <main className="flex-1 overflow-y-auto">
          <div
            className={`echo-animate-wave-in ${
              currentRoute === 'feed' || currentRoute === 'messages' ? '' : 'p-6'
            }`}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      {/* AI Chat - Floating */}
      <Suspense fallback={null}>
        <AiChat />
      </Suspense>
    </div>
  );
}

export default function MainApp({ onOpenMiniApp }: MainAppProps) {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        <NotificationProvider>
          <MainAppContent onOpenMiniApp={onOpenMiniApp} />
        </NotificationProvider>
      </NavigationProvider>
    </ErrorBoundary>
  );
}
