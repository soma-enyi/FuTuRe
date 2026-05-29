import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => ({
  // CDN base URL: set VITE_CDN_URL in .env to serve assets from CDN
  base: process.env.VITE_CDN_URL ?? '/',
  plugins: [
    react(),
    // Bundle analysis: generates stats.html after `npm run build`
    visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true }),
    // Sentry: Upload source maps for error reporting (only in production)
    mode === 'production' && process.env.VITE_SENTRY_DSN
      ? sentryVitePlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          release: process.env.VITE_APP_VERSION || 'unknown',
          sourceMaps: { filesToDeleteAfterUpload: ['**/*.map'] },
        })
      : null,
  ].filter(Boolean),
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    sourcemap: true,
    // Code splitting: vendor chunk + per-route lazy chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:        ['react', 'react-dom'],
          motion:        ['framer-motion'],
          stellar:       ['@stellar/stellar-sdk'],
        },
        // Ensure hashed filenames for immutable CDN caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Performance budget: warn if any chunk > 500 kB
    chunkSizeWarningLimit: 500,
  },
}));
