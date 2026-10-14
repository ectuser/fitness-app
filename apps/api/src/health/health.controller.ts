import { Controller, Get, Inject } from '@nestjs/common'
import { HealthResponseSchema } from '@fitness/contracts'
import { sql } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { ApiError } from '../http/api-error'
import type { HealthResponse } from '@fitness/contracts'
import type { Database } from '../database/database.module'

@Controller('health')
export class HealthController {
  constructor(@Inject(DB) private readonly db: Database) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.db.execute(sql`select 1`)
    } catch {
      throw new ApiError('UNAVAILABLE', 'The database is unreachable.')
    }
    return HealthResponseSchema.parse({ status: 'ok', database: 'up' })
  }
}
