/**
 * Vite Configuration Template
 * Copy to vite.config.js in your project root
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh options
      fastRefresh: true,
      // Babel options
      babel: {
        plugins: [],
      },
    }),
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Development server
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    open: true, // Auto-open browser
    cors: true,
    // Proxy API requests (optional)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Preview server (for production builds)
  preview: {
    port: 4173,
    host: true,
  },

  // Build options
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true for debugging
    minify: 'terser',
    target: 'es2015',
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React
          vendor: ['react', 'react-dom'],
          // Separate chunk for router (if using)
          // router: ['react-router-dom'],
        },
      },
    },
    // Adjust chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },

  // CSS options
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      // If using SCSS
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Preview mode options
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Environment variables
  envPrefix: 'VITE_',
});

/**
 * package.json scripts
 *
 * Add these to your package.json:
 *
 * {
 *   "scripts": {
 *     "dev": "vite",
 *     "build": "vite build",
 *     "preview": "vite preview",
 *     "lint": "eslint src --ext .js,.jsx --fix",
 *     "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
 *     "test": "vitest",
 *     "test:ui": "vitest --ui",
 *     "test:coverage": "vitest --coverage"
 *   },
 *   "dependencies": {
 *     "react": "^18.2.0",
 *     "react-dom": "^18.2.0"
 *   },
 *   "devDependencies": {
 *     "@vitejs/plugin-react": "^4.2.1",
 *     "vite": "^5.0.0",
 *     "vitest": "^1.0.0",
 *     "@testing-library/react": "^14.1.0",
 *     "eslint": "^8.55.0",
 *     "prettier": "^3.1.0"
 *   }
 * }
 */

/**
 * ESLint Configuration (.eslintrc.js)
 */
export const eslintConfig = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

/**
 * Prettier Configuration (.prettierrc)
 */
export const prettierConfig = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};

/**
 * Vitest Configuration (vitest.config.js)
 */
export const vitestConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
};

/**
 * Example .env file
 *
 * VITE_API_URL=http://localhost:3000/api
 * VITE_APP_TITLE=My React App
 * VITE_ENABLE_ANALYTICS=false
 *
 * Access in code:
 * const apiUrl = import.meta.env.VITE_API_URL;
 */

/**
 * Example tsconfig.json (if using TypeScript)
 */
export const tsconfigExample = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',

    /* Linting */
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,

    /* Path mapping */
    baseUrl: '.',
    paths: {
      '@/*': ['./src/*'],
      '@components/*': ['./src/components/*'],
      '@hooks/*': ['./src/hooks/*'],
      '@utils/*': ['./src/utils/*'],
    },
  },
  include: ['src'],
  references: [{ path: './tsconfig.node.json' }],
};
