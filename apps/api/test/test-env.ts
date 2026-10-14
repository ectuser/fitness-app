import type { Env } from '../src/config/env'

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://fitness:fitness@localhost:5432/fitness_test'

export function testEnv(overrides: Partial<Env> = {}): Env {
  return {
    NODE_ENV: 'test',
    PORT: 0,
    DATABASE_URL: TEST_DATABASE_URL,
    ...overrides,
  }
}
