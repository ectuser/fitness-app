import { AllExceptionsFilter } from './all-exceptions.filter'
import { requestIdMiddleware } from './request-id.middleware'
import type { INestApplication } from '@nestjs/common'

export function configureApp(app: INestApplication) {
  app.use(requestIdMiddleware)
  app.useGlobalFilters(new AllExceptionsFilter())
}
