import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from './current-user.decorator'
import type { AuthSession } from './auth'

// The one protected route that proves the guard end to end.
@Controller('api/v1/me')
export class MeController {
  @Get()
  me(@CurrentUser() user: AuthSession['user']) {
    return { user: { id: user.id, name: user.name, email: user.email } }
  }
}
