-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'INTERACTIVE_VIZ';

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "vizType" TEXT;
