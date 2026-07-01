"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { gerarRecomendacaoIA } from "@/lib/gemini";
import { LABEL_PERFIL } from "@/lib/perfilInvestidor";
import type { Alocacao } from "@/lib/financas";

export async function pedirRecomendacaoIA(alocacao: Alocacao): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const [dividas, metas, usuario] = await Promise.all([
    prisma.divida.findMany({ where: { usuarioId: user.id } }),
    prisma.meta.findMany({ where: { usuarioId: user.id, tipo: "RESERVA" } }),
    prisma.usuario.findUnique({ where: { id: user.id } }),
  ]);

  const reservaAcumulada = metas.reduce((s, m) => s + Number(m.valorAtual), 0);

  const dadosParaIA = {
    alocacao,
    dividas: dividas.map((d) => ({
      descricao: d.descricao,
      valorTotal: Number(d.valorTotal),
      valorParcela: Number(d.valorParcela),
      taxaJurosAoMes: Number(d.taxaJuros),
    })),
    reservaEmergenciaAcumulada: reservaAcumulada,
    perfilInvestidor: usuario?.perfilInvestidor ? LABEL_PERFIL[usuario.perfilInvestidor] : "não informado",
  };

  return gerarRecomendacaoIA(dadosParaIA);
}
