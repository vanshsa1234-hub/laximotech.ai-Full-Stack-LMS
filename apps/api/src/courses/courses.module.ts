// ── courses.module.ts ────────────────────────────────────────
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService }    from './courses.service';
import { RagModule }         from '../ai/rag/rag.module';

@Module({ imports: [RagModule], controllers: [CoursesController], providers: [CoursesService], exports: [CoursesService] })
export class CoursesModule {}