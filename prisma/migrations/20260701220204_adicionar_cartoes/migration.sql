-- CreateTable
CREATE TABLE "cartoes_credito" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "limite" DECIMAL(12,2) NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartoes_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_parceladas" (
    "id" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "numParcelas" INTEGER NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_parceladas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cartoes_credito_usuarioId_idx" ON "cartoes_credito"("usuarioId");

-- CreateIndex
CREATE INDEX "compras_parceladas_cartaoId_idx" ON "compras_parceladas"("cartaoId");

-- AddForeignKey
ALTER TABLE "cartoes_credito" ADD CONSTRAINT "cartoes_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_parceladas" ADD CONSTRAINT "compras_parceladas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
