import { Suspense } from "react";
import { getLancamentos } from "./actions";
import { FormLancamento } from "@/components/FormLancamento";
import { ListaLancamentos } from "@/components/ListaLancamentos";
import { Resumo } from "@/components/Resumo";
import { SeletorMes } from "@/components/SeletorMes";
import { BotaoSair } from "@/components/BotaoSair";
import { GraficoAlocacao } from "@/components/GraficoAlocacao";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase-server";
import { calcularAlocacao } from "@/lib/financas";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function DashboardPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lancamentos = await getLancamentos(ano, mes);

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const saldo = totalReceitas - totalDespesas;
  const alocacao = calcularAlocacao(totalReceitas, lancamentos);

  return (
    <div className="container">
      {/* Cabeçalho */}
      <div className="topo">
        <div className="marca">
          <Logo />
          <h1>FinClara</h1>
        </div>
        <BotaoSair />
      </div>
      <p className="saudacao">
        Olá, {user?.email?.split("@")[0]}. Aqui está o resumo de {" "}
        {new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.
      </p>

      {/* Seletor de mês */}
      <Suspense>
        <SeletorMes ano={ano} mes={mes} />
      </Suspense>

      {/* Resumo */}
      <Resumo
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        saldo={saldo}
      />

      {/* Sugestão de alocação da renda */}
      <GraficoAlocacao alocacao={alocacao} />

      {/* Formulário de novo lançamento */}
      <FormLancamento />

      {/* Lista de lançamentos */}
      <ListaLancamentos lancamentos={lancamentos} />
    </div>
  );
}
