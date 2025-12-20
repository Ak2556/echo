'use client';

import React, { ReactNode, useMemo } from 'react';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { LanguageProvider } from './LanguageContext';
import { UserProvider } from './UserContext';
import { BackgroundProvider } from './BackgroundContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import AccessibilityProvider from '@/components/AccessibilityProvider';

interface CombinedProviderProps {
  children: ReactNode;
}

// Memoized provider wrapper to prevent unnecessary re-renders
const MemoizedProviderWrapper = React.memo(
  ({ children }: { children: ReactNode }) => {
    return (
      <AccessibilityProvider>
        <ThemeProvider>
          <BackgroundProvider>
            <SettingsProvider>
              <ToastProvider>
                <UserProvider>
                  <LanguageProvider>
                    <CartProvider>
                      <WishlistProvider>{children}</WishlistProvider>
                    </CartProvider>
                  </LanguageProvider>
                </UserProvider>
              </ToastProvider>
            </SettingsProvider>
          </BackgroundProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    );
  }
);

MemoizedProviderWrapper.displayName = 'MemoizedProviderWrapper';

// Combined provider with performance optimizations
export function CombinedProvider({ children }: CombinedProviderProps) {
  // Memoize the provider tree to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => children, [children]);

  return <MemoizedProviderWrapper>{memoizedChildren}</MemoizedProviderWrapper>;
}

// Alternative: Lightweight provider for specific use cases
export function LightweightProvider({ children }: CombinedProviderProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>{children}</UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

// Provider for authentication pages
export function AuthProvider({ children }: CombinedProviderProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>{children}</ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default CombinedProvider;
