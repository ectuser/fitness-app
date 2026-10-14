import { Inject, Injectable } from '@nestjs/common'
import { ApiError } from '../http/api-error'
import { ENV } from '../config/config.module'
import { trustedOrigins } from './auth'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { Env } from '../config/env'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// CSRF layer for the cookie-authenticated API: Better Auth checks origins on
// /api/auth/* only, so state-changing /api/v1 requests get the same check.
@Injectable()
export class OriginGuard implements CanActivate {
  private readonly trusted: Set<string>

  constructor(@Inject(ENV) env: Env) {
    this.trusted = new Set(trustedOrigins(env))
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()
    if (SAFE_METHODS.has(request.method)) return true
    if (!request.path.startsWith('/api/v1/')) return true

    const origin = request.headers.origin
    const fetchSite = request.headers['sec-fetch-site']
    if ((origin && !this.trusted.has(origin)) || fetchSite === 'cross-site') {
      throw new ApiError('FORBIDDEN', 'Cross-origin request rejected.')
    }
    return true
  }
}
