import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { EnrolledGuard } from '../auth/guards/enrolled.guard';

@Global()
@Module({
  providers: [StorageService, EnrolledGuard],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
