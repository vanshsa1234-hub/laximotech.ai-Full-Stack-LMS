-- Enable pgvector for similarity search (RAG / AI Study Buddy)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "lesson_chunks" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceDocId" TEXT,
    "content" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lesson_chunks_lessonId_idx" ON "lesson_chunks"("lessonId");
CREATE INDEX "lesson_chunks_courseId_idx" ON "lesson_chunks"("courseId");

-- Approximate nearest-neighbour index for fast cosine similarity search.
-- ivfflat needs a bit of data to build well; fine to add now since it
-- rebuilds cheaply and the table starts empty.
CREATE INDEX "lesson_chunks_embedding_idx" ON "lesson_chunks"
  USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);