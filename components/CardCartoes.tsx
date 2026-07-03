import Link from "next/link";
import { CreditCard, ChevronRight, AlertTriangle, AlertOctagon } from "lucide-react";
import { limiteComprometido, limiteDisponivel, valorFaturaNoMes } from "@/lib/cartoes";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CartaoCredito, CompraParcelada } from "@prisma/client";

const TEXTO_INFO = [
  "Disponível: quanto ainda sobra do limite dos seus cartões, considerando as parcelas futuras já comprometidas.",
  "Fatura deste mês: quanto você precisa pagar agora, somando a fatura de todos os cartões.",
];

type CartaoComCompras = CartaoCredito & { compras: CompraParcelada[] };

// A partir de 80% de uso do limite já sinalizamos risco (mesmo padrão do alerta de limite por
// categoria); a partir de 100% é estouro.
const LIMIAR_AVISO_PCT = 80;

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CardCartoes({ cartoes, mes, ano }: { cartoes: CartaoComCompras[]; mes: number; ano: number }) {
  if (cartoes.length === 0) {
    return (
      <Link
        href="/dashboard/cartoes"
        className="card"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CreditCard size={18} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
          <div>
            <div className="texto-secundario" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
              Cartões
            </div>
            <span className="texto-secundario">Sem cartões cadastrados</span>
          </div>
        </div>
        <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
      </Link>
    );
  }

  const totalDisponivel = cartoes.reduce((s, c) => s + limiteDisponivel(c, c.compras), 0);
  const totalFaturaMes = cartoes.reduce((s, c) => s + valorFaturaNoMes(c.compras, c.diaFechamento, mes, ano), 0);

  const usoPorCartao = cartoes.map((c) => {
    const limite = Number(c.limite);
    const comprometido = limiteComprometido(c.compras, c.diaFechamento);
    return { cartao: c, percentual: limite > 0 ? (comprometido / limite) * 100 : 0 };
  });

  const maisArriscado = usoPorCartao.reduce((pior, atual) => (atual.percentual > pior.percentual ? atual : pior));

  const situacao: "ok" | "aviso" | "estouro" =
    maisArriscado.percentual >= 100 ? "estouro" : maisArriscado.percentual >= LIMIAR_AVISO_PCT ? "aviso" : "ok";

  const cor = situacao === "ok" ? "var(--texto-secundario)" : situacao === "aviso" ? "var(--amarelo)" : "var(--vermelho)";
  const Icone = situacao === "estouro" ? AlertOctagon : situacao === "aviso" ? AlertTriangle : CreditCard;

  return (
    <Link href="/dashboard/cartoes" className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Icone size={18} aria-hidden="true" style={{ color: cor, flexShrink: 0 }} />
          <div>
            <div className="texto-secundario" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>
              Cartões
            </div>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>
              {cartoes.length} {cartoes.length === 1 ? "cartão cadastrado" : "cartões cadastrados"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <InfoTooltip texto={TEXTO_INFO} />
          <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div className="texto-secundario" style={{ fontSize: 11.5 }}>Disponível</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{formatarMoeda(totalDisponivel)}</div>
        </div>
        <div>
          <div className="texto-secundario" style={{ fontSize: 11.5 }}>Fatura deste mês</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{formatarMoeda(totalFaturaMes)}</div>
        </div>
      </div>

      {cartoes.length > 1 && (
        <div
          className="texto-secundario"
          style={{ fontSize: 12, color: cor, display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}
        >
          <Icone size={12} aria-hidden="true" />
          {maisArriscado.cartao.nome} está com {Math.round(maisArriscado.percentual)}% do limite usado
        </div>
      )}
    </Link>
  );
}
