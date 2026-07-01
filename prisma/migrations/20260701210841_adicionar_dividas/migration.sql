-- CreateTable
CREATE TABLE "dividas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "valorParcela" DECIMAL(12,2) NOT NULL,
    "taxaJuros" DECIMAL(5,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dividas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dividas_usuarioId_idx" ON "dividas"("usuarioId");

-- AddForeignKey
ALTER TABLE "dividas" ADD CONSTRAINT "dividas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
