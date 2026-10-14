import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { parseEnv } from './config/env'
import { configureApp } from './http/configure-app'

const env = parseEnv(process.env)
const app = await NestFactory.create(AppModule.forRoot(env))
configureApp(app)
app.enableShutdownHooks()
await app.listen(env.PORT)
