import { Test } from '@nestjs/testing'
import { ErrorEnvelopeSchema, HealthResponseSchema } from '@fitness/contracts'
import pg from 'pg'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module'
import { configureApp } from '../src/http/configure-app'
import { TEST_DATABASE_URL, testEnv } from './test-env'
import type { INestApplication } from '@nestjs/common'
import type { Env } from '../src/config/env'

async function startApp(overrides: Partial<Env> = {}) {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot(testEnv(overrides))],
  }).compile()
  const app = moduleRef.createNestApplication()
  configureApp(app)
  await app.init()
  return app
}

describe('GET /health', () => {
  let app: INestApplication | undefined

  afterEach(async () => {
    await app?.close()
    app = undefined
  })

  it('reports ok when the database is reachable', async () => {
    app = await startApp()

    const response = await request(app.getHttpServer()).get('/health')

    expect(response.status).toBe(200)
    expect(HealthResponseSchema.parse(response.body)).toEqual({
      status: 'ok',
      database: 'up',
    })
  })

  it('answers 503 UNAVAILABLE when the database is unreachable', async () => {
    app = await startApp({
      DATABASE_URL: 'postgres://fitness:fitness@127.0.0.1:1/fitness_test',
    })

    const response = await request(app.getHttpServer()).get('/health')

    expect(response.status).toBe(503)
    const envelope = ErrorEnvelopeSchema.parse(response.body)
    expect(envelope.error.code).toBe('UNAVAILABLE')
    expect(envelope.error.requestId).toBe(response.headers['x-request-id'])
  })

  it('survives the database dropping its connections and recovers', async () => {
    app = await startApp()
    await request(app.getHttpServer()).get('/health')

    const admin = new pg.Client({ connectionString: TEST_DATABASE_URL })
    await admin.connect()
    try {
      await admin.query(
        `select pg_terminate_backend(pid) from pg_stat_activity
         where datname = current_database() and pid <> pg_backend_pid()`,
      )
    } finally {
      await admin.end()
    }
    await new Promise((resolve) => setTimeout(resolve, 200))

    const response = await request(app.getHttpServer()).get('/health')
    expect(response.status).toBe(200)
  })
})
