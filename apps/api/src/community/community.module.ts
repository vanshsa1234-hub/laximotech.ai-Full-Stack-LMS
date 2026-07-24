import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { EnrolledGuard } from '../auth/guards/enrolled.guard';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, EnrolledGuard],
})
export class CommunityModule {}
