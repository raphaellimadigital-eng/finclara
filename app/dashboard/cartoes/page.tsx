import Link from "next/link";
import { ChevronLeft, CreditCard } from "lucide-react";
import { getCartoes } from "./actions";
import { FormCartao } from "@/components/FormCartao";
import { ListaCartoes } from "@/components/ListaCartoes";
import { FormCompraParcelada } from "@/components/FormCompraParcelada";
import { limiteDisponivel, valorFaturaNoMes } from "@/lib/cartoes";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CartoesPage() {
  const cartoes = await getCartoes();

  const agora = new Date();
  const totalLimite = cartoes.reduce((s, c) => s + Number(c.limite), 0);
  const totalDisponivel = cartoes.reduce((s, c) => s + limiteDisponivel(c, c.compras), 0);
  const totalFaturaMesAtual = cartoes.reduce(
    (s, c) => s + valorFaturaNoMes(c.compras, c.diaFechamento, agora.getMonth() + 1, agora.getFullYear()),
    0
  );

  return (
    <div className="container">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <CreditCard size={20} aria-hidden="true" /> Cartões de crédito
      </h1>

      {cartoes.length > 0 && (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="texto-secundario">Limite disponível (total)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: totalDisponivel < 0 ? "var(--vermelho)" : "var(--verde)" }}>
                {formatarMoeda(totalDisponivel)}
              </div>
            </div>
            <div>
              <div className="texto-secundario">Fatura deste mês</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatarMoeda(totalFaturaMesAtual)}</div>
            </div>
          </div>
          <p className="texto-secundario" style={{ fontSize: 11.5, marginTop: 12, marginBottom: 0 }}>
            Limite total cadastrado: {formatarMoeda(totalLimite)}
          </p>
        </div>
      )}

      <FormCartao />
      <ListaCartoes cartoes={cartoes} />
      <FormCompraParcelada cartoes={cartoes} />
    </div>
  );
}
