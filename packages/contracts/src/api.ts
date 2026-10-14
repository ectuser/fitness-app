import { z } from 'zod'

export const HealthResponseSchema = z
  .object({
    status: z.enum(['ok', 'unavailable']),
    database: z.enum(['up', 'down']),
  })
  .strict()

export const ErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'VALIDATION',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'UNAVAILABLE',
  'INTERNAL',
])

export const ErrorDetailSchema = z
  .object({
    path: z.string(),
    message: z.string(),
  })
  .strict()

export const ErrorEnvelopeSchema = z
  .object({
    error: z
      .object({
        code: ErrorCodeSchema,
        message: z.string(),
        details: z.array(ErrorDetailSchema).optional(),
        requestId: z.string().min(1),
      })
      .strict(),
  })
  .strict()

export type HealthResponse = z.infer<typeof HealthResponseSchema>
export type ErrorCode = z.infer<typeof ErrorCodeSchema>
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>
