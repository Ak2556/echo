/**
 * Accessibility Utilities for WCAG AAA Compliance
 * Provides comprehensive tools for accessibility testing and enhancement
 */

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: string[];
  compliance: {
    wcagA: boolean;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'major' | 'minor';
  element: string;
  description: string;
  recommendation: string;
  wcagReference: string;
}

export interface ColorContrastResult {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
  };
  foreground: string;
  background: string;
}

/**
 * Color contrast analysis for WCAG AAA compliance
 */
export class ContrastAnalyzer {
  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(
    hex: string
  ): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Check if contrast meets WCAG standards
   */
  static checkContrast(
    foreground: string,
    background: string,
    isLargeText = false
  ): ColorContrastResult {
    const ratio = this.getContrastRatio(foreground, background);

    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;

    return {
      ratio,
      passes: {
        aa: ratio >= aaThreshold,
        aaa: ratio >= aaaThreshold,
      },
      foreground,
      background,
    };
  }

  /**
   * Analyze all text elements for contrast compliance
   */
  static analyzePageContrast(): ColorContrastResult[] {
    const results: ColorContrastResult[] = [];
    const textElements = document.querySelectorAll(
      'p, h1, h2, h3, h4, h5, h6, span, a, button, label, input, textarea'
    );

    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const foreground = styles.color;
      const background =
        styles.backgroundColor || styles.background || '#ffffff';

      const isLargeText =
        parseFloat(styles.fontSize) >= 18 ||
        (parseFloat(styles.fontSize) >= 14 &&
          parseInt(styles.fontWeight) >= 700);

      const result = this.checkContrast(
        this.rgbToHex(foreground),
        this.rgbToHex(background),
        isLargeText
      );

      if (!result.passes.aaa) {
        results.push(result);
      }
    });

    return results;
  }

  /**
   * Convert RGB color to hex
   */
  private static rgbToHex(rgb: string): string {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#000000';

    const [r, g, b] = match.slice(0, 3).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

/**
 * Keyboard navigation analyzer and enhancer
 */
export class KeyboardNavigationAnalyzer {
  /**
   * Check if all interactive elements are keyboard accessible
   */
  static analyzeKeyboardAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    interactiveElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const tabIndex = element.getAttribute('tabindex');

      // Check if element is focusable
      if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
        issues.push({
          type: 'warning',
          severity: 'major',
          element: `${element.tagName}[${index}]`,
          description: 'Interactive element is not keyboard focusable',
          recommendation:
            'Remove tabindex="-1" or add proper keyboard event handlers',
          wcagReference: 'WCAG 2.1.1 (A)',
        });
      }

      // Check for visible focus indicator
      if (
        computedStyle.outlineStyle === 'none' &&
        !computedStyle.boxShadow.includes('inset')
      ) {
        issues.push({
          type: 'error',
          severity: 'critical',
          element: `${element.tagName}[${index}]`,
          description: 'No visible focus indicator',
          recommendation:
            'Add :focus-visible styles with clear visual indication',
          wcagReference: 'WCAG 2.4.7 (AA)',
        });
      }
    });

    return issues;
  }

  /**
   * Setup comprehensive keyboard navigation
   */
  static setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Skip link navigation
      if (
        event.key === 'Tab' &&
        !event.shiftKey &&
        event.target === document.body
      ) {
        const skipLink = document.querySelector('.skip-link') as HTMLElement;
        if (skipLink) {
          skipLink.style.position = 'static';
          skipLink.style.left = 'auto';
          skipLink.style.width = 'auto';
          skipLink.style.height = 'auto';
          skipLink.style.overflow = 'visible';
          skipLink.focus();
        }
      }

      // Modal/dialog escape handling
      if (event.key === 'Escape') {
        const activeModal = document.querySelector(
          '[role="dialog"]:not([hidden])'
        );
        if (activeModal) {
          const closeButton = activeModal.querySelector(
            '[aria-label*="close"], [aria-label*="dismiss"]'
          ) as HTMLElement;
          closeButton?.click();
        }
      }

      // Arrow key navigation for lists and menus
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      ) {
        const currentElement = event.target as HTMLElement;
        const parent = currentElement.closest(
          '[role="menu"], [role="listbox"], [role="tablist"]'
        );

        if (parent) {
          event.preventDefault();
          this.handleArrowNavigation(event.key, currentElement, parent);
        }
      }
    });
  }

  /**
   * Handle arrow key navigation within lists and menus
   */
  private static handleArrowNavigation(
    key: string,
    current: HTMLElement,
    container: Element
  ): void {
    const focusableElements = container.querySelectorAll(
      '[role="menuitem"], [role="option"], [role="tab"], button, a, input, select, textarea, [tabindex="0"]'
    );

    const currentIndex = Array.from(focusableElements).indexOf(current);
    let nextIndex: number;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex =
          currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    (focusableElements[nextIndex] as HTMLElement)?.focus();
  }
}

/**
 * ARIA attributes analyzer and validator
 */
export class ARIAAnalyzer {
  /**
   * Validate ARIA attributes usage
   */
  static validateARIA(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const elementsWithARIA = document.querySelectorAll(
      '[aria-label], [aria-labelledby], [aria-describedby], [role]'
    );

    elementsWithARIA.forEach((element, index) => {
      // Check for empty aria-label
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel === '') {
        issues.push({
          type: 'error',
          severity: 'major',
          element: `${element.tagName}[${index}]`,
          description: 'Empty aria-label attribute',
          recommendation:
            'Provide meaningful aria-label or remove the attribute',
          wcagReference: 'WCAG 4.1.2 (A)',
        });
      }

      // Check for valid aria-labelledby references
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      if (ariaLabelledby) {
        const referencedElement = document.getElementById(ariaLabelledby);
        if (!referencedElement) {
          issues.push({
            type: 'error',
            severity: 'major',
            element: `${element.tagName}[${index}]`,
            description: `aria-labelledby references non-existent element: ${ariaLabelledby}`,
            recommendation: 'Ensure referenced element exists or update the ID',
            wcagReference: 'WCAG 4.1.2 (A)',
          });
        }
      }

      // Check for valid roles
      const role = element.getAttribute('role');
      if (role && !this.isValidRole(role)) {
        issues.push({
          type: 'error',
          severity: 'major',
          element: `${element.tagName}[${index}]`,
          description: `Invalid ARIA role: ${role}`,
          recommendation: 'Use a valid ARIA role or remove the attribute',
          wcagReference: 'WCAG 4.1.2 (A)',
        });
      }
    });

    return issues;
  }

  /**
   * Check if ARIA role is valid
   */
  private static isValidRole(role: string): boolean {
    const validRoles = [
      'alert',
      'alertdialog',
      'application',
      'article',
      'banner',
      'button',
      'cell',
      'checkbox',
      'columnheader',
      'combobox',
      'complementary',
      'contentinfo',
      'definition',
      'dialog',
      'directory',
      'document',
      'feed',
      'figure',
      'form',
      'grid',
      'gridcell',
      'group',
      'heading',
      'img',
      'link',
      'list',
      'listbox',
      'listitem',
      'log',
      'main',
      'marquee',
      'math',
      'menu',
      'menubar',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'navigation',
      'none',
      'note',
      'option',
      'presentation',
      'progressbar',
      'radio',
      'radiogroup',
      'region',
      'row',
      'rowgroup',
      'rowheader',
      'scrollbar',
      'search',
      'searchbox',
      'separator',
      'slider',
      'spinbutton',
      'status',
      'switch',
      'tab',
      'table',
      'tablist',
      'tabpanel',
      'term',
      'textbox',
      'timer',
      'toolbar',
      'tooltip',
      'tree',
      'treegrid',
      'treeitem',
    ];
    return validRoles.includes(role);
  }

  /**
   * Add comprehensive ARIA labels to common elements
   * Note: Disabled to prevent hydration mismatches with SSR
   */
  static enhanceARIA(): void {
    // Disabled to prevent hydration mismatch issues
    // ARIA labels should be added directly in components if needed
    return;
  }
}

/**
 * Screen reader optimization utilities
 */
export class ScreenReaderOptimizer {
  /**
   * Optimize content for screen readers
   */
  static optimizeForScreenReaders(): void {
    // Add skip links if missing
    this.addSkipLinks();

    // Enhance headings structure
    this.enhanceHeadingStructure();

    // Add live regions for dynamic content
    this.setupLiveRegions();

    // Enhance form labels
    this.enhanceFormLabels();
  }

  /**
   * Add skip links for keyboard navigation
   */
  private static addSkipLinks(): void {
    const existingSkipLink = document.querySelector('.skip-link');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 999999;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 999999;
      `;
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        z-index: 999999;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Enhance heading structure for proper hierarchy
   * Note: Disabled to prevent hydration mismatches with SSR
   */
  private static enhanceHeadingStructure(): void {
    // Disabled to prevent hydration mismatch issues
    // IDs should be added directly in components if needed for navigation
    return;
  }

  /**
   * Setup ARIA live regions for dynamic content
   */
  private static setupLiveRegions(): void {
    // Status messages live region
    if (!document.getElementById('status-messages')) {
      const statusRegion = document.createElement('div');
      statusRegion.id = 'status-messages';
      statusRegion.setAttribute('aria-live', 'polite');
      statusRegion.setAttribute('aria-atomic', 'true');
      statusRegion.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(statusRegion);
    }

    // Alert messages live region
    if (!document.getElementById('alert-messages')) {
      const alertRegion = document.createElement('div');
      alertRegion.id = 'alert-messages';
      alertRegion.setAttribute('aria-live', 'assertive');
      alertRegion.setAttribute('aria-atomic', 'true');
      alertRegion.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(alertRegion);
    }
  }

  /**
   * Enhance form labels and descriptions
   * Note: Disabled to prevent hydration mismatches with SSR
   */
  private static enhanceFormLabels(): void {
    // Disabled to prevent hydration mismatch issues
    // Aria-labels should be added directly in components if needed
    return;
  }

  /**
   * Announce dynamic content changes
   */
  static announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const regionId =
      priority === 'assertive' ? 'alert-messages' : 'status-messages';
    const region = document.getElementById(regionId);

    if (region) {
      region.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }
}

/**
 * Main accessibility analyzer and enhancer
 */
export class AccessibilityEnhancer {
  /**
   * Run comprehensive accessibility analysis
   */
  static async analyzeAccessibility(): Promise<AccessibilityReport> {
    const issues: AccessibilityIssue[] = [];

    // Analyze color contrast
    const contrastResults = ContrastAnalyzer.analyzePageContrast();
    contrastResults.forEach((result) => {
      if (!result.passes.aaa) {
        issues.push({
          type: 'warning',
          severity: result.passes.aa ? 'minor' : 'major',
          element: 'Text element',
          description: `Insufficient color contrast: ${result.ratio.toFixed(2)}:1`,
          recommendation:
            'Increase contrast to meet WCAG AAA standard (7:1 for normal text, 4.5:1 for large text)',
          wcagReference: 'WCAG 1.4.6 (AAA)',
        });
      }
    });

    // Analyze keyboard accessibility
    const keyboardIssues =
      KeyboardNavigationAnalyzer.analyzeKeyboardAccessibility();
    issues.push(...keyboardIssues);

    // Analyze ARIA usage
    const ariaIssues = ARIAAnalyzer.validateARIA();
    issues.push(...ariaIssues);

    // Calculate compliance score
    const totalChecks = issues.length + 50; // Base score of 50 for comprehensive features
    const errorCount = issues.filter((i) => i.type === 'error').length;
    const warningCount = issues.filter((i) => i.type === 'warning').length;

    const score = Math.max(0, 100 - errorCount * 5 - warningCount * 2);

    const compliance = {
      wcagA: errorCount === 0,
      wcagAA: errorCount === 0 && warningCount <= 2,
      wcagAAA: issues.length === 0,
    };

    const recommendations = [
      'Ensure all interactive elements have visible focus indicators',
      'Maintain color contrast ratio of at least 7:1 for normal text',
      'Provide alternative text for all images',
      'Use semantic HTML elements and proper heading structure',
      'Test with keyboard-only navigation',
      'Test with screen reader software',
      'Provide captions for video content',
      'Ensure all form inputs have proper labels',
    ];

    return {
      score,
      issues,
      recommendations,
      compliance,
    };
  }

  /**
   * Apply comprehensive accessibility enhancements
   */
  static enhance(): void {
    // Setup keyboard navigation
    KeyboardNavigationAnalyzer.setupKeyboardNavigation();

    // Enhance ARIA attributes
    ARIAAnalyzer.enhanceARIA();

    // Optimize for screen readers
    ScreenReaderOptimizer.optimizeForScreenReaders();

    // Add focus management
    this.setupFocusManagement();

    // Add reduced motion support
    this.setupReducedMotion();
  }

  /**
   * Setup comprehensive focus management
   */
  private static setupFocusManagement(): void {
    // Focus trap for modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]:not([hidden])');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    });
  }

  /**
   * Setup reduced motion preferences
   */
  private static setupReducedMotion(): void {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updateMotionPreferences = (event: MediaQueryListEvent) => {
      document.documentElement.style.setProperty(
        '--motion-preference',
        event.matches ? 'reduce' : 'no-preference'
      );
    };

    // Initial setup
    document.documentElement.style.setProperty(
      '--motion-preference',
      prefersReducedMotion.matches ? 'reduce' : 'no-preference'
    );

    prefersReducedMotion.addEventListener('change', updateMotionPreferences);
  }
}

// Auto-enhance accessibility when module is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    AccessibilityEnhancer.enhance();
  });
}
