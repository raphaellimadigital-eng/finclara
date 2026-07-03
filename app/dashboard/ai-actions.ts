"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { gerarRecomendacaoIA } from "@/lib/gemini";
import { LABEL_PERFIL } from "@/lib/perfilInvestidor";
import type { Alocacao } from "@/lib/financas";
import { erroPaywall, podeUsarFeature } from "@/lib/assinatura";
import { garantirUsuario } from "@/lib/auth";

export async function pedirRecomendacaoIA(alocacao: Alocacao): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const usuarioCompleto = await garantirUsuario(user);
  if (!podeUsarFeature(usuarioCompleto, "ia_recomendacao")) {
    throw erroPaywall("A recomendação por IA é um recurso do plano Pro.");
  }

  const [dividas, metas] = await Promise.all([
    prisma.divida.findMany({ where: { usuarioId: user.id } }),
    prisma.meta.findMany({ where: { usuarioId: user.id, tipo: "RESERVA" } }),
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
    perfilInvestidor: usuarioCompleto.perfilInvestidor
      ? LABEL_PERFIL[usuarioCompleto.perfilInvestidor]
      : "não informado",
  };

  return gerarRecomendacaoIA(dadosParaIA);
}
