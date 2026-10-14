import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json. Requires Vite 8.
  resolve: { tsconfigPaths: true },
  test: {
    globals: false,
    fileParallelism: false,
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
  },
})
