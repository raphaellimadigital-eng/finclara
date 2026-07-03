-- CreateEnum
CREATE TYPE "PlanoUsuario" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('SEM_ASSINATURA', 'PENDENTE', 'ATIVA', 'PAUSADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "plano" "PlanoUsuario" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "statusAssinatura" "StatusAssinatura" NOT NULL DEFAULT 'SEM_ASSINATURA',
ADD COLUMN     "mpAssinaturaId" TEXT,
ADD COLUMN     "periodoAtualFim" TIMESTAMP(3);

-- Usuários já cadastrados (pré-lançamento do plano pago, sem clientes pagantes ainda) ganham um
-- trial de cortesia de 7 dias a partir de agora, em vez de nascerem com o trial já vencido.
UPDATE "usuarios" SET "trialEndsAt" = CURRENT_TIMESTAMP + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "eventos_webhook_assinatura" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "mpEventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_webhook_assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_mpAssinaturaId_key" ON "usuarios"("mpAssinaturaId");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_webhook_assinatura_mpEventoId_key" ON "eventos_webhook_assinatura"("mpEventoId");

-- AddForeignKey
ALTER TABLE "eventos_webhook_assinatura" ADD CONSTRAINT "eventos_webhook_assinatura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
