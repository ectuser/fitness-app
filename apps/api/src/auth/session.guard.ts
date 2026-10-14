import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { fromNodeHeaders } from 'better-auth/node'
import { AUTH } from './auth.tokens'
import { IS_PUBLIC } from './public.decorator'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { Response } from 'express'
import type { Auth } from './auth'
import type { AuthenticatedRequest } from './current-user.decorator'

// Global default-deny: every route needs a session unless it is @Public().
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    )
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const { headers, response: session } = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
      returnHeaders: true,
    })
    if (!session) throw new UnauthorizedException()
    // A server-side refresh extends the session row only; forward the cookie
    // Better Auth issues for it, or the browser copy would expire on schedule.
    const response = context.switchToHttp().getResponse<Response>()
    for (const cookie of headers.getSetCookie()) {
      response.append('Set-Cookie', cookie)
    }
    request.authSession = session
    return true
  }
}
