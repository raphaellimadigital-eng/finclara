import Link from "next/link";
import { Target, ChevronRight, AlertTriangle } from "lucide-react";
import { calcularProjecao, ordenarPorPrazo } from "@/lib/metas";
import type { Meta } from "@prisma/client";

// Card de metas do dashboard: mostra a meta principal com o progresso (a mais próxima do
// prazo ainda não concluída), não só a contagem.
export function CardMetas({ metas }: { metas: Meta[] }) {
  const atrasadas = metas.filter((m) => calcularProjecao(m).atrasada).length;

  const ordenadas = ordenarPorPrazo(metas);
  const principal = ordenadas.find((m) => !calcularProjecao(m).concluida) ?? ordenadas[0] ?? null;
  const projecao = principal ? calcularProjecao(principal) : null;

  return (
    <Link
      href="/dashboard/metas"
      className="card"
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: metas.length > 0 ? 10 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Target
            size={18}
            aria-hidden="true"
            style={{ color: atrasadas > 0 ? "var(--vermelho)" : "var(--texto-secundario)", flexShrink: 0 }}
          />
          <div>
            <div className="texto-secundario" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
              Metas
            </div>
            {metas.length === 0 ? (
              <span className="texto-secundario">Crie sua primeira meta</span>
            ) : (
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                {metas.length} {metas.length === 1 ? "meta" : "metas"}
                {atrasadas > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--vermelho)", marginLeft: 8 }}>
                    <AlertTriangle size={12} aria-hidden="true" style={{ verticalAlign: "-2px" }} />{" "}
                    {atrasadas} {atrasadas === 1 ? "atrasada" : "atrasadas"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
      </div>

      {principal && projecao && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{principal.descricao}</span>
            <span className="texto-secundario">{Math.round(projecao.percentual)}%</span>
          </div>
          <div className="barra-fundo">
            <div
              className="barra-preenchimento"
              style={{
                width: `${projecao.percentual}%`,
                background: projecao.concluida ? "var(--verde)" : projecao.atrasada ? "var(--vermelho)" : "var(--azul)",
              }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
