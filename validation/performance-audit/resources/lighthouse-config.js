/**
 * Lighthouse CI Configuration
 *
 * Automate performance testing in CI/CD pipelines.
 * Enforce performance budgets and track Core Web Vitals.
 *
 * Usage:
 *   npm install -g @lhci/cli
 *   lhci autorun
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/about',
        'http://localhost:3000/products',
      ],

      // Number of runs per URL (median is used)
      numberOfRuns: 3,

      // Start local server if needed
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,

      // Lighthouse settings
      settings: {
        // Emulate slower mobile device
        preset: 'desktop', // or 'mobile'

        // Throttling settings (4G)
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
          cpuSlowdownMultiplier: 1,
        },

        // Skip certain audits
        skipAudits: [
          'canonical', // Skip if not needed
          'robots-txt', // Skip if not needed
        ],

        // Only run specific categories
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
      },
    },

    assert: {
      // Performance budgets
      assertions: {
        // Categories (0-100 score)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],

        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // 200KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:total:size': ['error', { maxNumericValue: 1000000 }], // 1MB

        // Network requests
        'resource-summary:script:count': ['warn', { maxNumericValue: 15 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        'resource-summary:image:count': ['warn', { maxNumericValue: 30 }],

        // Best practices
        'uses-responsive-images': 'error',
        'offscreen-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'error',
        'uses-optimized-images': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'button-name': 'error',
        'link-name': 'error',

        // Performance hints
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
      },
    },

    upload: {
      // Upload to Lighthouse CI server (optional)
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,

      // Or save to filesystem
      target: 'filesystem',
      outputDir: './lhci-reports',
    },

    server: {
      // Optional: run local LHCI server
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci-data.db',
      },
    },
  },
};


/**
 * USAGE EXAMPLES
 */

// 1. Install Lighthouse CI
//    npm install -g @lhci/cli

// 2. Run locally
//    lhci autorun

// 3. Run with specific URL
//    lhci autorun --collect.url=http://localhost:3000

// 4. Run in CI/CD (GitHub Actions example)
/*
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
*/

// 5. View results
//    Open ./lhci-reports/index.html in browser


/**
 * CUSTOM BUDGETS
 */

// Adjust budgets based on your needs
const strictBudgets = {
  'first-contentful-paint': ['error', { maxNumericValue: 1200 }],
  'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
  'resource-summary:script:size': ['error', { maxNumericValue: 150000 }],
};

const relaxedBudgets = {
  'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
  'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
  'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
  'resource-summary:script:size': ['warn', { maxNumericValue: 300000 }],
};


/**
 * MOBILE VS DESKTOP
 */

const mobileConfig = {
  preset: 'mobile',
  formFactor: 'mobile',
  throttling: {
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    cpuSlowdownMultiplier: 4,
  },
};

const desktopConfig = {
  preset: 'desktop',
  formFactor: 'desktop',
  throttling: {
    rttMs: 40,
    throughputKbps: 10 * 1024,
    cpuSlowdownMultiplier: 1,
  },
};


/**
 * INTEGRATION WITH PACKAGE.JSON
 */

// Add to package.json scripts:
/*
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:mobile": "lhci autorun --collect.settings.preset=mobile",
    "lighthouse:desktop": "lhci autorun --collect.settings.preset=desktop",
    "lighthouse:view": "open ./lhci-reports/index.html"
  }
}
*/


/**
 * DEBUGGING FAILURES
 */

// If Lighthouse CI fails:
// 1. Check the HTML report in ./lhci-reports/
// 2. Review specific failed assertions
// 3. Run Lighthouse manually to debug:
//    npx lighthouse http://localhost:3000 --view
// 4. Adjust budgets if needed
// 5. Fix performance issues before relaxing budgets
