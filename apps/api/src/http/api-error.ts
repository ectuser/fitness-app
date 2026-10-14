import type { ErrorCode } from '@fitness/contracts'

export type ErrorDetail = { path: string; message: string }

export const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  INTERNAL: 500,
  UNAVAILABLE: 503,
}

export class ApiError extends Error {
  readonly status: number

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Array<ErrorDetail>,
  ) {
    super(message)
    this.status = STATUS_BY_CODE[code]
  }
}
