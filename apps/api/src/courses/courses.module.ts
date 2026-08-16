// ── courses.module.ts ────────────────────────────────────────
import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService }    from './courses.service';
import { RagModule }         from '../ai/rag/rag.module';
import { AiModule }          from '../ai/ai.module';

@Module({ imports: [RagModule, AiModule], controllers: [CoursesController], providers: [CoursesService], exports: [CoursesService] })
export class CoursesModule {}