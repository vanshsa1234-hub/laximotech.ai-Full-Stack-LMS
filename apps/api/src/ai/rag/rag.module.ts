import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { EmbeddingsService } from './embeddings.service';
import { TextExtractorService } from './text-extractor.service';

// PrismaService and StorageService are both @Global() modules already,
// so they don't need to be imported here.
@Module({
  providers: [RagService, EmbeddingsService, TextExtractorService],
  exports: [RagService],
})
export class RagModule {}