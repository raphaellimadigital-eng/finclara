import Link from "next/link";
import { Landmark, ChevronRight, AlertTriangle } from "lucide-react";
import { totalDevedor, temDividaCara } from "@/lib/dividas";
import type { Divida } from "@prisma/client";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CardDividas({ dividas }: { dividas: Divida[] }) {
  const cara = temDividaCara(dividas);

  return (
    <Link
      href="/dashboard/dividas"
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
        <Landmark
          size={18}
          aria-hidden="true"
          style={{ color: cara ? "var(--vermelho)" : "var(--texto-secundario)", flexShrink: 0 }}
        />
        <div>
          <div className="texto-secundario" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
            Dívidas
          </div>
          {dividas.length === 0 ? (
            <span className="texto-secundario">Sem dívidas cadastradas</span>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                {formatarMoeda(totalDevedor(dividas))} em dívidas
              </div>
              {cara && (
                <div
                  className="texto-secundario"
                  style={{ fontSize: 12, color: "var(--vermelho)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AlertTriangle size={12} aria-hidden="true" /> Tem dívida com juros altos
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
