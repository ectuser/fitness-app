import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isPagesBuild = process.env.GITHUB_PAGES === 'true'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'baseLocale'],
    }),
    tailwindcss(),
    tanstackStart(
      isPagesBuild
        ? {
            spa: {
              enabled: true,
              prerender: {
                outputPath: '/index',
              },
            },
          }
        : undefined,
    ),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'pwa-icon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        short_name: 'Fitness',
        name: 'Fitness Tracker',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        start_url: '.',
        display: 'standalone',
        theme_color: '#18181b',
        background_color: '#18181b',
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
})

export default config
