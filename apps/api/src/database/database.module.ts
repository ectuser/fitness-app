import { Global, Inject, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { ENV } from '../config/config.module'
import * as schema from './schema'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { OnApplicationShutdown } from '@nestjs/common'
import type { Env } from '../config/env'

export const PG_POOL = Symbol('PG_POOL')
export const DB = Symbol('DB')

export type Database = NodePgDatabase<typeof schema>

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ENV],
      useFactory: (env: Env) =>
        new pg.Pool({
          connectionString: env.DATABASE_URL,
          connectionTimeoutMillis: 2000,
        }),
    },
    {
      provide: DB,
      inject: [PG_POOL],
      useFactory: (pool: pg.Pool): Database => drizzle(pool, { schema }),
    },
  ],
  exports: [PG_POOL, DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async onApplicationShutdown() {
    await this.pool.end()
  }
}
