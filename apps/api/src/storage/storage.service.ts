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

@Injectable()
export class StorageService {
  private s3:      S3Client;
  private bucket:  string;
  private cdnUrl:  string;
  private enabled: boolean;

  constructor(private config: ConfigService) {
    const region    = config.get<string>('AWS_REGION')          ?? '';
    const accessKey = config.get<string>('AWS_ACCESS_KEY_ID')   ?? '';
    const secretKey = config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    this.bucket     = config.get<string>('AWS_S3_BUCKET')       ?? '';
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
    if (!this.enabled) return { uploadUrl: '', key: '' };
    const key = `${folder}/${uuid()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
    return { uploadUrl, key };
  }

  async getViewUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (key.startsWith('/')) return key;
    if (/^https?:\/\//i.test(key)) return key;
    if (!this.enabled || !key) return '';
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string {
    if (!this.cdnUrl || !key) return '';
    return `${this.cdnUrl}/${key}`;
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.enabled) return key;
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType }));
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.enabled || !key) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
