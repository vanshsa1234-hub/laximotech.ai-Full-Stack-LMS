import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DemoRequestsService } from './demo-requests.service';
import { Public }       from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role, DemoRequestStatus } from '@prisma/client';

@ApiTags('Demo Requests')
@Controller('demo-requests')
export class DemoRequestsController {
  constructor(private demoRequests: DemoRequestsService) {}

  @Public()
  @Post()
  create(@Body() body: { name: string; phone: string; email: string; topic: string; slot: string; mode: string }) {
    return this.demoRequests.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.demoRequests.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: DemoRequestStatus }) {
    return this.demoRequests.updateStatus(id, body.status);
  }
}
