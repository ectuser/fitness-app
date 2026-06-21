import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'virtual:pwa-register/react': fileURLToPath(
        new URL(
          './node_modules/vite-plugin-pwa/dist/client/dev/react.js',
          import.meta.url,
        ),
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    maxWorkers: 1,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/features/dashboard/**/*.{ts,tsx}',
        'src/components/exercise/ExerciseForm.tsx',
        'src/components/workout/SetInput.tsx',
        'src/components/workout/WorkoutCard.tsx',
        'src/components/workout/WorkoutExerciseList.tsx',
        'src/components/workout/WorkoutList.tsx',
        'src/context/**/*.tsx',
        'src/lib/**/*.ts',
      ],
      exclude: [
        'src/components/layout/**',
        'src/components/ui/**',
        'src/integrations/**',
        'src/lib/router-compat.tsx',
        'src/lib/seed-data.ts',
        'src/paraglide/**',
        'src/router.tsx',
        'src/routeTree.gen.ts',
        'src/routes/**',
        'src/test/**',
        'src/types/**',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
})
