'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  'ctrl+n': () => void; // New conversation
  'ctrl+k': () => void; // Search conversations
  'ctrl+e': () => void; // Export conversation
  'ctrl+d': () => void; // Delete conversation
  'ctrl+b': () => void; // Toggle bookmark
  'ctrl+/': () => void; // Show shortcuts help
  escape: () => void; // Close modals/panels
  'ctrl+enter': () => void; // Send message
  'ctrl+shift+c': () => void; // Clear conversation
  'ctrl+shift+s': () => void; // Open settings
  'ctrl+1': () => void; // Switch to conversation 1
  'ctrl+2': () => void; // Switch to conversation 2
  'ctrl+3': () => void; // Switch to conversation 3
  'ctrl+4': () => void; // Switch to conversation 4
  'ctrl+5': () => void; // Switch to conversation 5
}

export function useKeyboardShortcuts(
  shortcuts: Partial<KeyboardShortcuts>,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow Ctrl+Enter in textareas for sending messages
        if (event.ctrlKey && event.key === 'Enter' && shortcuts['ctrl+enter']) {
          event.preventDefault();
          shortcuts['ctrl+enter']();
        }
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      if (alt) shortcut += 'alt+';
      shortcut += key;

      // Handle number keys for conversation switching
      if (ctrl && !shift && !alt && /^[1-5]$/.test(key)) {
        const numberShortcut = `ctrl+${key}` as keyof KeyboardShortcuts;
        if (shortcuts[numberShortcut]) {
          event.preventDefault();
          shortcuts[numberShortcut]();
          return;
        }
      }

      // Handle other shortcuts
      const handler = shortcuts[shortcut as keyof KeyboardShortcuts];
      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  // Return available shortcuts for help display
  const getShortcutHelp = useCallback(() => {
    return [
      { key: 'Ctrl+N', description: 'New conversation' },
      { key: 'Ctrl+K', description: 'Search conversations' },
      { key: 'Ctrl+E', description: 'Export conversation' },
      { key: 'Ctrl+D', description: 'Delete conversation' },
      { key: 'Ctrl+B', description: 'Toggle bookmark' },
      { key: 'Ctrl+/', description: 'Show shortcuts help' },
      { key: 'Escape', description: 'Close modals/panels' },
      { key: 'Ctrl+Enter', description: 'Send message' },
      { key: 'Ctrl+Shift+C', description: 'Clear conversation' },
      { key: 'Ctrl+Shift+S', description: 'Open settings' },
      { key: 'Ctrl+1-5', description: 'Switch to conversation 1-5' },
    ];
  }, []);

  return { getShortcutHelp };
}
