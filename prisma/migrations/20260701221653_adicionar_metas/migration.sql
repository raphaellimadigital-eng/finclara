-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('RESERVA', 'VIAGEM', 'CARRO', 'FACULDADE', 'APOSENTADORIA', 'OUTRO');

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoMeta" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorAlvo" DECIMAL(12,2) NOT NULL,
    "valorAtual" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "prazo" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metas_usuarioId_idx" ON "metas"("usuarioId");

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
