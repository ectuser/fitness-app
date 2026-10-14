import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { ApiError } from './api-error'
import { ZodValidationPipe } from './zod-validation.pipe'

const pipe = new ZodValidationPipe(
  z.object({ name: z.string().min(1) }).strict(),
)

describe('ZodValidationPipe', () => {
  it('returns the parsed value', () => {
    expect(pipe.transform({ name: 'Bench' })).toEqual({ name: 'Bench' })
  })

  it('throws a VALIDATION error with safe path and message details only', () => {
    let error: unknown
    try {
      pipe.transform({ name: '', secret: 'hunter2' })
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.code).toBe('VALIDATION')
    expect(apiError.status).toBe(422)
    expect(apiError.details?.length).toBeGreaterThan(0)
    expect(JSON.stringify(apiError.details)).not.toContain('hunter2')
  })
})
