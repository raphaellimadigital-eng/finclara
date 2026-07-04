import Link from "next/link";
import { Gauge, ChevronRight, AlertOctagon } from "lucide-react";
import type { ProgressoLimite } from "@/lib/limites";

// Card-resumo dos limites por categoria (tela Contas): quantos limites existem e se algum
// estourou neste mês.
export function CardLimites({ progresso, ano, mes }: { progresso: ProgressoLimite[]; ano?: number; mes?: number }) {
  const estourados = progresso.filter((p) => p.situacao === "estouro").length;
  const cor = estourados > 0 ? "var(--vermelho)" : "var(--texto-secundario)";

  return (
    <Link
      href={ano && mes ? `/dashboard/limites?ano=${ano}&mes=${mes}` : "/dashboard/limites"}
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
        {estourados > 0 ? (
          <AlertOctagon size={18} aria-hidden="true" style={{ color: cor, flexShrink: 0 }} />
        ) : (
          <Gauge size={18} aria-hidden="true" style={{ color: cor, flexShrink: 0 }} />
        )}
        <div>
          <div className="texto-secundario" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
            Limites de gasto
          </div>
          {progresso.length === 0 ? (
            <span className="texto-secundario">Defina quanto quer gastar por categoria</span>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                {progresso.length} {progresso.length === 1 ? "limite definido" : "limites definidos"}
              </div>
              {estourados > 0 && (
                <div style={{ fontSize: 12, color: "var(--vermelho)" }}>
                  {estourados} {estourados === 1 ? "categoria estourou" : "categorias estouraram"} este mês
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
    </Link>
  );
}
