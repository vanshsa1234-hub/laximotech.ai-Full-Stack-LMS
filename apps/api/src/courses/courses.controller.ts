// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\api\src\courses\courses.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService }  from './courses.service';
import { Public }          from '../auth/decorators/public.decorator';
import { JwtAuthGuard }    from '../auth/guards/jwt-auth.guard';
import { RolesGuard }      from '../auth/guards/roles.guard';
import { Roles }           from '../auth/decorators/roles.decorator';
import { CurrentUser }     from '../auth/decorators/current-user.decorator';
import { Role }            from '@prisma/client';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private courses: CoursesService) {}

  @Public()
  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.courses.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Get('admin/:courseId/builder')
  getBuilder(@Param('courseId') courseId: string) {
    return this.courses.getBuilder(courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('admin/:courseId/sections')
  createSection(@Param('courseId') courseId: string, @Body() body: any) {
    return this.courses.createSection(courseId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch('admin/sections/:sectionId')
  updateSection(@Param('sectionId') sectionId: string, @Body() body: any) {
    return this.courses.updateSection(sectionId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('admin/sections/:sectionId/lessons')
  createLesson(@Param('sectionId') sectionId: string, @Body() body: any) {
    return this.courses.createLesson(sectionId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch('admin/lessons/:lessonId')
  updateLesson(@Param('lessonId') lessonId: string, @Body() body: any) {
    return this.courses.updateLesson(lessonId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('admin/lessons/:lessonId/quiz')
  upsertLessonQuiz(@Param('lessonId') lessonId: string, @Body() body: any) {
    return this.courses.upsertLessonQuiz(lessonId, body);
  }

  // Optional per-lesson documents (notes/slides/PDFs/etc), managed from the admin panel.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('admin/lessons/:lessonId/documents')
  addLessonDocument(@Param('lessonId') lessonId: string, @Body() body: any) {
    return this.courses.addLessonDocument(lessonId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch('admin/lessons/documents/:documentId')
  updateLessonDocument(@Param('documentId') documentId: string, @Body() body: any) {
    return this.courses.updateLessonDocument(documentId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Delete('admin/lessons/documents/:documentId')
  deleteLessonDocument(@Param('documentId') documentId: string) {
    return this.courses.deleteLessonDocument(documentId);
  }


  // Admin only — includes drafts/unpublished courses
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Get('admin/all')
  findAllAdmin(@Query() query: Record<string, string>) {
    return this.courses.findAllForAdmin(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.courses.findBySlug(slug);
  }

  // Admin only
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    // Instructors can only ever create courses under their own name — this
    // prevents impersonation. Admins may assign any real instructor from
    // the instructor roster (never trusted blindly — validated in the service).
    const instructorId = user.role === 'ADMIN' && body.instructorId ? body.instructorId : user.id;
    return this.courses.create({ ...body, instructorId });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    // Only admins may reassign a course's instructor.
    const payload = user.role === 'ADMIN' ? body : { ...body, instructorId: undefined };
    return this.courses.update(id, payload);
  }
}
