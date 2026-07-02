-- CreateTable
CREATE TABLE "patrimonio_snapshots" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "patrimonio" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrimonio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patrimonio_snapshots_usuarioId_ano_mes_key" ON "patrimonio_snapshots"("usuarioId", "ano", "mes");

-- AddForeignKey
ALTER TABLE "patrimonio_snapshots" ADD CONSTRAINT "patrimonio_snapshots_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
