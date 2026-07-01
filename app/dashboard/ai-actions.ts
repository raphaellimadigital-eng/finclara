"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { gerarRecomendacaoIA } from "@/lib/gemini";
import type { Alocacao } from "@/lib/financas";

export async function pedirRecomendacaoIA(alocacao: Alocacao): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const dividas = await prisma.divida.findMany({ where: { usuarioId: user.id } });

  const dadosParaIA = {
    alocacao,
    dividas: dividas.map((d) => ({
      descricao: d.descricao,
      valorTotal: Number(d.valorTotal),
      valorParcela: Number(d.valorParcela),
      taxaJurosAoMes: Number(d.taxaJuros),
    })),
  };

  return gerarRecomendacaoIA(dadosParaIA);
}
