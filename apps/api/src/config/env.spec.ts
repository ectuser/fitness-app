import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

const VALID = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/db',
  APP_ORIGIN: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
}

describe('parseEnv', () => {
  it('reads a complete environment and defaults the port', () => {
    expect(parseEnv(VALID)).toEqual({
      NODE_ENV: 'development',
      PORT: 3001,
      ...VALID,
    })
  })

  it('fails fast and names the missing variable', () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/)
  })

  it('rejects a non-postgres database url', () => {
    expect(() =>
      parseEnv({ ...VALID, DATABASE_URL: 'file:./local.db' }),
    ).toThrow(/DATABASE_URL/)
  })

  it('fails fast without an app origin or auth secret', () => {
    const { APP_ORIGIN: _origin, ...withoutOrigin } = VALID
    const { BETTER_AUTH_SECRET: _secret, ...withoutSecret } = VALID
    expect(() => parseEnv(withoutOrigin)).toThrow(/APP_ORIGIN/)
    expect(() => parseEnv(withoutSecret)).toThrow(/BETTER_AUTH_SECRET/)
  })

  it('rejects a short auth secret and normalizes the origin', () => {
    expect(() => parseEnv({ ...VALID, BETTER_AUTH_SECRET: 'short' })).toThrow(
      /BETTER_AUTH_SECRET/,
    )
    expect(
      parseEnv({ ...VALID, APP_ORIGIN: 'https://app.example.com/' }).APP_ORIGIN,
    ).toBe('https://app.example.com')
  })
})
