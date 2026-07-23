import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CodeService }   from './code.service';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';
import { Public }        from '../auth/decorators/public.decorator';
import { Throttle }      from '@nestjs/throttler';

@ApiTags('Code')
@Controller('code')
export class CodeController {
  constructor(private code: CodeService) {}

  // Rate limited: 30 executions per minute per user
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('run')
  run(
    @CurrentUser() user: any,
    @Body() body: { languageId: number; sourceCode: string; stdin?: string },
  ) {
    return this.code.execute(body);
  }

  // Public share link execution
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('run/public')
  runPublic(
    @Body() body: { languageId: number; sourceCode: string; stdin?: string },
  ) {
    return this.code.execute(body);
  }
}
