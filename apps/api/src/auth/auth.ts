import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Database } from '../database/database.module'
import type { Env } from '../config/env'

const DAY_IN_SECONDS = 60 * 60 * 24

// The page origin behind the Vite dev proxy; production is same-origin.
const DEV_PAGE_ORIGIN = 'http://localhost:3000'

export function trustedOrigins(env: Env): Array<string> {
  return env.NODE_ENV === 'development'
    ? [env.APP_ORIGIN, DEV_PAGE_ORIGIN]
    : [env.APP_ORIGIN]
}

export function createAuth(env: Env, db: Database) {
  return betterAuth({
    baseURL: env.APP_ORIGIN,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', transaction: true }),
    trustedOrigins: trustedOrigins(env),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    session: { expiresIn: 7 * DAY_IN_SECONDS, updateAge: DAY_IN_SECONDS },
    // In-memory only: the database storage is affected by GHSA-44jh-23m7-hpcf.
    // Better Auth turns both checks off when NODE_ENV is "test"; keep them on.
    advanced: { disableOriginCheck: false, disableCSRFCheck: false },
    rateLimit: { enabled: true, storage: 'memory' },
  })
}

export type Auth = ReturnType<typeof createAuth>
export type AuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>
