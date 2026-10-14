import { ErrorEnvelopeSchema } from '@fitness/contracts'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { account, session, user } from '../src/database/schema'
import { cleanAuthTables, startApp } from './test-app'
import type { TestApp } from './test-app'

const ORIGIN = 'http://localhost:3000'
const PASSWORD = 'correct horse battery'

let counter = 0
// Each test gets its own client address: the rate limiter keys on it.
function nextIp() {
  counter += 1
  return `10.0.${Math.floor(counter / 250)}.${counter % 250}`
}

function client(ctx: TestApp, ip = nextIp()) {
  const agent = request.agent(ctx.app.getHttpServer())
  agent.set('Origin', ORIGIN).set('X-Forwarded-For', ip)
  return agent
}

function signUp(agent: ReturnType<typeof client>, email = 'ann@example.com') {
  return agent
    .post('/api/auth/sign-up/email')
    .send({ email, password: PASSWORD, name: 'Ann' })
}

describe('Better Auth integration', () => {
  let ctx: TestApp

  beforeAll(async () => {
    ctx = await startApp()
  })

  afterAll(async () => {
    await ctx.app.close()
  })

  beforeEach(async () => {
    await cleanAuthTables(ctx.db)
  })

  describe('registration and sign-in', () => {
    it('registers an Account User, signs them in and reaches the protected route', async () => {
      const agent = client(ctx)

      const registered = await signUp(agent)
      expect(registered.status).toBe(200)

      const me = await agent.get('/api/v1/me')
      expect(me.status).toBe(200)
      expect(me.body.user).toMatchObject({
        email: 'ann@example.com',
        name: 'Ann',
      })
      const [row] = await ctx.db.select().from(user)
      expect(me.body.user.id).toBe(row.id)
    })

    it('signs in again from a second device while the first stays valid', async () => {
      const first = client(ctx)
      await signUp(first)
      const second = client(ctx)

      const signedIn = await second
        .post('/api/auth/sign-in/email')
        .send({ email: 'ann@example.com', password: PASSWORD })

      expect(signedIn.status).toBe(200)
      expect((await second.get('/api/v1/me')).status).toBe(200)
      expect((await first.get('/api/v1/me')).status).toBe(200)
      expect(await ctx.db.select().from(session)).toHaveLength(2)
    })

    it('rejects a duplicate sign-up with 422', async () => {
      await signUp(client(ctx))

      const again = await signUp(client(ctx))

      expect(again.status).toBe(422)
    })

    it('rejects passwords shorter than 8 and longer than 128 characters', async () => {
      const short = await client(ctx)
        .post('/api/auth/sign-up/email')
        .send({ email: 'a@example.com', password: 'short', name: 'A' })
      const long = await client(ctx)
        .post('/api/auth/sign-up/email')
        .send({ email: 'b@example.com', password: 'x'.repeat(129), name: 'B' })

      expect(short.status).toBe(400)
      expect(long.status).toBe(400)
    })

    it('signs the person in immediately after sign-up (autoSignIn)', async () => {
      const agent = client(ctx)
      const registered = await signUp(agent)

      expect(registered.headers['set-cookie']).toBeDefined()
      expect(await ctx.db.select().from(session)).toHaveLength(1)
    })

    it('answers a wrong password and an unknown email with the same failure', async () => {
      await signUp(client(ctx))

      const wrongPassword = await client(ctx)
        .post('/api/auth/sign-in/email')
        .send({ email: 'ann@example.com', password: 'wrong-password' })
      const unknownEmail = await client(ctx)
        .post('/api/auth/sign-in/email')
        .send({ email: 'nobody@example.com', password: 'wrong-password' })

      expect(wrongPassword.status).toBe(401)
      expect(unknownEmail.status).toBe(401)
      expect(unknownEmail.body).toEqual(wrongPassword.body)
    })
  })

  describe('session cookie and lifecycle', () => {
    it('sets an HttpOnly, SameSite=Lax cookie that is not Secure over http', async () => {
      const registered = await signUp(client(ctx))

      const cookie = String(registered.headers['set-cookie']).toLowerCase()
      expect(cookie).toContain('better-auth.session_token=')
      expect(cookie).toContain('httponly')
      expect(cookie).toContain('samesite=lax')
      expect(cookie).not.toContain('secure')
      expect(cookie).toContain('max-age=604800')
    })

    it('uses the __Secure- prefix and Secure flag when the app origin is https', async () => {
      const https = await startApp({ APP_ORIGIN: 'https://fit.example.com' })
      try {
        await cleanAuthTables(https.db)
        const agent = request
          .agent(https.app.getHttpServer())
          .set('Origin', 'https://fit.example.com')
          .set('X-Forwarded-For', nextIp())
        const registered = await signUp(agent)

        const cookie = String(registered.headers['set-cookie'])
        expect(cookie).toContain('__Secure-better-auth.session_token=')
        expect(cookie.toLowerCase()).toContain('secure')
      } finally {
        await https.app.close()
      }
    })

    it('sign-out deletes the session row and the protected route answers 401', async () => {
      const agent = client(ctx)
      await signUp(agent)
      expect(await ctx.db.select().from(session)).toHaveLength(1)

      const out = await agent.post('/api/auth/sign-out').send({})

      expect(out.status).toBe(200)
      expect(await ctx.db.select().from(session)).toHaveLength(0)
      expect((await agent.get('/api/v1/me')).status).toBe(401)
    })

    it('treats an expired session as signed out', async () => {
      const agent = client(ctx)
      await signUp(agent)
      await ctx.db
        .update(session)
        .set({ expiresAt: new Date(Date.now() - 1000) })

      expect((await agent.get('/api/v1/me')).status).toBe(401)
      const current = await agent.get('/api/auth/get-session')
      expect(current.status).toBe(200)
      expect(current.body).toBeNull()
    })

    it('re-sends the cookie when the guard refreshes a session older than a day', async () => {
      const agent = client(ctx)
      await signUp(agent)
      const aged = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      await ctx.db.update(session).set({
        createdAt: aged,
        updatedAt: aged,
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      })

      const me = await agent.get('/api/v1/me')

      expect(me.status).toBe(200)
      const cookie = String(me.headers['set-cookie']).toLowerCase()
      expect(cookie).toContain('better-auth.session_token=')
      expect(cookie).toContain('max-age=604800')
      const [row] = await ctx.db.select().from(session)
      expect(row.expiresAt.getTime()).toBeGreaterThan(
        Date.now() + 6 * 24 * 60 * 60 * 1000,
      )
    })

    it('revokes immediately when the row is deleted (no cookie cache)', async () => {
      const agent = client(ctx)
      await signUp(agent)
      await ctx.db.delete(session)

      expect((await agent.get('/api/v1/me')).status).toBe(401)
    })

    it('answers get-session with 200 and null when anonymous', async () => {
      const current = await client(ctx).get('/api/auth/get-session')

      expect(current.status).toBe(200)
      expect(current.body).toBeNull()
    })
  })

  describe('access control', () => {
    it('answers anonymous protected requests with the UNAUTHENTICATED envelope', async () => {
      const response = await request(ctx.app.getHttpServer()).get('/api/v1/me')

      expect(response.status).toBe(401)
      const envelope = ErrorEnvelopeSchema.parse(response.body)
      expect(envelope.error.code).toBe('UNAUTHENTICATED')
      expect(envelope.error.requestId).toBe(response.headers['x-request-id'])
    })

    it('keeps /health public', async () => {
      const response = await request(ctx.app.getHttpServer()).get('/health')

      expect(response.status).toBe(200)
    })

    it('rejects a state-changing /api/v1 request from an untrusted origin', async () => {
      const agent = client(ctx)
      await signUp(agent)

      const response = await agent
        .post('/api/v1/test-echo')
        .set('Origin', 'https://evil.example')
        .send({})

      expect(response.status).toBe(403)
      expect(ErrorEnvelopeSchema.parse(response.body).error.code).toBe(
        'FORBIDDEN',
      )
    })

    it('rejects a state-changing /api/v1 request marked Sec-Fetch-Site: cross-site', async () => {
      const agent = client(ctx)
      await signUp(agent)

      const response = await agent
        .post('/api/v1/test-echo')
        .set('Sec-Fetch-Site', 'cross-site')
        .send({})

      expect(response.status).toBe(403)
    })

    it('accepts a state-changing /api/v1 request from the trusted origin', async () => {
      const agent = client(ctx)
      await signUp(agent)

      const response = await agent
        .post('/api/v1/test-echo')
        .set('Sec-Fetch-Site', 'same-origin')
        .send({})

      expect(response.status).toBe(201)
    })

    it('rejects a cookie-bearing auth request from an untrusted origin', async () => {
      const agent = client(ctx)
      await signUp(agent)

      const response = await agent
        .post('/api/auth/sign-out')
        .set('Origin', 'https://evil.example')
        .send({})

      expect(response.status).toBe(403)
      expect(await ctx.db.select().from(session)).toHaveLength(1)
    })
  })

  describe('rate limiting', () => {
    it('throttles the 4th sign-in attempt within 10 seconds', async () => {
      const ip = nextIp()
      const statuses: Array<number> = []
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const response = await client(ctx, ip)
          .post('/api/auth/sign-in/email')
          .send({ email: 'ann@example.com', password: 'wrong-password' })
        statuses.push(response.status)
      }

      expect(statuses.slice(0, 3)).toEqual([401, 401, 401])
      expect(statuses[3]).toBe(429)
    })
  })

  describe('error bodies', () => {
    it('leaks no stack, SQL or Zod internals', async () => {
      const bodies = await Promise.all([
        client(ctx)
          .post('/api/auth/sign-up/email')
          .send({ email: 'not-an-email', password: PASSWORD, name: 'A' }),
        client(ctx).post('/api/auth/sign-in/email').send({}),
        client(ctx).get('/api/v1/me'),
      ])

      for (const response of bodies) {
        const text = JSON.stringify(response.body)
        expect(text).not.toMatch(/stack|select |insert |ZodError|node_modules/i)
      }
    })
  })

  it('stores the password hashed, never in the clear', async () => {
    await signUp(client(ctx))

    const [row] = await ctx.db.select().from(account)

    expect(row.password).toBeTruthy()
    expect(row.password).not.toContain(PASSWORD)
  })
})
