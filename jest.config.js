/**
 * Jest Configuration
 * Unit and Integration Testing Setup
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Module name mapper for assets and CSS
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // Transform files with babel-jest (if needed)
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    'server/**/*.js',
    '!src/main.js',
    '!server/index.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Ignore patterns (E2E tests run with Playwright, not Jest)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/tests/e2e/',
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
