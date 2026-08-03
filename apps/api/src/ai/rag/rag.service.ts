import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { EmbeddingsService } from './embeddings.service';
import { TextExtractorService } from './text-extractor.service';
import { chunkText } from './chunker.util';

export type RetrievedChunk = { text: string; source: 'pdf' | 'notes' };

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private embeddings: EmbeddingsService,
    private extractor: TextExtractorService,
  ) {}

  // ── Ingestion ────────────────────────────────────────────────

  // Lesson.textContent (manually authored notes) — re-run whenever it's edited.
  async ingestLessonNotes(lessonId: string, courseId: string, textContent: string | null | undefined) {
    await this.prisma.$executeRaw`DELETE FROM lesson_chunks WHERE "lessonId" = ${lessonId} AND "sourceType" = 'notes'`;
    if (!textContent?.trim()) return;
    await this.ingestText(lessonId, courseId, 'notes', textContent, null);
  }

  // A LessonDocument (PDF/DOCX) — re-run whenever one is added or replaced.
  async ingestLessonDocument(documentId: string, lessonId: string, courseId: string, fileUrl: string, fileType: string) {
    await this.prisma.$executeRaw`DELETE FROM lesson_chunks WHERE "sourceDocId" = ${documentId}`;
    const type = fileType.toLowerCase();
    if (type !== 'pdf' && type !== 'docx' && type !== 'doc') return; // ppt/pptx not supported yet

    try {
      const buffer = await this.storage.getFileBuffer(fileUrl);
      const text = await this.extractor.extract(buffer, fileType);
      if (!text.trim()) {
        this.logger.warn(`No extractable text found in document ${documentId} (lesson ${lessonId}).`);
        return;
      }
      await this.ingestText(lessonId, courseId, 'pdf', text, documentId);
    } catch (err) {
      this.logger.error(`Ingestion failed for document ${documentId}:`, err as Error);
    }
  }

  async deleteChunksForDocument(documentId: string) {
    await this.prisma.$executeRaw`DELETE FROM lesson_chunks WHERE "sourceDocId" = ${documentId}`;
  }

  private async ingestText(lessonId: string, courseId: string, sourceType: 'pdf' | 'notes', text: string, sourceDocId: string | null) {
    const chunks = chunkText(text);
    for (let i = 0; i < chunks.length; i++) {
      const vector = await this.embeddings.embed(chunks[i]);
      const vectorLiteral = `[${vector.join(',')}]`;
      await this.prisma.$executeRaw`
        INSERT INTO lesson_chunks (id, "lessonId", "courseId", "sourceType", "sourceDocId", content, embedding, "chunkIndex", "createdAt")
        VALUES (gen_random_uuid(), ${lessonId}, ${courseId}, ${sourceType}, ${sourceDocId}, ${chunks[i]}, ${vectorLiteral}::vector, ${i}, now())
      `;
    }
    this.logger.log(`Ingested ${chunks.length} chunk(s) for lesson ${lessonId} (source: ${sourceType}).`);
  }

  // ── Retrieval ────────────────────────────────────────────────
  // Scoped to the current lesson first; if that lesson has no chunks yet
  // (nothing ingested) or nothing similar enough, falls back to the whole
  // course so the answer still has something relevant to work with.
  async retrieveContext(lessonId: string, courseId: string, query: string, topK = 5): Promise<RetrievedChunk[]> {
    if (!query?.trim()) return [];
    const vector = await this.embeddings.embed(query);
    const vectorLiteral = `[${vector.join(',')}]`;

    let rows: { content: string; sourceType: string; similarity: number }[] = await this.prisma.$queryRaw`
      SELECT content, "sourceType", 1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM lesson_chunks
      WHERE "lessonId" = ${lessonId}
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;

    const hasGoodMatch = rows.some(r => r.similarity > 0.3);
    if (!hasGoodMatch) {
      rows = await this.prisma.$queryRaw`
        SELECT content, "sourceType", 1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
        FROM lesson_chunks
        WHERE "courseId" = ${courseId}
        ORDER BY embedding <=> ${vectorLiteral}::vector
        LIMIT ${topK}
      `;
    }

    return rows.map(r => ({ text: r.content, source: r.sourceType as 'pdf' | 'notes' }));
  }
}