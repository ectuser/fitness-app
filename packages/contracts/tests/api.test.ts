import { describe, expect, it } from 'vitest'
import { ErrorEnvelopeSchema, HealthResponseSchema } from '../src'

describe('HealthResponseSchema', () => {
  it('accepts a healthy response', () => {
    expect(
      HealthResponseSchema.parse({ status: 'ok', database: 'up' }),
    ).toEqual({ status: 'ok', database: 'up' })
  })

  it('rejects an unknown status', () => {
    expect(
      HealthResponseSchema.safeParse({ status: 'fine', database: 'up' })
        .success,
    ).toBe(false)
  })
})

describe('ErrorEnvelopeSchema', () => {
  it('accepts an error with a request id and optional details', () => {
    const envelope = {
      error: {
        code: 'VALIDATION',
        message: 'Invalid request',
        details: [{ path: 'name', message: 'Required' }],
        requestId: 'req-1',
      },
    }
    expect(ErrorEnvelopeSchema.parse(envelope)).toEqual(envelope)
  })

  it('rejects an unknown error code', () => {
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: { code: 'TEAPOT', message: 'x', requestId: 'r' },
      }).success,
    ).toBe(false)
  })
})
