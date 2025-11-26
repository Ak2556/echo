/**
 * Accessibility Toggle Button
 * Provides quick access to accessibility panel
 */

'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import { useAccessibilityContext } from '@/components/AccessibilityProvider';

export default function AccessibilityToggle() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { announce } = useAccessibilityContext();

  const togglePanel = () => {
    const newState = !isPanelOpen;
    setIsPanelOpen(newState);
    announce(
      newState ? 'Accessibility panel opened' : 'Accessibility panel closed',
      'polite'
    );
  };

  return (
    <>
      <Button
        onClick={togglePanel}
        variant="outline"
        className="fixed bottom-20 right-4 z-40 rounded-full w-12 h-12 p-0"
        style={{
          background: 'rgba(var(--nothing-glyph-rgb), 0.1)',
          border: '1px solid rgba(var(--nothing-glyph-rgb), 0.3)',
          color: 'var(--nothing-glyph)',
        }}
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt+A)"
      >
        ♿
      </Button>

      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
