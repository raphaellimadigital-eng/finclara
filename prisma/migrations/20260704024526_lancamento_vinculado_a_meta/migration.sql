-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "metaId" TEXT;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
