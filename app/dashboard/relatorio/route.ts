import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getLancamentos } from "../actions";
import { getMetas } from "../metas/actions";
import { gerarDadosRelatorio } from "@/lib/relatorio";
import { RelatorioDocument } from "./RelatorioDocument";

// Gera e devolve para download o relatório mensal em PDF (receitas x despesas, gastos por
// categoria e evolução das metas — regra 13.5 da proposta). Protegido pelo middleware, que já
// redireciona requisições sem sessão para /login antes de chegar aqui.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agora = new Date();
  const ano = Number(searchParams.get("ano")) || agora.getFullYear();
  const mes = Number(searchParams.get("mes")) || agora.getMonth() + 1;

  const [lancamentos, metas] = await Promise.all([
    getLancamentos(ano, mes),
    getMetas(),
  ]);

  const dados = gerarDadosRelatorio(ano, mes, lancamentos, metas);
  // O react-pdf tipa renderToBuffer para aceitar só <Document>, mas em runtime aceita
  // qualquer componente que renderize um <Document> — o cast reflete essa limitação de tipos.
  const buffer = await renderToBuffer(createElement(RelatorioDocument, { dados }) as Parameters<typeof renderToBuffer>[0]);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finclara-relatorio-${String(mes).padStart(2, "0")}-${ano}.pdf"`,
    },
  });
}
