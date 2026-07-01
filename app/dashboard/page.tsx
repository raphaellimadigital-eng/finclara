import { Suspense } from "react";
import { getLancamentos } from "./actions";
import { getDividas } from "./dividas/actions";
import { getCartoes } from "./cartoes/actions";
import { getMetas } from "./metas/actions";
import { getUsuarioAtual } from "./perfil/actions";
import { FormLancamento } from "@/components/FormLancamento";
import { ListaLancamentos } from "@/components/ListaLancamentos";
import { Resumo } from "@/components/Resumo";
import { SeletorMes } from "@/components/SeletorMes";
import { MenuUsuario } from "@/components/MenuUsuario";
import { GraficoAlocacao } from "@/components/GraficoAlocacao";
import { CardDividas } from "@/components/CardDividas";
import { CardCartoes } from "@/components/CardCartoes";
import { CardMetas } from "@/components/CardMetas";
import { CardOrientacao } from "@/components/CardOrientacao";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase-server";
import { calcularAlocacao, CATEGORIAS_ESSENCIAIS } from "@/lib/financas";
import { calcularOrientacao } from "@/lib/orientacao";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function DashboardPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [lancamentos, dividas, cartoes, metas, usuario] = await Promise.all([
    getLancamentos(ano, mes),
    getDividas(),
    getCartoes(),
    getMetas(),
    getUsuarioAtual(),
  ]);

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const saldo = totalReceitas - totalDespesas;
  const alocacao = calcularAlocacao(totalReceitas, lancamentos, dividas);

  const essenciaisMensal = lancamentos
    .filter((l) => l.tipo === "DESPESA" && CATEGORIAS_ESSENCIAIS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const reservaAtual = metas
    .filter((m) => m.tipo === "RESERVA")
    .reduce((s, m) => s + Number(m.valorAtual), 0);

  const orientacao = calcularOrientacao({
    temDividaCara: alocacao.temDividaCara,
    reservaAtual,
    essenciaisMensal,
    perfilInvestidor: usuario.perfilInvestidor,
  });

  return (
    <div className="container">
      {/* Cabeçalho */}
      <div className="topo">
        <div className="marca">
          <Logo />
          <h1>FinClara</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ThemeToggle />
          <MenuUsuario />
        </div>
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

      {/* Dívidas */}
      <CardDividas dividas={dividas} />

      {/* Cartões de crédito */}
      <CardCartoes cartoes={cartoes} />

      {/* Metas financeiras */}
      <CardMetas metas={metas} />

      {/* Orientação financeira (dívida → reserva → investir) */}
      <CardOrientacao orientacao={orientacao} />

      {/* Sugestão de alocação da renda */}
      <GraficoAlocacao alocacao={alocacao} />

      {/* Formulário de novo lançamento */}
      <FormLancamento />

      {/* Lista de lançamentos */}
      <ListaLancamentos lancamentos={lancamentos} />
    </div>
  );
}
