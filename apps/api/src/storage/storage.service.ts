import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  private s3:      S3Client;
  private bucket:  string;
  private region:  string;
  private cdnUrl:  string;
  private enabled: boolean;

  constructor(private config: ConfigService) {
    const region    = config.get<string>('AWS_REGION')          ?? '';
    const accessKey = config.get<string>('AWS_ACCESS_KEY_ID')   ?? '';
    const secretKey = config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    this.bucket     = config.get<string>('AWS_S3_BUCKET')       ?? '';
    this.region     = region;
    this.cdnUrl     = config.get<string>('CLOUDFRONT_URL')      ?? '';
    this.enabled    = !!(region && accessKey && secretKey && this.bucket);

    if (this.enabled) {
      this.s3 = new S3Client({
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
    } else {
      console.warn('⚠️  AWS S3 not configured — file uploads/downloads will not work.');
      // Provide a dummy client so NestJS DI doesn't crash
      this.s3 = null as any;
    }
  }

  async getUploadUrl(
    folder: 'videos' | 'pdfs' | 'thumbnails' | 'subtitles' | 'certificates' | 'code',
    fileName: string,
    contentType: string,
    expiresInSeconds = 3600,
  ) {
    if (!this.enabled) return { uploadUrl: '', key: '', publicUrl: '' };
    const key = `${folder}/${uuid()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
    return { uploadUrl, key, publicUrl: this.getPublicUrl(key) };
  }

  async getViewUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (key.startsWith('/')) return key;
    if (/^https?:\/\//i.test(key)) return key;
    if (!this.enabled || !key) return '';
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string {
    if (!key) return '';
    if (/^https?:\/\//i.test(key)) return key; // already a full URL (e.g. manually pasted)
    if (this.cdnUrl) return `${this.cdnUrl}/${key}`;
    // No CDN configured yet — fall back to a direct S3 URL so images still
    // work. Requires the bucket to allow public GetObject for these prefixes
    // (thumbnails/blog-covers/career-path-icons); private content (videos,
    // certificates) should keep using getViewUrl's signed URLs instead.
    if (this.enabled) return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return '';
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.enabled) return key;
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType }));
    return key;
  }

  // Same "local disk first, S3 fallback" pattern already used by the general
  // /storage/upload endpoint — but for buffers generated on the server (like
  // certificate PDFs) rather than files coming from a multipart request.
  // Returns a value ready to store directly as pdfUrl/imageUrl: either a
  // '/uploads/...' relative path (served statically by main.ts) or, if local
  // disk write fails, an S3 key (resolved later via getViewUrl/getPublicUrl).
  async saveGeneratedFile(folder: string, filename: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      const dir = join(__dirname, '..', '..', 'uploads', folder); // apps/api/uploads/<folder>
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), buffer);
      // Full URL, not a relative path — this runs outside any HTTP request
      // context (e.g. during course-completion), so there's no req.protocol/
      // host to read like storage.controller.ts does; build it from the
      // API's own port instead so it always points at the API server (4000),
      // not wherever the browser happens to be (e.g. the web app on 3000).
      const port = this.config.get<string>('PORT') ?? '4000';
      return `http://localhost:${port}/uploads/${folder}/${filename}`;
    } catch (localErr) {
      console.warn('Local disk write failed for generated file, falling back to S3:', localErr);
    }

    const key = `${folder}/${filename}`;
    await this.uploadBuffer(key, buffer, contentType);
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.enabled || !key) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
