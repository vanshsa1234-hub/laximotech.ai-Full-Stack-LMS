import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

import { mkdirSync, writeFileSync } from 'fs';

describe('StorageController', () => {
  let controller: StorageController;
  let service: any;

  const fakeReq: any = { protocol: 'https', get: () => 'api.laximotech.ai' };
  const fakeImageFile: any = { originalname: 'a.png', mimetype: 'image/png', size: 1000, buffer: Buffer.from('x') };

  beforeEach(async () => {
    service = {
      uploadBuffer: jest.fn().mockResolvedValue(undefined),
      getPublicUrl: jest.fn().mockReturnValue('https://cdn.example.com/thumbnails/fixed-uuid.png'),
      getUploadUrl: jest.fn().mockResolvedValue({ uploadUrl: 'https://s3.example.com/put' }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: service }],
    }).compile();
    controller = moduleRef.get(StorageController);
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('rejects when no file is provided', async () => {
      await expect(controller.uploadFile(null, 'thumbnails', fakeReq)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a file that exceeds the folder size limit', async () => {
      const bigFile = { ...fakeImageFile, size: 10 * 1024 * 1024 };
      await expect(controller.uploadFile(bigFile, 'thumbnails', fakeReq)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('falls back to the "thumbnails" folder for an unrecognized folder name', async () => {
      const result = await controller.uploadFile(fakeImageFile, 'not-a-real-folder', fakeReq);
      expect(result.storedIn).toBe('local');
      expect(result.url).toContain('/uploads/thumbnails/');
    });

    it('writes to local disk and returns a local URL when disk write succeeds', async () => {
      (mkdirSync as jest.Mock).mockReturnValue(undefined);
      (writeFileSync as jest.Mock).mockReturnValue(undefined);

      const result = await controller.uploadFile(fakeImageFile, 'thumbnails', fakeReq);
      expect(result.storedIn).toBe('local');
      expect(result.url).toBe('https://api.laximotech.ai/uploads/thumbnails/fixed-uuid.png');
      expect(service.uploadBuffer).not.toHaveBeenCalled();
    });

    it('falls back to S3 when the local disk write throws', async () => {
      (mkdirSync as jest.Mock).mockImplementation(() => { throw new Error('EACCES'); });

      const result = await controller.uploadFile(fakeImageFile, 'thumbnails', fakeReq);
      expect(service.uploadBuffer).toHaveBeenCalled();
      expect(result.storedIn).toBe('s3');
      expect(result.url).toBe('https://cdn.example.com/thumbnails/fixed-uuid.png');
    });

    it('throws when both local disk and S3 fail', async () => {
      (mkdirSync as jest.Mock).mockImplementation(() => { throw new Error('EACCES'); });
      service.getPublicUrl.mockReturnValue('');

      await expect(controller.uploadFile(fakeImageFile, 'thumbnails', fakeReq)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('getUploadUrl forwards folder, fileName, and contentType', () => {
    controller.getUploadUrl({ folder: 'videos', fileName: 'a.mp4', contentType: 'video/mp4' });
    expect(service.getUploadUrl).toHaveBeenCalledWith('videos', 'a.mp4', 'video/mp4');
  });
});
