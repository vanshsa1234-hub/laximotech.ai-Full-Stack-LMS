import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';

// pdf-parse exports as `module.exports = pdfParse` (no default wrapper),
// and this project doesn't have esModuleInterop enabled, so a normal
// `import pdfParse from 'pdf-parse'` resolves to undefined at runtime.
// require() sidesteps that entirely.
const pdfParse = require('pdf-parse');

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  async extract(buffer: Buffer, fileType: string): Promise<string> {
    const type = fileType.toLowerCase().replace('.', '');
    try {
      if (type === 'pdf') {
        const data = await pdfParse(buffer);
        return data.text ?? '';
      }
      if (type === 'docx' || type === 'doc') {
        const { value } = await mammoth.extractRawText({ buffer });
        return value ?? '';
      }
      // ppt/pptx: no lightweight pure-JS text extractor wired up yet.
      // Falls through and returns '' — ingestion just skips these for now.
      this.logger.warn(`No text extractor for fileType "${fileType}" — skipping.`);
      return '';
    } catch (err) {
      this.logger.error(`Text extraction failed for fileType "${fileType}":`, err as Error);
      return '';
    }
  }
}