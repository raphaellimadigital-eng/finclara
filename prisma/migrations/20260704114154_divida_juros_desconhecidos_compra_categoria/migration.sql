-- AlterTable
ALTER TABLE "compras_parceladas" ADD COLUMN     "categoria" "Categoria" NOT NULL DEFAULT 'OUTRAS_DESPESAS';

-- AlterTable
ALTER TABLE "dividas" ADD COLUMN     "jurosDesconhecidos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parcelasRestantes" INTEGER;
