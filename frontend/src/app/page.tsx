'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  Suspense,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
// Import MainApp with error handling
import MainApp from '@/components/MainApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthGuard from '@/components/AuthGuard';

// Dynamic imports for better performance with error handling
const Background3D = dynamic(
  () =>
    import('@/components/Background3D').catch(() => ({ default: () => null })),
  {
    ssr: false,
    loading: () => null,
  }
);
const Footer = dynamic(
  () =>
    import('@/components/footer/ImprovedFooter').then((mod) => ({
      default: mod.ImprovedFooter,
    })),
  {
    loading: () => (
      <div className="h-16 bg-gray-100 dark:bg-gray-900 animate-pulse" />
    ),
  }
);
const SimpleMiniApps = dynamic(
  () =>
    import('@/components/SimpleMiniApps').catch(() => ({
      default: () => null,
    })),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);
const WelcomeOnboarding = dynamic(
  () =>
    import('@/components/WelcomeOnboarding').catch(() => ({
      default: () => null,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function Home() {
  const { theme } = useTheme();
  const [activeMiniApp, setActiveMiniApp] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOpenMiniApp = useCallback((appName: string) => {
    setActiveMiniApp(appName);
  }, []);

  const handleCloseMiniApp = useCallback(() => {
    setActiveMiniApp(null);
  }, []);

  // Listen for custom events from Footer to open mini apps
  useEffect(() => {
    const handleOpenMiniAppEvent = (event: CustomEvent) => {
      const appName = event.detail;
      if (appName) {
        setActiveMiniApp(appName);
      }
    };

    window.addEventListener('openMiniApp' as any, handleOpenMiniAppEvent);
    return () =>
      window.removeEventListener('openMiniApp' as any, handleOpenMiniAppEvent);
  }, []);

  const appStyles = useMemo(
    () => ({
      minHeight: '100vh',
      position: 'relative' as const,
      background: 'transparent',
      color: 'var(--fg)',
      zIndex: 0,
    }),
    []
  );

  return (
    <AuthGuard>
      <ErrorBoundary>
        <CartProvider>
          <WishlistProvider>
            {/* Global 3D Background - truly global positioning */}
            <Suspense fallback={null}>
              <Background3D />
            </Suspense>

            <div className={`app ${theme}-app`} style={appStyles}>
              {/* Main Application */}
              <ErrorBoundary
                fallback={
                  <div className="p-8 text-center">
                    <h2>Main App Error</h2>
                    <p>Please refresh the page</p>
                  </div>
                }
              >
                <MainApp onOpenMiniApp={handleOpenMiniApp} />
              </ErrorBoundary>

              {/* Simple Mini Apps */}
              <ErrorBoundary fallback={null}>
                <Suspense fallback={<LoadingSpinner />}>
                  <SimpleMiniApps
                    activeApp={activeMiniApp}
                    onClose={handleCloseMiniApp}
                  />
                </Suspense>
              </ErrorBoundary>

              {/* Footer */}
              <ErrorBoundary
                fallback={<div className="h-16 bg-gray-100 dark:bg-gray-900" />}
              >
                <Suspense
                  fallback={
                    <div className="h-16 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                  }
                >
                  <Footer />
                </Suspense>
              </ErrorBoundary>

              {/* Welcome Onboarding for new users */}
              {showOnboarding && (
                <ErrorBoundary fallback={null}>
                  <Suspense fallback={null}>
                    <WelcomeOnboarding
                      onComplete={() => setShowOnboarding(false)}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
            </div>
          </WishlistProvider>
        </CartProvider>
      </ErrorBoundary>
    </AuthGuard>
  );
}
