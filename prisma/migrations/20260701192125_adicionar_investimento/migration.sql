-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Categoria" ADD VALUE 'RESERVA_EMERGENCIA';
ALTER TYPE "Categoria" ADD VALUE 'TESOURO_DIRETO';
ALTER TYPE "Categoria" ADD VALUE 'RENDA_VARIAVEL';
ALTER TYPE "Categoria" ADD VALUE 'OUTROS_INVESTIMENTOS';

-- AlterEnum
ALTER TYPE "TipoLancamento" ADD VALUE 'INVESTIMENTO';
