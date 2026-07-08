import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CareerPathsService } from './career-paths.service';
import { Public }        from '../auth/decorators/public.decorator';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role }          from '@prisma/client';

@ApiTags('Career Paths')
@Controller('career-paths')
export class CareerPathsController {
  constructor(private paths: CareerPathsService) {}

  @Public()
  @Get()
  findAll() { return this.paths.findAll(); }

  // ── Admin ────────────────────────────────────────────────
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  findByIdAdmin(@Param('id') id: string) { return this.paths.findById(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) { return this.paths.create(body); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.paths.update(id, body); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.paths.remove(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/courses')
  addCourse(@Param('id') id: string, @Body() body: { courseId: string; step: number; label: string }) {
    return this.paths.addCourse(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('courses/:entryId')
  removeCourse(@Param('entryId') entryId: string) { return this.paths.removeCourse(entryId); }

  // Public slug lookup MUST be last - single-segment dynamic route.
  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.paths.findBySlug(slug); }
}
