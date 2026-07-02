import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  // Admin only — get a presigned URL to upload a file to S3
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('upload-url')
  getUploadUrl(
    @Body()
    body: {
      folder: 'videos' | 'pdfs' | 'thumbnails' | 'subtitles' | 'certificates' | 'code';
      fileName: string;
      contentType: string;
    },
  ) {
    return this.storageService.getUploadUrl(
      body.folder,
      body.fileName,
      body.contentType,
    );
  }
}
