-- AlterTable
ALTER TABLE "dividas" ADD COLUMN     "quitada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quitadaEm" TIMESTAMP(3),
ADD COLUMN     "valorOriginal" DECIMAL(12,2) NOT NULL DEFAULT 0;
