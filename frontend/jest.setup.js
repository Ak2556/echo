import '@testing-library/jest-dom';
import { act } from 'react';

// Configure React Testing Library to use React 18's automatic batching
global.IS_REACT_ACT_ENVIRONMENT = true;

// Suppress specific React warnings but allow real errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: An invalid form control') ||
        args[0].includes('Warning: React.jsx: type is invalid') ||
        args[0].includes('The above error occurred') ||
        args[0].includes('was not wrapped in act') ||
        args[0].includes('overlapping act() calls'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Helper to ensure all updates are flushed
global.flushPromises = () => act(() => new Promise(resolve => setImmediate(resolve)));

// Helper for tests that need to wait for async updates
global.waitForAsync = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// Mock framer-motion globally
jest.mock('framer-motion', () => {
  const createMotionComponent =
    (tag) =>
    ({ children, ...props }) => {
      const {
        animate,
        initial,
        transition,
        whileHover,
        whileTap,
        whileInView,
        variants,
        ...restProps
      } = props;
      return React.createElement(tag, restProps, children);
    };

  return {
    motion: {
      div: createMotionComponent('div'),
      p: createMotionComponent('p'),
      span: createMotionComponent('span'),
      button: createMotionComponent('button'),
      li: createMotionComponent('li'),
      ul: createMotionComponent('ul'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      h4: createMotionComponent('h4'),
      h5: createMotionComponent('h5'),
      h6: createMotionComponent('h6'),
      a: createMotionComponent('a'),
      img: createMotionComponent('img'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      header: createMotionComponent('header'),
      footer: createMotionComponent('footer'),
      nav: createMotionComponent('nav'),
      main: createMotionComponent('main'),
      aside: createMotionComponent('aside'),
      form: createMotionComponent('form'),
      input: createMotionComponent('input'),
      textarea: createMotionComponent('textarea'),
      select: createMotionComponent('select'),
      label: createMotionComponent('label'),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: () => ({ get: jest.fn(), set: jest.fn() }),
    useTransform: () => ({ get: jest.fn(), set: jest.fn() }),
    useSpring: () => ({ get: jest.fn(), set: jest.fn() }),
  };
});

// Mock browser APIs
// Mock window.alert to prevent "Not implemented" errors in tests
global.alert = jest.fn();

global.ClipboardEvent = class ClipboardEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict.clipboardData || {
      getData: jest.fn(),
      setData: jest.fn(),
    };
  }
};

global.DataTransfer = class DataTransfer {
  constructor() {
    this.data = {};
  }

  getData(format) {
    return this.data[format] || '';
  }

  setData(format, data) {
    this.data[format] = data;
  }
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Make React available globally for JSX in mocks
global.React = require('react');

// Mock context hooks to avoid provider requirements in tests
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'nothing',
    colorMode: 'light',
    actualColorMode: 'light',
    colorPalette: 'mono',
    accentColor: '#007aff',
    accessibilityPrefs: {
      reducedMotion: false,
      highContrast: false,
      forcedColors: false,
    },
    themeSchedule: { type: 'off' },
    isTransitioning: false,
    setTheme: jest.fn(),
    setColorMode: jest.fn(),
    setColorPalette: jest.fn(),
    setAccentColor: jest.fn(),
    setAccessibilityPrefs: jest.fn(),
    setThemeSchedule: jest.fn(),
    toggleColorMode: jest.fn(),
    previewTheme: jest.fn(),
    getColors: () => ({
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      accent: '#E5E5EA',
    }),
    getSystemPreference: () => 'light',
    getSunriseSunset: () =>
      Promise.resolve({ sunrise: '06:00', sunset: '18:00' }),
  }),
  ThemeProvider: ({ children }) => children,
}));

jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key) => key, // Simple pass-through for translation keys
    isRTL: false,
    supportedLanguages: {
      en: { name: 'English', nativeName: 'English' },
      es: { name: 'Spanish', nativeName: 'Español' },
      fr: { name: 'French', nativeName: 'Français' },
    },
  }),
  LanguageProvider: ({ children }) => children,
}));
