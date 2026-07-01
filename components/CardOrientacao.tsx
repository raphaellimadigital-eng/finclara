import Link from "next/link";
import { Compass, ChevronRight, AlertTriangle, PiggyBank, TrendingUp } from "lucide-react";
import type { Orientacao } from "@/lib/orientacao";

const ICONE_PRIORIDADE = {
  QUITAR_DIVIDA: AlertTriangle,
  FORMAR_RESERVA: PiggyBank,
  INVESTIR: TrendingUp,
} as const;

const COR_PRIORIDADE = {
  QUITAR_DIVIDA: "var(--vermelho)",
  FORMAR_RESERVA: "var(--amarelo)",
  INVESTIR: "var(--verde)",
} as const;

export function CardOrientacao({ orientacao }: { orientacao: Orientacao }) {
  const Icone = ICONE_PRIORIDADE[orientacao.prioridade];
  const cor = COR_PRIORIDADE[orientacao.prioridade];

  return (
    <Link
      href="/dashboard/orientacao"
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
        <Compass size={18} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>Orientação financeira</div>
          <div className="texto-secundario" style={{ fontSize: 12, color: cor, display: "flex", alignItems: "center", gap: 4 }}>
            <Icone size={12} aria-hidden="true" /> {orientacao.titulo}
          </div>
        </div>
      </div>
      <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
    </Link>
  );
}
