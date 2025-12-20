/**
 * React hooks for accessibility management and monitoring
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AccessibilityEnhancer,
  AccessibilityReport,
  ScreenReaderOptimizer,
} from '@/utils/accessibility';

/**
 * Hook for managing accessibility enhancements
 */
export function useAccessibility() {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeAccessibility = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const accessibilityReport =
        await AccessibilityEnhancer.analyzeAccessibility();
      setReport(accessibilityReport);
    } catch (error) {
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const enhanceAccessibility = useCallback(() => {
    AccessibilityEnhancer.enhance();
  }, []);

  useEffect(() => {
    // Auto-enhance on mount
    enhanceAccessibility();
  }, [enhanceAccessibility]);

  return {
    report,
    isAnalyzing,
    analyzeAccessibility,
    enhanceAccessibility,
  };
}

/**
 * Hook for managing focus within a component
 */
export function useFocusManagement() {
  const containerRef = useRef<HTMLElement>(null);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }, []);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const firstFocusable = containerRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    firstFocusable?.focus();
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    lastFocusable?.focus();
  }, []);

  return {
    containerRef,
    trapFocus,
    focusFirst,
    focusLast,
  };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReader() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      ScreenReaderOptimizer.announce(message, priority);
    },
    []
  );

  const announceNavigation = useCallback(
    (pageName: string) => {
      announce(`Navigated to ${pageName}`, 'polite');
    },
    [announce]
  );

  const announceError = useCallback(
    (error: string) => {
      announce(`Error: ${error}`, 'assertive');
    },
    [announce]
  );

  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Success: ${message}`, 'polite');
    },
    [announce]
  );

  return {
    announce,
    announceNavigation,
    announceError,
    announceSuccess,
  };
}

/**
 * Hook for keyboard shortcuts management
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };

      // Build shortcut string
      const modifierKeys = [];
      if (modifiers.ctrl) modifierKeys.push('ctrl');
      if (modifiers.alt) modifierKeys.push('alt');
      if (modifiers.shift) modifierKeys.push('shift');
      if (modifiers.meta) modifierKeys.push('meta');

      const shortcutString = [...modifierKeys, key].join('+');

      if (shortcuts[shortcutString]) {
        event.preventDefault();
        shortcuts[shortcutString]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreference = (mq: MediaQueryList | MediaQueryListEvent) => {
      setPrefersReducedMotion(mq.matches);
    };

    updatePreference(mediaQuery);
    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for high contrast preferences
 */
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const updatePreference = (mq: MediaQueryList | MediaQueryListEvent) => {
      setPrefersHighContrast(mq.matches);
    };

    updatePreference(mediaQuery);
    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersHighContrast;
}

/**
 * Hook for managing ARIA live regions
 */
export function useLiveRegion() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announceToRegion = useCallback(
    (newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
      setMessage(newMessage);
      setPriority(newPriority);

      // Clear message after announcement
      setTimeout(() => {
        setMessage('');
      }, 1000);
    },
    []
  );

  return {
    message,
    priority,
    announceToRegion,
  };
}

/**
 * Hook for managing modal accessibility
 */
export function useModal(isOpen: boolean) {
  const modalRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      firstFocusable?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Add aria-hidden to body
      const bodyChildren = Array.from(document.body.children).filter(
        (child) =>
          child !== modalRef.current && !child.contains(modalRef.current!)
      );

      bodyChildren.forEach((child) => {
        child.setAttribute('aria-hidden', 'true');
      });
    } else {
      // Restore focus
      previousFocusRef.current?.focus();

      // Restore body scroll
      document.body.style.overflow = '';

      // Remove aria-hidden from body
      document.querySelectorAll('[aria-hidden="true"]').forEach((element) => {
        element.removeAttribute('aria-hidden');
      });
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.querySelectorAll('[aria-hidden="true"]').forEach((element) => {
        element.removeAttribute('aria-hidden');
      });
    };
  }, [isOpen]);

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        // Modal should handle its own close logic
        event.stopPropagation();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  return {
    modalRef,
  };
}

/**
 * Hook for accessible form validation
 */
export function useAccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announceError } = useScreenReader();

  const validateField = useCallback(
    (name: string, value: any, rules: any) => {
      // Simple validation logic
      const fieldErrors: string[] = [];

      if (rules.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push('This field is required');
      }

      if (
        rules.minLength &&
        value &&
        value.toString().length < rules.minLength
      ) {
        fieldErrors.push(`Minimum length is ${rules.minLength} characters`);
      }

      if (
        rules.maxLength &&
        value &&
        value.toString().length > rules.maxLength
      ) {
        fieldErrors.push(`Maximum length is ${rules.maxLength} characters`);
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        fieldErrors.push('Invalid format');
      }

      const errorMessage = fieldErrors.join(', ');

      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));

      if (errorMessage) {
        announceError(`${name}: ${errorMessage}`);
      }

      return errorMessage === '';
    },
    [announceError]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldProps = useCallback(
    (name: string) => ({
      'aria-invalid': errors[name] ? 'true' : 'false',
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }),
    [errors]
  );

  return {
    errors,
    validateField,
    clearErrors,
    getFieldProps,
  };
}
