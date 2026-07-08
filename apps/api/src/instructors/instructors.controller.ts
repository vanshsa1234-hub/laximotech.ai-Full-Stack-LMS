import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role }          from '@prisma/client';

@ApiTags('Instructors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('instructors')
export class InstructorsController {
  constructor(private instructors: InstructorsService) {}

  @Get()
  findAll() { return this.instructors.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.instructors.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.instructors.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.instructors.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.instructors.remove(id); }
}
