-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "serieRecorrenciaId" TEXT;

-- CreateIndex
CREATE INDEX "lancamentos_serieRecorrenciaId_idx" ON "lancamentos"("serieRecorrenciaId");
