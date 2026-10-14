import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthSession } from './auth'

export type AuthenticatedRequest = Request & { authSession?: AuthSession }

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthSession['user'] => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.authSession) {
      throw new Error('CurrentUser used on a route the session guard skipped')
    }
    return request.authSession.user
  },
)
