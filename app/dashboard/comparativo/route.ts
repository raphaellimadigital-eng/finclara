import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getLancamentos } from "../actions";
import { gerarDadosRelatorio } from "@/lib/relatorio";
import { ComparativoDocument } from "./ComparativoDocument";
import { getStatusAssinatura } from "@/lib/auth";
import { podeUsarFeature } from "@/lib/assinatura";

function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

// Gera o relatório comparativo (mês selecionado vs. o mês imediatamente anterior). Se não
// houver nenhum lançamento no mês anterior, o PDF deixa isso explícito em vez de comparar
// com zero — não faz sentido dizer que "as despesas cresceram 100%" quando simplesmente não
// havia dados ainda.
export async function GET(request: Request) {
  const usuario = await getStatusAssinatura();
  if (!podeUsarFeature(usuario, "relatorios_pdf")) {
    return NextResponse.redirect(new URL("/dashboard/assinatura?bloqueado=relatorio", request.url));
  }

  const { searchParams } = new URL(request.url);
  const agora = new Date();
  const ano = Number(searchParams.get("ano")) || agora.getFullYear();
  const mes = Number(searchParams.get("mes")) || agora.getMonth() + 1;
  const anterior = mesAnterior(ano, mes);

  const [lancamentosAtual, lancamentosAnterior] = await Promise.all([
    getLancamentos(ano, mes),
    getLancamentos(anterior.ano, anterior.mes),
  ]);

  const dadosAtual = gerarDadosRelatorio(ano, mes, lancamentosAtual, []);
  const dadosAnterior = lancamentosAnterior.length > 0
    ? gerarDadosRelatorio(anterior.ano, anterior.mes, lancamentosAnterior, [])
    : null;

  const buffer = await renderToBuffer(
    createElement(ComparativoDocument, { atual: dadosAtual, anterior: dadosAnterior }) as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finclara-comparativo-${String(mes).padStart(2, "0")}-${ano}.pdf"`,
    },
  });
}
