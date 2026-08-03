import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

// Runs entirely on your own server — no API key, no per-call cost.
// Model: Xenova/all-MiniLM-L6-v2 (384-dim, ~90MB, downloaded & cached on
// first use under apps/api/.cache — good balance of speed/quality for
// lesson-notes-length text). @xenova/transformers is ESM-only, so it's
// dynamically imported here rather than statically, since the rest of
// this NestJS app compiles to CommonJS.
@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private extractor: any = null;
  private loading: Promise<any> | null = null;

  async onModuleInit() {
    // Warm the model up at boot so the first real chat request isn't slow.
    this.getExtractor().catch(err =>
      this.logger.warn('Embedding model warm-up failed (will retry on first use): ' + err?.message),
    );
  }

  private async getExtractor() {
    if (this.extractor) return this.extractor;
    if (!this.loading) {
      this.loading = (async () => {
        const { pipeline } = await import('@xenova/transformers');
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        this.logger.log('Local embedding model loaded (all-MiniLM-L6-v2).');
        return this.extractor;
      })();
    }
    return this.loading;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text.slice(0, 2000), { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  }
}