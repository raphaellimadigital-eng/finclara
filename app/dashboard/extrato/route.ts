import { getLancamentos } from "../actions";
import { LABEL_CATEGORIA } from "@/lib/categorias";

// Coloca entre aspas valores que contenham separador, aspas ou quebra de linha
function celulaCsv(valor: string): string {
  if (/[",;\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

// Exporta os lançamentos do mês como CSV (abre direto no Excel/Google Sheets). Usa ";" como
// separador — é o padrão que o Excel em português espera, já que "," é o separador decimal.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agora = new Date();
  const ano = Number(searchParams.get("ano")) || agora.getFullYear();
  const mes = Number(searchParams.get("mes")) || agora.getMonth() + 1;

  const lancamentos = await getLancamentos(ano, mes);

  const cabecalho = ["Data", "Tipo", "Categoria", "Descrição", "Valor (R$)", "Recorrente"];
  const linhas = lancamentos.map((l) => [
    new Date(l.data).toLocaleDateString("pt-BR"),
    l.tipo,
    LABEL_CATEGORIA[l.categoria] ?? l.categoria,
    l.descricao,
    Number(l.valor).toFixed(2).replace(".", ","),
    l.recorrente ? "Sim" : "Não",
  ]);

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map(celulaCsv).join(";"))
    .join("\r\n");

  // BOM no início (﻿) para o Excel reconhecer UTF-8 e exibir acentos corretamente
  const conteudo = "﻿" + csv;

  return new Response(conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="finclara-extrato-${String(mes).padStart(2, "0")}-${ano}.csv"`,
    },
  });
}
