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

// Dynamic imports for better performance
const SimpleHeader = dynamic(() => import('./SimpleHeader'), {
  loading: () => (
    <div className="h-16 bg-gray-100 dark:bg-gray-900 animate-pulse" />
  ),
});
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

  // Mobile-responsive header
  const enhancedHeader =
    isMobile || isTablet ? (
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
    ) : (
      <SimpleHeader
        currentRoute={currentRoute}
        setCurrentRoute={navigate}
        onOpenMiniApp={onOpenMiniApp}
      />
    );

  // Sidebar content (can be customized)
  const sidebar = (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
      <nav className="space-y-2">
        {[
          { route: 'feed', label: 'Social Feed', icon: '🏠' },
          { route: 'discover', label: 'Discover', icon: '🔍' },
          { route: 'messages', label: 'Messages', icon: '💬' },
          { route: 'profile', label: 'Profile', icon: '👤' },
        ].map((item) => (
          <button
            key={item.route}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('navigate', { detail: item.route })
              )
            }
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentRoute === item.route
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <ResponsiveLayout header={enhancedHeader} className="min-h-screen">
      <div
        className={
          currentRoute === 'feed' || currentRoute === 'messages' ? '' : 'p-6'
        }
      >
        {renderContent()}
      </div>

      {/* AI Chat - Floating */}
      <Suspense fallback={null}>
        <AiChat />
      </Suspense>
    </ResponsiveLayout>
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
