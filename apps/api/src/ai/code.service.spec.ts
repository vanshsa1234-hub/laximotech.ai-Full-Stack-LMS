import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CodeService } from './code.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CodeService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('when no Judge0 key is configured (demo mode)', () => {
    let service: CodeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [CodeService, { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } }],
      }).compile();
      service = moduleRef.get(CodeService);
    });

    it('rejects unsupported language ids', async () => {
      await expect(service.execute({ languageId: 999, sourceCode: 'print(1)' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects source code over 50,000 characters', async () => {
      await expect(
        service.execute({ languageId: 71, sourceCode: 'a'.repeat(50001) }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns a simulated demo response instead of calling Judge0', async () => {
      const result = await service.execute({ languageId: 71, sourceCode: 'print(1)\nprint(2)' });
      expect(result.status.description).toBe('Accepted (Demo)');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('when Judge0 is configured', () => {
    let service: CodeService;

    beforeEach(async () => {
      const config = {
        get: jest.fn((key: string) => {
          if (key === 'JUDGE0_API_URL') return 'https://judge0.example.com';
          if (key === 'JUDGE0_API_KEY') return 'test-key';
          return undefined;
        }),
      };
      const moduleRef = await Test.createTestingModule({
        providers: [CodeService, { provide: ConfigService, useValue: config }],
      }).compile();
      service = moduleRef.get(CodeService);
    });

    it('submits the code to Judge0 and returns the result', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { stdout: 'hello', stderr: null, compile_output: null, status: { id: 3 }, time: '0.01', memory: 100 },
      });

      const result = await service.execute({ languageId: 71, sourceCode: 'print("hello")' });
      expect(result.stdout).toBe('hello');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/submissions'),
        expect.objectContaining({ language_id: 71, source_code: 'print("hello")' }),
        expect.any(Object),
      );
    });

    it('still rejects unsupported languages even when Judge0 is configured', async () => {
      await expect(service.execute({ languageId: 1, sourceCode: 'x' })).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('saveSnippet', () => {
    it('returns a demo share key', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [CodeService, { provide: ConfigService, useValue: { get: jest.fn() } }],
      }).compile();
      const service = moduleRef.get(CodeService);

      const result = await service.saveSnippet('u1', { language: 'python', code: 'print(1)' });
      expect(result.shareKey).toBe('demo-key');
    });
  });
});
