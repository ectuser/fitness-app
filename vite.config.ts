import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import istanbul from 'vite-plugin-istanbul'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(() => {
  const enableCoverageInstrumentation = process.env.VITE_COVERAGE === 'true';

  return {
    base: '/fitness-app/',
    plugins: [
      react(),
      tailwindcss(),
      enableCoverageInstrumentation &&
        istanbul({
          include: [
            'src/App.tsx',
            'src/pages/ExercisesPage.tsx',
            'src/pages/ExerciseFormPage.tsx',
            'src/pages/ExerciseDetailPage.tsx',
            'src/pages/WorkoutsPage.tsx',
            'src/pages/WorkoutEditPage.tsx',
          ],
          exclude: ['node_modules', 'tests', 'src/components/ui/**', 'src/main.tsx'],
          extension: ['.ts', '.tsx'],
          requireEnv: true,
        }),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Fitness Tracker',
        short_name: 'Fitness',
        description: 'Track your workouts, manage exercises, and monitor your fitness progress',
        theme_color: '#ffffff',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/fitness-app/',
        start_url: '/fitness-app/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        all: true,
        reportsDirectory: './coverage/unit',
        reporter: ['text-summary', 'html', 'json-summary'],
        include: [
          'src/context/**/*.tsx',
          'src/hooks/**/*.ts',
          'src/lib/**/*.ts',
        ],
        exclude: ['src/components/ui/**', 'src/main.tsx', 'src/assets/**', '**/*.d.ts'],
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  };
})
