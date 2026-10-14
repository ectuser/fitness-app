import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('reads a complete environment and defaults the port', () => {
    expect(
      parseEnv({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' }),
    ).toEqual({
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
    })
  })

  it('fails fast and names the missing variable', () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/)
  })

  it('rejects a non-postgres database url', () => {
    expect(() => parseEnv({ DATABASE_URL: 'file:./local.db' })).toThrow(
      /DATABASE_URL/,
    )
  })
})
