import Link from "next/link";
import { Crown } from "lucide-react";
import type { Usuario } from "@prisma/client";
import { diasRestantesTrial, temAcessoCompleto, trialAtivo } from "@/lib/assinatura";

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function AssinaturaCard({ usuario }: { usuario: Usuario }) {
  const acessoCompleto = temAcessoCompleto(usuario);
  const emTrial = trialAtivo(usuario);
  const ehProPago =
    usuario.plano === "PRO" && (usuario.statusAssinatura === "ATIVA" || usuario.statusAssinatura === "PAUSADA");
  const canceladaMasAindaValida =
    usuario.statusAssinatura === "CANCELADA" && usuario.periodoAtualFim !== null && acessoCompleto;

  let statusTexto: string;
  if (canceladaMasAindaValida && usuario.periodoAtualFim) {
    statusTexto = `Cancelado — acesso Pro até ${formatarData(usuario.periodoAtualFim)}`;
  } else if (ehProPago) {
    statusTexto = "Plano Pro ativo";
  } else if (emTrial) {
    const dias = diasRestantesTrial(usuario);
    statusTexto = `Período de teste — ${dias} ${dias === 1 ? "dia restante" : "dias restantes"}`;
  } else {
    statusTexto = "Plano Free";
  }

  return (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Crown size={18} aria-hidden="true" />
        <div>
          <div style={{ fontWeight: 500, fontSize: 14.5 }}>Assinatura</div>
          <div className="texto-secundario">{statusTexto}</div>
        </div>
      </div>
      <Link href="/dashboard/assinatura" className="botao-secundario">
        {ehProPago || canceladaMasAindaValida ? "Gerenciar assinatura" : "Assinar o Pro"}
      </Link>
    </div>
  );
}
