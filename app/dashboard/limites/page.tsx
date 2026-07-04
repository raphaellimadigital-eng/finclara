import Link from "next/link";
import { ChevronLeft, Gauge } from "lucide-react";
import { getLimites } from "./actions";
import { getLancamentos } from "../actions";
import { getCartoes } from "../cartoes/actions";
import { calcularProgressoLimites } from "@/lib/limites";
import { parcelasPorCategoriaNoMes } from "@/lib/cartoes";
import { FormLimiteCategoria } from "@/components/FormLimiteCategoria";
import { ListaLimites } from "@/components/ListaLimites";
import { RevelarFormulario } from "@/components/RevelarFormulario";
import { AvisoMesVisualizado } from "@/components/AvisoMesVisualizado";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function LimitesPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const [limites, lancamentos, cartoes] = await Promise.all([
    getLimites(),
    getLancamentos(ano, mes),
    getCartoes(),
  ]);

  const parcelasPorCategoria = parcelasPorCategoriaNoMes(cartoes, mes, ano);
  const progresso = calcularProgressoLimites(lancamentos, limites, parcelasPorCategoria).map((p, i) => ({
    ...p,
    id: limites[i].id,
  }));

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
        <Gauge size={20} aria-hidden="true" /> Limites de gasto
      </h1>

      <AvisoMesVisualizado ano={ano} mes={mes} baseHref="/dashboard/limites" />

      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 16 }}>
        Defina quanto quer gastar no máximo em cada categoria por mês. A partir de 80% do
        limite você recebe um aviso; ao ultrapassar 100%, um alerta de estouro.
      </p>

      {/* Situação primeiro; o cadastro fica recolhido atrás do botão */}
      <ListaLimites limites={progresso} />

      <RevelarFormulario rotulo="Definir limite">
        <FormLimiteCategoria />
      </RevelarFormulario>
    </div>
  );
}
