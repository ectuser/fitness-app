import { Controller, Post } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { sql } from 'drizzle-orm'
import { AppModule } from '../src/app.module'
import { DB } from '../src/database/database.module'
import { configureApp } from '../src/http/configure-app'
import { testEnv } from './test-env'
import type { INestApplication } from '@nestjs/common'
import type { Database } from '../src/database/database.module'
import type { Env } from '../src/config/env'

// A state-changing /api/v1 route for the origin guard tests: the product has
// none yet, and guards only run on matched routes.
@Controller('api/v1/test-echo')
class TestEchoController {
  @Post()
  echo() {
    return { ok: true }
  }
}

export type TestApp = {
  app: INestApplication
  db: Database
}

// Same bootstrap as main.ts: raw body parsing is off so configureApp can mount
// Better Auth ahead of the JSON parser.
export async function startApp(overrides: Partial<Env> = {}): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot(testEnv(overrides)), DiscoveryModule],
    controllers: [TestEchoController],
  }).compile()
  const app = moduleRef.createNestApplication({ bodyParser: false })
  configureApp(app)
  await app.init()
  return { app, db: app.get<Database>(DB) }
}

export async function cleanAuthTables(db: Database) {
  await db.execute(
    sql`truncate table "session", "account", "verification", "user" cascade`,
  )
}
