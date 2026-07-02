import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getHistoricoPatrimonio } from "./actions";
import { EvolucaoPatrimonialDocument } from "./EvolucaoPatrimonialDocument";

export async function GET() {
  const snapshots = await getHistoricoPatrimonio();
  const historico = snapshots.map((s) => ({ ano: s.ano, mes: s.mes, patrimonio: Number(s.patrimonio) }));

  const buffer = await renderToBuffer(
    createElement(EvolucaoPatrimonialDocument, { historico }) as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finclara-evolucao-patrimonial.pdf"`,
    },
  });
}
