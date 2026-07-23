import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

const ALLOWED_FOLDERS = ['thumbnails', 'blog-covers', 'career-paths', 'avatars', 'videos', 'pdfs', 'certificate-bg', 'documents'];
const MAX_SIZE_BYTES: Record<string, number> = {
  videos:    300 * 1024 * 1024, // 300MB — real lesson videos
  pdfs:      20  * 1024 * 1024, // 20MB
  documents: 20  * 1024 * 1024, // 20MB — lesson notes/slides (pdf/ppt/doc)
};
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB — images
// Optional per-lesson downloadable material: PDF, PowerPoint, or Word files.
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  // Hybrid upload: tries local disk first (fast, free, always available in
  // dev). If that write fails for any reason, automatically falls back to
  // AWS S3 — as long as real AWS credentials are configured in .env. Works
  // with neither, either, or both configured. Handles images, videos, and
  // PDFs — the actual byte limit is chosen from the folder being uploaded to.
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // buffer in memory so we can retry against S3 if disk write fails
    limits: { fileSize: MAX_SIZE_BYTES.videos }, // widest cap; per-folder cap is re-checked in the handler below
    fileFilter: (req, file, cb) => {
      const folder = req.body?.folder;
      const isVideo = file.mimetype.startsWith('video/');
      const isImage = file.mimetype.startsWith('image/');
      const isPdf   = file.mimetype === 'application/pdf';
      const isDoc   = DOCUMENT_MIME_TYPES.includes(file.mimetype);
      if (folder === 'videos' && !isVideo) return cb(new BadRequestException('Please select a video file.'), false);
      if (folder === 'pdfs' && !isPdf) return cb(new BadRequestException('Please select a PDF file.'), false);
      if (folder === 'documents' && !isDoc) return cb(new BadRequestException('Please select a PDF, PPT, or Word document.'), false);
      if (!folder || ALLOWED_FOLDERS.filter(f => !['videos', 'pdfs', 'documents'].includes(f)).includes(folder)) {
        if (!isImage) return cb(new BadRequestException('Please select an image file.'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: any, @Body('folder') folder: string, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'thumbnails';

    const maxSize = MAX_SIZE_BYTES[safeFolder] ?? DEFAULT_MAX_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(`File too large — max ${Math.round(maxSize / (1024 * 1024))}MB for ${safeFolder}.`);
    }

    const filename = `${uuid()}${extname(file.originalname)}`;

    // 1) Try local disk first.
    try {
      const dir = join(__dirname, '..', '..', 'uploads', safeFolder); // apps/api/uploads/<folder>, matches main.ts static path
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), file.buffer);
      const host = `${req.protocol}://${req.get('host')}`;
      return { url: `${host}/uploads/${safeFolder}/${filename}`, storedIn: 'local' };
    } catch (localErr) {
      console.warn('Local disk upload failed, falling back to S3:', localErr);
    }

    // 2) Fall back to AWS S3 if local disk write failed and S3 is configured.
    const key = `${safeFolder}/${filename}`;
    const publicUrl = await this.storageService.uploadBuffer(key, file.buffer, file.mimetype)
      .then(() => this.storageService.getPublicUrl(key));

    if (!publicUrl) {
      throw new BadRequestException('Upload failed — local disk write failed and AWS S3 is not configured.');
    }
    return { url: publicUrl, storedIn: 's3' };
  }

  // Direct S3 presigned-upload path — still available for callers that want
  // to upload straight from the browser to S3, bypassing this server entirely.
  // Requires real AWS credentials in .env.
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
