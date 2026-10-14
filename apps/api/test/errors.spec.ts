import { Test } from '@nestjs/testing'
import { ErrorEnvelopeSchema } from '@fitness/contracts'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module'
import { configureApp } from '../src/http/configure-app'
import { testEnv } from './test-env'
import type { INestApplication } from '@nestjs/common'

describe('error envelope', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot(testEnv())],
    }).compile()
    app = moduleRef.createNestApplication()
    configureApp(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('answers unknown routes with NOT_FOUND and a matching request id', async () => {
    const response = await request(app.getHttpServer()).get('/nope')

    expect(response.status).toBe(404)
    const envelope = ErrorEnvelopeSchema.parse(response.body)
    expect(envelope.error.code).toBe('NOT_FOUND')
    expect(response.headers['x-request-id']).toBe(envelope.error.requestId)
  })

  it('answers malformed JSON with BAD_REQUEST', async () => {
    const response = await request(app.getHttpServer())
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":')

    expect(response.status).toBe(400)
    const envelope = ErrorEnvelopeSchema.parse(response.body)
    expect(envelope.error.code).toBe('BAD_REQUEST')
    expect(envelope.error.requestId).toBe(response.headers['x-request-id'])
  })

  it('gives every request its own request id', async () => {
    const first = await request(app.getHttpServer()).get('/nope')
    const second = await request(app.getHttpServer()).get('/nope')

    expect(first.headers['x-request-id']).not.toBe(
      second.headers['x-request-id'],
    )
  })
})
