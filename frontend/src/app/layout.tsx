import type { Metadata } from 'next';
import './globals.css';
import '@/styles/echo-brand.css';
import '@/styles/enhanced-dark-mode.css';
import '@/styles/social-media-hub.css';
import '@/styles/design-system.css';
import Background3D from '@/components/Background3D';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { EnhancedThemeProvider } from '@/contexts/EnhancedThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import ClientLanguageProvider from '@/components/ClientLanguageProvider';
import { UserProvider } from '@/contexts/UserContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import AccessibilityProvider from '@/components/AccessibilityProvider';
import ToastContainer from '@/components/ToastContainer';
import { QueryProvider } from '@/providers/QueryProvider';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAUpdateNotification from '@/components/PWAUpdateNotification';
import PWAInit from '@/app/pwa-init';
import MonitoringDashboard from '@/components/MonitoringDashboard';
import AnalyticsInit from '@/app/analytics-init';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeWrapper from '@/components/ThemeWrapper';
import { Suspense } from 'react';

// Force dynamic rendering for all pages to prevent SSR/static generation errors with context providers
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata: Metadata = {
  title: 'Echo - Advanced Social Platform',
  description:
    'Advanced social platform with AI companion, mini-apps, and comprehensive data structures',
  keywords:
    'social media, AI companion, mini apps, data structures, algorithms, progressive web app',
  authors: [{ name: 'Echo Team' }],
  creator: 'Echo Team',
  publisher: 'Echo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Echo - Advanced Social Platform',
    description:
      'Advanced social platform with AI companion, mini-apps, and comprehensive data structures',
    url: '/',
    siteName: 'Echo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo - Advanced Social Platform',
    description:
      'Advanced social platform with AI companion, mini-apps, and comprehensive data structures',
    creator: '@echo_app',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Echo',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Echo',
    'application-name': 'Echo',
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Echo</title>
      </head>
      <body>
        <AccessibilityProvider>
          <QueryProvider>
            <EnhancedThemeProvider>
              <ThemeProvider>
                <ThemeWrapper>
                  <BackgroundProvider>
                  <SettingsProvider>
                    <ToastProvider>
                      <UserProvider>
                        <ClientLanguageProvider>
                          <div
                            id="bg3d"
                            className="background-3d"
                            aria-hidden="true"
                          >
                            <Background3D />
                          </div>
                          <a
                            href="#main"
                            className="skip-link"
                            style={{
                              position: 'absolute',
                              left: '-9999px',
                              top: 'auto',
                              width: '1px',
                              height: '1px',
                              overflow: 'hidden',
                            }}
                          >
                            Skip to content
                          </a>
                          {children}
                          <ToastContainer />
                          <AnalyticsInit />
                          <PWAInit />
                          <PWAInstallPrompt />
                          <PWAUpdateNotification />
                          <ErrorBoundary>
                            <MonitoringDashboard />
                          </ErrorBoundary>
                          <AccessibilityToggle />
                        </ClientLanguageProvider>
                      </UserProvider>
                    </ToastProvider>
                  </SettingsProvider>
                  </BackgroundProvider>
                </ThemeWrapper>
              </ThemeProvider>
            </EnhancedThemeProvider>
          </QueryProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
