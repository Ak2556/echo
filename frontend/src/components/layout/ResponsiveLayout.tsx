/**
 * @fileoverview Responsive Layout Component
 * @description Adaptive layout that responds to different screen sizes
 * @version 2.0.0
 */

'use client';

import React, { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { BottomNav } from '../navigation/BottomNav';
import { spacing } from '@/lib/design-system';

interface ResponsiveLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

export function ResponsiveLayout({
  children,
  header,
  sidebar,
  className = '',
  showBottomNav = true,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div
      className={className}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header - visible on all screen sizes */}
      {header}

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
        }}
      >
        {/* Sidebar - only visible on desktop */}
        {sidebar && !isMobile && !isTablet && (
          <aside
            className="sidebar"
            style={{
              width: '260px',
              flexShrink: 0,
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              position: 'sticky',
              top: '64px', // Height of header
              height: 'calc(100vh - 64px)',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main
          id="main"
          role="main"
          style={{
            flex: 1,
            width: '100%',
            minWidth: 0, // Prevent flex overflow
            overflowX: 'hidden',
            paddingBottom: isMobile ? '80px' : spacing[6], // Space for bottom nav on mobile
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom Navigation - only on mobile */}
      {showBottomNav && isMobile && <BottomNav />}
    </div>
  );
}

export default ResponsiveLayout;