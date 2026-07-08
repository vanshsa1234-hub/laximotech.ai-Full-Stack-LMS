// ── progress.module.ts ───────────────────────────────────────
import { Module }             from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService }    from './progress.service';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({ imports: [CertificatesModule], controllers: [ProgressController], providers: [ProgressService], exports: [ProgressService] })
export class ProgressModule {}
