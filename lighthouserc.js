/**
 * Lighthouse CI Configuration
 * Automated performance, accessibility, and best practices auditing
 */

export default {
  ci: {
    collect: {
      // URLs to test
      url: ['http://localhost:5173/'],

      // Number of runs per URL
      numberOfRuns: 3,

      // Start server before collecting
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,

      // Settings
      settings: {
        // Emulate mobile device
        preset: 'desktop',

        // Throttling
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },

        // Disable storage reset for faster runs
        disableStorageReset: false,

        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },

    assert: {
      // Assertion presets
      preset: 'lighthouse:recommended',

      // Custom assertions
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'errors-in-console': 'warn',
        'uses-http2': 'warn',
        'uses-passive-event-listeners': 'warn',
        'no-document-write': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],
        'meta-description': 'error',
        'link-text': 'warn',
        'crawlable-anchors': 'warn',
        'robots-txt': 'off',

        // PWA (if applicable)
        'installable-manifest': 'off',
        'service-worker': 'off',
        'works-offline': 'off',
      },
    },

    upload: {
      // Upload to temporary public storage
      target: 'temporary-public-storage',

      // Or upload to Lighthouse CI server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token',
    },

    server: {
      // Optional: Configure LHCI server
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDialect: 'sqlite',
      //   sqlDatabasePath: './lhci.db',
      // },
    },
  },
};
