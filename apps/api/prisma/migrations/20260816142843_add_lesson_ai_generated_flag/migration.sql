-- DropIndex
DROP INDEX "lesson_chunks_embedding_idx";

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "isAiGenerated" BOOLEAN NOT NULL DEFAULT false;
