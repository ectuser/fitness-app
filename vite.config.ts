import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
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
    viteReact(),
  ],
})

export default config
