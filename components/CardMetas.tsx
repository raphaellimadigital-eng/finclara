import Link from "next/link";
import { Target, ChevronRight, AlertTriangle } from "lucide-react";
import { calcularProjecao } from "@/lib/metas";
import type { Meta } from "@prisma/client";

export function CardMetas({ metas }: { metas: Meta[] }) {
  const atrasadas = metas.filter((m) => calcularProjecao(m).atrasada).length;

  return (
    <Link
      href="/dashboard/metas"
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
            <span className="texto-secundario">Sem metas cadastradas</span>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                {metas.length} {metas.length === 1 ? "meta cadastrada" : "metas cadastradas"}
              </div>
              {atrasadas > 0 && (
                <div
                  className="texto-secundario"
                  style={{ fontSize: 12, color: "var(--vermelho)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AlertTriangle size={12} aria-hidden="true" />
                  {atrasadas} {atrasadas === 1 ? "meta atrasada" : "metas atrasadas"}
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
