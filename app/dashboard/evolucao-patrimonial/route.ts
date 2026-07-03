import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getHistoricoPatrimonio } from "./actions";
import { EvolucaoPatrimonialDocument } from "./EvolucaoPatrimonialDocument";
import { getStatusAssinatura } from "@/lib/auth";
import { podeUsarFeature } from "@/lib/assinatura";

export async function GET(request: Request) {
  const usuario = await getStatusAssinatura();
  if (!podeUsarFeature(usuario, "relatorios_pdf")) {
    return NextResponse.redirect(new URL("/dashboard/assinatura?bloqueado=relatorio", request.url));
  }

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
