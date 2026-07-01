-- CreateTable
CREATE TABLE "limites_categoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "valorLimite" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "limites_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "limites_categoria_usuarioId_categoria_key" ON "limites_categoria"("usuarioId", "categoria");

-- AddForeignKey
ALTER TABLE "limites_categoria" ADD CONSTRAINT "limites_categoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
