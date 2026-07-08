import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService }    from './quizzes.service';
import { CertificatesModule } from '../certificates/certificates.module';
import { ProgressModule } from '../progress/progress.module';

@Module({ imports: [CertificatesModule, ProgressModule], controllers: [QuizzesController], providers: [QuizzesService], exports: [QuizzesService] })
export class QuizzesModule {}
