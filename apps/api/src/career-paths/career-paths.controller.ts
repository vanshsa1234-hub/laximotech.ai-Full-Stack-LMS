import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CareerPathsService } from './career-paths.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Career Paths')
@Controller('career-paths')
export class CareerPathsController {
  constructor(private paths: CareerPathsService) {}

  @Public()
  @Get()
  findAll() { return this.paths.findAll(); }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.paths.findBySlug(slug); }
}
