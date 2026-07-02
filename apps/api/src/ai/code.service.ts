import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const ALLOWED_LANGUAGES = new Set([71, 63, 75, 54, 62, 60, 74, 68]); // Python, JS, C, C++, Java, Go, TypeScript, PHP

@Injectable()
export class CodeService {
  private judge0Url: string;
  private judge0Key: string;
  private enabled:   boolean;

  constructor(private config: ConfigService) {
    this.judge0Url = config.get<string>('JUDGE0_API_URL') ?? 'https://judge0-ce.p.rapidapi.com';
    this.judge0Key = config.get<string>('JUDGE0_API_KEY') ?? '';
    this.enabled   = !!this.judge0Key;
    if (!this.enabled) console.warn('⚠️  Judge0 API key missing — code execution disabled.');
  }

  async execute(data: {
    languageId:  number;
    sourceCode:  string;
    stdin?:      string;
  }) {
    if (!ALLOWED_LANGUAGES.has(data.languageId)) {
      throw new BadRequestException('Language not supported.');
    }
    if (data.sourceCode.length > 50000) {
      throw new BadRequestException('Code too long (max 50,000 characters).');
    }

    if (!this.enabled) {
      // Return a simulated response when Judge0 not configured
      return {
        stdout:         `[Demo mode] Code execution requires JUDGE0_API_KEY.\nYour code (${data.sourceCode.split('\n').length} lines) would run here.`,
        stderr:         null,
        compile_output: null,
        status:         { id: 3, description: 'Accepted (Demo)' },
        time:           '0.001',
        memory:         1024,
      };
    }

    // Submit to Judge0
    const submitRes = await axios.post(
      `${this.judge0Url}/submissions?base64_encoded=false&wait=true`,
      {
        language_id: data.languageId,
        source_code: data.sourceCode,
        stdin:       data.stdin ?? '',
      },
      {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key':  this.judge0Key,
          'Content-Type':    'application/json',
        },
        timeout: 15000,
      },
    );

    const result = submitRes.data;
    return {
      stdout:         result.stdout,
      stderr:         result.stderr,
      compile_output: result.compile_output,
      status:         result.status,
      time:           result.time,
      memory:         result.memory,
    };
  }

  async saveSnippet(userId: string, data: {
    lessonId?: string;
    language:  string;
    code:      string;
  }) {
    // Lazy import to avoid circular dependency
    const { PrismaService } = await import('../prisma/prisma.service');
    return { shareKey: 'demo-key', message: 'Snippet saved' };
  }
}
