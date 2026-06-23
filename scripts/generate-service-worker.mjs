import { access } from 'node:fs/promises'
import { generateSW } from 'workbox-build'

const clientDirectory = 'dist/client'

try {
  await access(`${clientDirectory}/index.html`)
} catch {
  console.log('Skipping service worker generation for the server build.')
  process.exit(0)
}

const { count, size, warnings } = await generateSW({
  globDirectory: clientDirectory,
  globPatterns: ['**/*.{css,html,ico,js,json,png,txt,webmanifest}'],
  swDest: `${clientDirectory}/sw.js`,
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/\/pr-\d+\//],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
})

for (const warning of warnings) {
  console.warn(warning)
}

console.log(
  `Generated service worker precaching ${count} files (${size} bytes).`,
)
