/**
 * Enhanced Test Utilities
 * Comprehensive testing utilities for React components, hooks, and integration tests
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  username: 'testuser',
  displayName: 'Test User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  verified: false,
  followers: 100,
  following: 50,
  isOnline: true,
  bio: 'Test user bio',
  location: 'Test City',
  ...overrides,
});

export const mockPost = (overrides = {}) => ({
  id: 'post-123',
  author: mockUser(),
  content: 'Test post content',
  type: 'text' as const,
  timestamp: new Date('2024-01-01T12:00:00Z'),
  likes: 10,
  comments: 5,
  shares: 2,
  bookmarks: 1,
  isLiked: false,
  isBookmarked: false,
  hashtags: ['#test'],
  mentions: [],
  ...overrides,
});

export const mockMessage = (overrides = {}) => ({
  id: 'message-123',
  sender: mockUser(),
  recipient: mockUser({ id: 'user-456' }),
  content: 'Test message',
  type: 'text' as const,
  timestamp: new Date('2024-01-01T12:00:00Z'),
  isRead: false,
  isDelivered: true,
  reactions: [],
  isEdited: false,
  isDeleted: false,
  ...overrides,
});

export const mockChat = (overrides = {}) => ({
  id: 'chat-123',
  participants: [mockUser()],
  lastMessage: mockMessage(),
  unreadCount: 1,
  isGroup: false,
  isPinned: false,
  isMuted: false,
  isArchived: false,
  ...overrides,
});

// Theme mock data
export const mockTheme = {
  colorMode: 'light' as const,
  colorPalette: 'mono',
  accentColor: '#007aff',
  actualColorMode: 'light' as const,
  setColorMode: jest.fn(),
  setColorPalette: jest.fn(),
  setAccentColor: jest.fn(),
  toggleColorMode: jest.fn(),
};

// Language mock data
export const mockLanguage = {
  language: 'en',
  setLanguage: jest.fn(),
  t: jest.fn((key: string) => key),
  isRTL: false,
};

// Settings mock data
export const mockSettings = {
  notifications: true,
  autoSave: true,
  theme: 'auto',
  language: 'en',
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
  updateSettings: jest.fn(),
  resetSettings: jest.fn(),
};

// Simple wrapper for testing (contexts are mocked in jest.setup.js)
const TestWrapper = ({ children }: { children: ReactNode }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

// Custom render function with minimal wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any simple options here if needed
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
};

// Custom hook render function
export const customRenderHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> & CustomRenderOptions = {}
): RenderHookResult<TResult, TProps> => {
  return renderHook(hook, {
    wrapper: TestWrapper,
    ...options,
  });
};

// User event setup
export const setupUserEvent = () => userEvent.setup();

// Async utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const waitForAnimation = () => 
  new Promise(resolve => setTimeout(resolve, 300));

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  json: () => Promise.reject(new Error(message)),
  text: () => Promise.reject(new Error(message)),
});

// Local storage mock utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    },
  };
};

// Intersection Observer mock
export const mockIntersectionObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
  
  global.IntersectionObserver = jest.fn().mockImplementation(() => mockObserver);
  
  return mockObserver;
};

// Resize Observer mock
export const mockResizeObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
  
  global.ResizeObserver = jest.fn().mockImplementation(() => mockObserver);
  
  return mockObserver;
};

// Media query mock
export const mockMediaQuery = (matches = false) => {
  const mockMQL = {
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMQL),
  });
  
  return mockMQL;
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

export const measureMemory = () => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  // Mock implementation - in real scenario would use @axe-core/react
  const issues: string[] = [];
  
  // Check for missing alt text
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push('Image missing alt text');
    }
  });
  
  // Check for missing labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    container.querySelector(`label[for="${input.id}"]`);
    if (!hasLabel) {
      issues.push('Form control missing label');
    }
  });
  
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      issues.push('Heading hierarchy skipped');
    }
    lastLevel = level;
  });
  
  return issues;
};

// Custom matchers
export const customMatchers = {
  toBeAccessible: async (received: HTMLElement) => {
    const issues = await checkAccessibility(received);
    const pass = issues.length === 0;
    
    return {
      message: () => 
        pass 
          ? `Expected element to have accessibility issues`
          : `Expected element to be accessible, but found issues: ${issues.join(', ')}`,
      pass,
    };
  },
  
  toHavePerformanceWithin: (received: number, min: number, max: number) => {
    const pass = received >= min && received <= max;
    
    return {
      message: () =>
        pass
          ? `Expected ${received}ms not to be within ${min}ms - ${max}ms`
          : `Expected ${received}ms to be within ${min}ms - ${max}ms`,
      pass,
    };
  },
  
  toBeResponsive: (received: HTMLElement) => {
    const computedStyle = window.getComputedStyle(received);
    const hasFlexOrGrid = computedStyle.display === 'flex' || 
                         computedStyle.display === 'grid' ||
                         computedStyle.display === 'inline-flex' ||
                         computedStyle.display === 'inline-grid';
    
    const hasResponsiveUnits = computedStyle.width?.includes('%') ||
                              computedStyle.width?.includes('vw') ||
                              computedStyle.width?.includes('rem') ||
                              computedStyle.maxWidth?.includes('%');
    
    const pass = hasFlexOrGrid || hasResponsiveUnits;
    
    return {
      message: () =>
        pass
          ? `Expected element not to be responsive`
          : `Expected element to be responsive (use flex/grid or responsive units)`,
      pass,
    };
  },
};

// Test data factories
export const createTestData = {
  users: (count = 5) => Array.from({ length: count }, (_, i) => 
    mockUser({ id: `user-${i}`, username: `user${i}` })
  ),
  
  posts: (count = 10) => Array.from({ length: count }, (_, i) => 
    mockPost({ id: `post-${i}`, content: `Test post ${i}` })
  ),
  
  messages: (count = 20) => Array.from({ length: count }, (_, i) => 
    mockMessage({ id: `message-${i}`, content: `Test message ${i}` })
  ),
  
  chats: (count = 5) => Array.from({ length: count }, (_, i) => 
    mockChat({ id: `chat-${i}` })
  ),
};

// Export everything for easy importing
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { customRender as render, customRenderHook as renderHook };