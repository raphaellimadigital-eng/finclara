import { WalletCards } from "lucide-react";
import { getCartoes } from "../cartoes/actions";
import { getDividas } from "../dividas/actions";
import { getLimites } from "../limites/actions";
import { getLancamentos } from "../actions";
import { calcularProgressoLimites } from "@/lib/limites";
import { CardCartoes } from "@/components/CardCartoes";
import { CardDividas } from "@/components/CardDividas";
import { CardLimites } from "@/components/CardLimites";
import { AvisoMesVisualizado } from "@/components/AvisoMesVisualizado";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

// Tela-índice das contas do dia a dia: cartões, dívidas e limites de gasto por categoria.
// Dá um endereço fixo na navegação para telas que antes só eram alcançadas por outros cards.
export default async function ContasPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const [cartoes, dividas, limites, lancamentos] = await Promise.all([
    getCartoes(),
    getDividas(),
    getLimites(),
    getLancamentos(ano, mes),
  ]);

  const dividasAtivas = dividas.filter((d) => !d.quitada);
  const progressoLimites = calcularProgressoLimites(lancamentos, limites);

  return (
    <div className="container">
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 4 }}>
        <WalletCards size={20} aria-hidden="true" /> Contas
      </h1>
      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 16 }}>
        Cartões, dívidas e limites de gasto, tudo num lugar só.
      </p>

      <AvisoMesVisualizado ano={ano} mes={mes} baseHref="/dashboard/contas" />

      <CardCartoes cartoes={cartoes} mes={mes} ano={ano} />
      <CardDividas dividas={dividasAtivas} />
      <CardLimites progresso={progressoLimites} ano={ano} mes={mes} />
    </div>
  );
}
