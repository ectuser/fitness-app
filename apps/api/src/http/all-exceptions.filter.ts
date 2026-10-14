import { Catch, HttpException, Logger } from '@nestjs/common'
import { ApiError } from './api-error'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { ErrorCode, ErrorEnvelope } from '@fitness/contracts'
import type { Response } from 'express'

function codeForStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHENTICATED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 422:
      return 'VALIDATION'
    case 503:
      return 'UNAVAILABLE'
    default:
      return status >= 400 && status < 500 ? 'BAD_REQUEST' : 'INTERNAL'
  }
}

const SAFE_MESSAGES: Record<ErrorCode, string> = {
  BAD_REQUEST: 'The request could not be understood.',
  VALIDATION: 'The request is invalid.',
  UNAUTHENTICATED: 'Authentication is required.',
  FORBIDDEN: 'You are not allowed to do this.',
  NOT_FOUND: 'The resource was not found.',
  CONFLICT: 'The request conflicts with the current state.',
  UNAVAILABLE: 'The service is temporarily unavailable.',
  INTERNAL: 'Something went wrong.',
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const requestId = String(response.locals.requestId ?? '')

    let status: number
    let code: ErrorCode
    let message: string
    let details: ApiError['details']

    if (exception instanceof ApiError) {
      ;({ status, code, message, details } = exception)
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      code = codeForStatus(status)
      message = SAFE_MESSAGES[code]
    } else if (isHttpError(exception)) {
      // Errors raised by the Express body parser (for example malformed JSON).
      status = exception.status
      code = codeForStatus(status)
      message = SAFE_MESSAGES[code]
    } else {
      status = 500
      code = 'INTERNAL'
      message = SAFE_MESSAGES.INTERNAL
      this.logger.error(
        `Unhandled error for request ${requestId}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    const body: ErrorEnvelope = {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        requestId,
      },
    }
    response.status(status).json(body)
  }
}

function isHttpError(value: unknown): value is { status: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'number'
  )
}
