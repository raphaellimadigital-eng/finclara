-- CreateEnum
CREATE TYPE "PerfilInvestidor" AS ENUM ('CONSERVADOR', 'MODERADO', 'ARROJADO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "perfilInvestidor" "PerfilInvestidor";
