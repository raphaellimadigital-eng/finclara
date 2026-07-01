import Link from "next/link";
import { ChevronRight, AlertOctagon, CheckCircle2 } from "lucide-react";
import type { Alerta } from "@/lib/alertas";

export function CardAlertas({ alertas }: { alertas: Alerta[] }) {
  const criticos = alertas.filter((a) => a.severidade === "estouro" || a.severidade === "urgente").length;
  const cor = alertas.length === 0 ? "var(--texto-secundario)" : criticos > 0 ? "var(--vermelho)" : "var(--amarelo)";

  return (
    <Link
      href="/dashboard/alertas"
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {alertas.length === 0 ? (
          <CheckCircle2 size={18} aria-hidden="true" style={{ color: cor, flexShrink: 0 }} />
        ) : (
          <AlertOctagon size={18} aria-hidden="true" style={{ color: cor, flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>Central de alertas</div>
          <div className="texto-secundario" style={{ fontSize: 12, color: cor }}>
            {alertas.length === 0 ? "Nenhum alerta no momento" : `${alertas.length} ${alertas.length === 1 ? "alerta" : "alertas"}`}
          </div>
        </div>
      </div>
      <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
    </Link>
  );
}
