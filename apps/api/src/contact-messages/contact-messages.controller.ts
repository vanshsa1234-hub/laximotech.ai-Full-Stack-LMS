import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactMessagesService } from './contact-messages.service';
import { Public }       from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role, ContactMessageStatus } from '@prisma/client';

@ApiTags('Contact Messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private messages: ContactMessagesService) {}

  @Public()
  @Post()
  create(@Body() body: { name: string; email: string; subject: string; message: string }) {
    return this.messages.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: Record<string, string>) { return this.messages.findAll(query); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: ContactMessageStatus }) {
    return this.messages.updateStatus(id, body.status);
  }
}
