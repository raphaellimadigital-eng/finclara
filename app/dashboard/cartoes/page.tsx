import Link from "next/link";
import { ChevronLeft, CreditCard } from "lucide-react";
import { getCartoes } from "./actions";
import { FormCartao } from "@/components/FormCartao";
import { ListaCartoes } from "@/components/ListaCartoes";
import { RevelarFormulario } from "@/components/RevelarFormulario";
import { AvisoMesVisualizado } from "@/components/AvisoMesVisualizado";
import { limiteDisponivel, valorFaturaNoMes } from "@/lib/cartoes";
import { formatarMoeda } from "@/lib/formatos";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function CartoesPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const cartoes = await getCartoes();

  const totalLimite = cartoes.reduce((s, c) => s + Number(c.limite), 0);
  const totalDisponivel = cartoes.reduce((s, c) => s + limiteDisponivel(c, c.compras), 0);
  const totalFaturaMes = cartoes.reduce(
    (s, c) => s + valorFaturaNoMes(c.compras, c.diaFechamento, mes, ano),
    0
  );

  return (
    <div className="container">
      <Link
        href="/dashboard/contas"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <CreditCard size={20} aria-hidden="true" /> Cartões de crédito
      </h1>

      <AvisoMesVisualizado ano={ano} mes={mes} baseHref="/dashboard/cartoes" />

      {/* Situação primeiro: resumo e lista; o cadastro fica recolhido atrás do botão */}
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatarMoeda(totalFaturaMes)}</div>
            </div>
          </div>
          <p className="texto-secundario" style={{ fontSize: 12.5, marginTop: 12, marginBottom: 0 }}>
            Limite total cadastrado: {formatarMoeda(totalLimite)}
          </p>
        </div>
      )}

      <ListaCartoes cartoes={cartoes} />

      <RevelarFormulario rotulo="Adicionar cartão">
        <FormCartao />
      </RevelarFormulario>
    </div>
  );
}
