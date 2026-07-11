import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com/file'),
}));

describe('StorageService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('when AWS credentials are not configured', () => {
    let service: StorageService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [StorageService, { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } }],
      }).compile();
      service = moduleRef.get(StorageService);
    });

    it('getUploadUrl returns empty values', async () => {
      const result = await service.getUploadUrl('thumbnails', 'a.png', 'image/png');
      expect(result).toEqual({ uploadUrl: '', key: '', publicUrl: '' });
    });

    it('getViewUrl returns empty string for a plain S3 key', async () => {
      await expect(service.getViewUrl('videos/a.mp4')).resolves.toBe('');
    });

    it('getViewUrl passes through absolute paths unchanged', async () => {
      await expect(service.getViewUrl('/local/path.mp4')).resolves.toBe('/local/path.mp4');
    });

    it('getViewUrl passes through full URLs unchanged', async () => {
      await expect(service.getViewUrl('https://cdn.example.com/a.mp4')).resolves.toBe('https://cdn.example.com/a.mp4');
    });

    it('getPublicUrl returns empty string for a plain key with no CDN configured', () => {
      expect(service.getPublicUrl('thumbnails/a.png')).toBe('');
    });

    it('getPublicUrl passes through an already-absolute URL', () => {
      expect(service.getPublicUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
    });

    it('getPublicUrl returns empty string for an empty key', () => {
      expect(service.getPublicUrl('')).toBe('');
    });

    it('uploadBuffer returns the key unchanged without calling S3', async () => {
      await expect(service.uploadBuffer('key', Buffer.from('x'), 'image/png')).resolves.toBe('key');
    });

    it('deleteFile resolves without error and without calling S3', async () => {
      await expect(service.deleteFile('key')).resolves.toBeUndefined();
    });

    it('deleteFile resolves for an empty key', async () => {
      await expect(service.deleteFile('')).resolves.toBeUndefined();
    });
  });

  describe('when AWS credentials are configured', () => {
    let service: StorageService;

    beforeEach(async () => {
      const config = {
        get: jest.fn((key: string) => ({
          AWS_REGION: 'ap-south-1',
          AWS_ACCESS_KEY_ID: 'AKIA...',
          AWS_SECRET_ACCESS_KEY: 'secret',
          AWS_S3_BUCKET: 'my-bucket',
          CLOUDFRONT_URL: 'https://cdn.laximotech.ai',
        }[key])),
      };
      const moduleRef = await Test.createTestingModule({
        providers: [StorageService, { provide: ConfigService, useValue: config }],
      }).compile();
      service = moduleRef.get(StorageService);

      // Stub the S3 client's send method so no real network calls happen.
      (service as any).s3 = { send: jest.fn().mockResolvedValue({}) };
    });

    it('getUploadUrl returns a real presigned URL and CDN public URL', async () => {
      const result = await service.getUploadUrl('videos', 'lesson.mp4', 'video/mp4');
      expect(result.uploadUrl).toBe('https://signed.example.com/file');
      expect(result.publicUrl).toContain('https://cdn.laximotech.ai/');
    });

    it('getViewUrl returns a signed URL for a plain key', async () => {
      await expect(service.getViewUrl('videos/a.mp4')).resolves.toBe('https://signed.example.com/file');
    });

    it('getPublicUrl prefers the CDN URL when configured', () => {
      expect(service.getPublicUrl('thumbnails/a.png')).toBe('https://cdn.laximotech.ai/thumbnails/a.png');
    });

    it('uploadBuffer sends a PutObjectCommand and returns the key', async () => {
      await expect(service.uploadBuffer('key', Buffer.from('x'), 'image/png')).resolves.toBe('key');
      expect((service as any).s3.send).toHaveBeenCalled();
    });

    it('deleteFile sends a DeleteObjectCommand', async () => {
      await service.deleteFile('key');
      expect((service as any).s3.send).toHaveBeenCalled();
    });
  });

  describe('getPublicUrl fallback to direct S3 URL when enabled but no CDN', () => {
    it('builds a direct S3 URL', async () => {
      const config = {
        get: jest.fn((key: string) => ({
          AWS_REGION: 'ap-south-1',
          AWS_ACCESS_KEY_ID: 'AKIA...',
          AWS_SECRET_ACCESS_KEY: 'secret',
          AWS_S3_BUCKET: 'my-bucket',
        }[key])),
      };
      const moduleRef = await Test.createTestingModule({
        providers: [StorageService, { provide: ConfigService, useValue: config }],
      }).compile();
      const service = moduleRef.get(StorageService);

      expect(service.getPublicUrl('thumbnails/a.png')).toBe('https://my-bucket.s3.ap-south-1.amazonaws.com/thumbnails/a.png');
    });
  });
});
