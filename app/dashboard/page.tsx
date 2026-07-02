import { Suspense } from "react";
import { getLancamentos } from "./actions";
import { getDividas } from "./dividas/actions";
import { getCartoes } from "./cartoes/actions";
import { getMetas } from "./metas/actions";
import { getUsuarioAtual } from "./perfil/actions";
import { getLimites } from "./limites/actions";
import { FormLancamento } from "@/components/FormLancamento";
import { ListaLancamentos } from "@/components/ListaLancamentos";
import { Resumo, type MetaResumo } from "@/components/Resumo";
import { SeletorMes } from "@/components/SeletorMes";
import { MenuUsuario } from "@/components/MenuUsuario";
import { GraficoAlocacao } from "@/components/GraficoAlocacao";
import { CardDividas } from "@/components/CardDividas";
import { CardCartoes } from "@/components/CardCartoes";
import { CardMetas } from "@/components/CardMetas";
import { CardOrientacao } from "@/components/CardOrientacao";
import { CardAlertas } from "@/components/CardAlertas";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase-server";
import { calcularAlocacao, CATEGORIAS_ESSENCIAIS } from "@/lib/financas";
import { calcularOrientacao } from "@/lib/orientacao";
import { valorFaturaNoMes, limiteDisponivel } from "@/lib/cartoes";
import { totalParcelasMensais, totalDevedor as calcularTotalDevedor } from "@/lib/dividas";
import { calcularProjecao, ordenarPorPrazo } from "@/lib/metas";
import { calcularProgressoLimites, categoriasEstouradas } from "@/lib/limites";
import { alertasLimites, alertasCartoes, alertasDividas, alertasMetas, ordenarPorSeveridade } from "@/lib/alertas";
import { LABEL_CATEGORIA } from "@/lib/categorias";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

// Escolhe a meta a destacar no resumo do mês: a mais próxima do prazo entre as ainda não
// concluídas, ou a primeira cadastrada se todas já estiverem concluídas.
function calcularMetaPrincipal(metas: Awaited<ReturnType<typeof getMetas>>): MetaResumo | null {
  if (metas.length === 0) return null;

  const ordenadas = ordenarPorPrazo(metas);
  const escolhida = ordenadas.find((m) => !calcularProjecao(m).concluida) ?? ordenadas[0];
  const projecao = calcularProjecao(escolhida);

  return {
    descricao: escolhida.descricao,
    percentual: projecao.percentual,
    situacao: projecao.concluida ? "concluida" : projecao.atrasada ? "atrasada" : "em_dia",
  };
}

export default async function DashboardPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [lancamentos, dividas, cartoes, metas, usuario, limites] = await Promise.all([
    getLancamentos(ano, mes),
    getDividas(),
    getCartoes(),
    getMetas(),
    getUsuarioAtual(),
    getLimites(),
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

  const parcelasCartaoMes = cartoes.reduce(
    (soma, c) => soma + valorFaturaNoMes(c.compras, c.diaFechamento, mes, ano),
    0
  );
  const parcelasDividaMes = totalParcelasMensais(dividas);
  const poupancaRecomendada = Math.max(totalReceitas - essenciaisMensal, 0);

  const disponivelCartoes = cartoes.reduce((soma, c) => soma + limiteDisponivel(c, c.compras), 0);
  const totalDevedor = calcularTotalDevedor(dividas);
  const metaPrincipal = calcularMetaPrincipal(metas);

  const progressoLimites = calcularProgressoLimites(lancamentos, limites);
  const estouradas = categoriasEstouradas(progressoLimites);

  const alertas = ordenarPorSeveridade([
    ...alertasLimites(progressoLimites, LABEL_CATEGORIA),
    ...alertasCartoes(cartoes),
    ...alertasDividas(dividas),
    ...alertasMetas(metas),
  ]);

  return (
    <div className="container">
      {/* Cabeçalho */}
      <div className="topo">
        <div className="marca">
          <Logo />
          <h1>Fin<span style={{ color: "var(--verde)" }}>Clara</span></h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ThemeToggle />
          <MenuUsuario />
        </div>
      </div>
      <p className="saudacao">
        Olá, {usuario.nome?.split(" ")[0] || user?.email?.split("@")[0]}. Aqui está o resumo de {" "}
        {new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.
      </p>

      {/* Seletor de mês */}
      <Suspense>
        <SeletorMes ano={ano} mes={mes} />
      </Suspense>

      {/* 1. Resumo do mês (já traz cartões, dívidas e meta principal integrados) */}
      <Resumo
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        saldo={saldo}
        parcelasCartaoMes={parcelasCartaoMes}
        parcelasDividaMes={parcelasDividaMes}
        poupancaRecomendada={poupancaRecomendada}
        qtdCartoes={cartoes.length}
        disponivelCartoes={disponivelCartoes}
        qtdDividas={dividas.length}
        totalDevedor={totalDevedor}
        metaPrincipal={metaPrincipal}
      />

      {/* Central de alertas (limites, faturas, dívidas e metas atrasadas) — vem logo após o
          resumo por ser a informação mais urgente/acionável */}
      <CardAlertas alertas={alertas} />

      {/* 2. Meta financeira */}
      <CardMetas metas={metas} />

      {/* 3. Cartões */}
      <CardCartoes cartoes={cartoes} mes={mes} ano={ano} />

      {/* 4. Dívidas */}
      <CardDividas dividas={dividas} />

      {/* Orientação financeira (dívida → reserva → investir) */}
      <CardOrientacao orientacao={orientacao} />

      {/* Sugestão de alocação da renda */}
      <GraficoAlocacao alocacao={alocacao} />

      {/* Formulário de novo lançamento */}
      <FormLancamento />

      {/* 5. Lançamentos recentes (card recolhível) */}
      <ListaLancamentos lancamentos={lancamentos} categoriasEstouradas={estouradas} />
    </div>
  );
}
