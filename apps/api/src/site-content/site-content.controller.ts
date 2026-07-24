import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteContentService } from './site-content.service';
import { Public }        from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role }          from '@prisma/client';

@ApiTags('Site Content')
@Controller('site-content')
export class SiteContentController {
  constructor(private siteContent: SiteContentService) {}

  @Public()
  @Get(':key')
  get(@Param('key') key: string) { return this.siteContent.get(key); }

  // ── Admin ────────────────────────────────────────────────
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  getAll() { return this.siteContent.getAll(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: { data: any }) {
    return this.siteContent.upsert(key, body.data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':key')
  resetToDefault(@Param('key') key: string) { return this.siteContent.resetToDefault(key); }
}
