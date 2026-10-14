import { toNodeHandler } from 'better-auth/node'
import { AUTH } from '../auth/auth.tokens'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { requestIdMiddleware } from './request-id.middleware'
import type { INestApplication } from '@nestjs/common'
import type { Auth } from '../auth/auth'
import type { NestExpressApplication } from '@nestjs/platform-express'

// The app must be created with `bodyParser: false`: Better Auth reads the raw
// request body, so its handler is mounted before the body parsers.
export function configureApp(app: INestApplication) {
  const express = app as NestExpressApplication
  express.use(requestIdMiddleware)
  express
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(app.get<Auth>(AUTH)))
  express.useBodyParser('json')
  express.useBodyParser('urlencoded', { extended: true })
  app.useGlobalFilters(new AllExceptionsFilter())
}
