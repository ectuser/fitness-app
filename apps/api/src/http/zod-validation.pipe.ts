import { ApiError } from './api-error'
import type { PipeTransform } from '@nestjs/common'
import type { ZodType } from 'zod'

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value)
    if (result.success) {
      return result.data
    }
    // Only paths and messages leave the server: never values or Zod internals.
    throw new ApiError(
      'VALIDATION',
      'The request is invalid.',
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }
}
