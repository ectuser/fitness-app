import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ENV } from '../config/config.module'
import { DB } from '../database/database.module'
import { createAuth } from './auth'
import { AUTH } from './auth.tokens'
import { MeController } from './me.controller'
import { OriginGuard } from './origin.guard'
import { SessionGuard } from './session.guard'

@Module({
  controllers: [MeController],
  providers: [
    { provide: AUTH, inject: [ENV, DB], useFactory: createAuth },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  exports: [AUTH],
})
export class AuthModule {}
