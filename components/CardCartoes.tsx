import Link from "next/link";
import { CreditCard, ChevronRight, AlertTriangle } from "lucide-react";
import { limiteDisponivel } from "@/lib/cartoes";
import type { CartaoCredito, CompraParcelada } from "@prisma/client";

type CartaoComCompras = CartaoCredito & { compras: CompraParcelada[] };

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CardCartoes({ cartoes }: { cartoes: CartaoComCompras[] }) {
  const totalDisponivel = cartoes.reduce((s, c) => s + limiteDisponivel(c, c.compras), 0);
  const estourou = cartoes.some((c) => limiteDisponivel(c, c.compras) < 0);

  return (
    <Link
      href="/dashboard/cartoes"
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
        <CreditCard
          size={18}
          aria-hidden="true"
          style={{ color: estourou ? "var(--vermelho)" : "var(--texto-secundario)", flexShrink: 0 }}
        />
        {cartoes.length === 0 ? (
          <span className="texto-secundario">Sem cartões cadastrados</span>
        ) : (
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>
              {formatarMoeda(totalDisponivel)} de limite disponível
            </div>
            {estourou && (
              <div
                className="texto-secundario"
                style={{ fontSize: 12, color: "var(--vermelho)", display: "flex", alignItems: "center", gap: 4 }}
              >
                <AlertTriangle size={12} aria-hidden="true" /> Um cartão estourou o limite
              </div>
            )}
          </div>
        )}
      </div>
      <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
    </Link>
  );
}
