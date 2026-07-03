import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getLancamentos } from "../actions";
import { getDividas } from "../dividas/actions";
import { getMetas } from "../metas/actions";
import { getUsuarioAtual } from "../perfil/actions";
import { calcularAlocacao, CATEGORIAS_ESSENCIAIS } from "@/lib/financas";
import { calcularOrientacao } from "@/lib/orientacao";
import { gerarRecomendacaoIA } from "@/lib/gemini";
import { LABEL_PERFIL } from "@/lib/perfilInvestidor";
import { DiagnosticoDocument } from "./DiagnosticoDocument";
import { getStatusAssinatura } from "@/lib/auth";
import { podeUsarFeature } from "@/lib/assinatura";

// Gera o "Diagnóstico Financeiro" em PDF: a prioridade atual (dívida cara -> reserva ->
// investir) mais uma análise personalizada por IA (Gemini), reaproveitando a mesma lógica já
// usada no motor de orientação e na recomendação do dashboard.
export async function GET(request: Request) {
  const statusAssinatura = await getStatusAssinatura();
  if (!podeUsarFeature(statusAssinatura, "relatorios_pdf")) {
    return NextResponse.redirect(new URL("/dashboard/assinatura?bloqueado=relatorio", request.url));
  }

  const { searchParams } = new URL(request.url);
  const agora = new Date();
  const ano = Number(searchParams.get("ano")) || agora.getFullYear();
  const mes = Number(searchParams.get("mes")) || agora.getMonth() + 1;

  const [lancamentos, dividas, metas, usuario] = await Promise.all([
    getLancamentos(ano, mes),
    getDividas(),
    getMetas(),
    getUsuarioAtual(),
  ]);

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const alocacao = calcularAlocacao(totalReceitas, lancamentos, dividas);

  const essenciaisMensal = lancamentos
    .filter((l) => l.tipo === "DESPESA" && CATEGORIAS_ESSENCIAIS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const reservaAtual = metas
    .filter((m) => m.tipo === "RESERVA")
    .reduce((s, m) => s + Number(m.valorAtual), 0);

  const orientacao = calcularOrientacao({
    temDividaCara: alocacao.temDividaCara,
    reservaAtual,
    essenciaisMensal,
    perfilInvestidor: usuario.perfilInvestidor,
  });

  let textoIA: string;
  try {
    textoIA = await gerarRecomendacaoIA({
      alocacao,
      dividas: dividas.map((d) => ({
        descricao: d.descricao,
        valorTotal: Number(d.valorTotal),
        valorParcela: Number(d.valorParcela),
        taxaJurosAoMes: Number(d.taxaJuros),
      })),
      reservaEmergenciaAcumulada: reservaAtual,
      perfilInvestidor: usuario.perfilInvestidor ? LABEL_PERFIL[usuario.perfilInvestidor] : "não informado",
    });
  } catch {
    textoIA = "Não foi possível gerar a análise por IA neste momento. Tente novamente mais tarde.";
  }

  const buffer = await renderToBuffer(
    createElement(DiagnosticoDocument, { ano, mes, orientacao, textoIA }) as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finclara-diagnostico-${String(mes).padStart(2, "0")}-${ano}.pdf"`,
    },
  });
}
