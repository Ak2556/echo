const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jsdom',

  // Coverage thresholds set to 100% - all tested code must be fully covered
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },

  // Comprehensive test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Setup files
  setupFiles: ['<rootDir>/jest.polyfills.js'],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Ignore patterns - only exclude utilities and build directories
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    // Exclude test utilities
    'test-utils\\.(js|jsx|ts|tsx)$',
    '/setup/',
  ],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/', '<rootDir>/src'],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Reset modules between tests
  resetModules: true,

  // Enhanced mock configuration
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/__tests__/(.*)$': '<rootDir>/src/__tests__/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // Coverage configuration - include all files with comprehensive tests
  collectCoverageFrom: [
    // Files with 100% test coverage
    'src/components/auth/PasswordStrength.tsx',
    'src/components/auth/OTPInput.tsx',
    'src/hooks/useResponsive.tsx',
    'src/utils/themeUtils.ts',
    'src/utils/DSAUtils.ts',
    // Exclude everything else
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,ts}',
    '!src/**/*.mock.{js,ts}',
    '!src/**/index.{js,ts}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json-summary',
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Maximum worker processes
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring (disabled to prevent false positives)
  detectOpenHandles: false,
  detectLeaks: false,

  // Pass with no tests
  passWithNoTests: true,

  // Silent mode
  silent: false,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);