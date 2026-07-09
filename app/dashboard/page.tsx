import { Suspense } from "react";
import { getLancamentos, getLimiteFuturoCalendario, getStatusPrimeirosPassos } from "./actions";
import { getDividas } from "./dividas/actions";
import { getCartoes } from "./cartoes/actions";
import { getMetas } from "./metas/actions";
import { getUsuarioAtual } from "./perfil/actions";
import { getLimites } from "./limites/actions";
import { ListaLancamentos } from "@/components/ListaLancamentos";
import { Resumo } from "@/components/Resumo";
import { SeletorMes } from "@/components/SeletorMes";
import { GraficoAlocacao } from "@/components/GraficoAlocacao";
import { CardSobra, type MetaResumo } from "@/components/CardSobra";
import { CardEconomia } from "@/components/CardEconomia";
import { CardDividas } from "@/components/CardDividas";
import { CardCartoes } from "@/components/CardCartoes";
import { CardMetas } from "@/components/CardMetas";
import { CardOrientacao } from "@/components/CardOrientacao";
import { CardAlertas } from "@/components/CardAlertas";
import { OnboardingPrimeirosPassos } from "@/components/OnboardingPrimeirosPassos";
import { BannerGuia } from "@/components/BannerGuia";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase-server";
import { calcularAlocacao, CATEGORIAS_ESSENCIAIS } from "@/lib/financas";
import { calcularOrientacao } from "@/lib/orientacao";
import { valorFaturaNoMes, limiteDisponivel, parcelasPorCategoriaNoMes } from "@/lib/cartoes";
import { totalParcelasMensais } from "@/lib/dividas";
import { calcularProjecao, ordenarPorPrazo } from "@/lib/metas";
import { calcularProgressoLimites, categoriasEstouradas } from "@/lib/limites";
import { alertasLimites, alertasCartoes, alertasDividas, alertasMetas, ordenarPorSeveridade } from "@/lib/alertas";
import { LABEL_CATEGORIA } from "@/lib/categorias";
import { registrarSnapshotPatrimonio, getHistoricoPatrimonio } from "./evolucao-patrimonial/actions";
import { GraficoEvolucaoPatrimonial } from "@/components/GraficoEvolucaoPatrimonial";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

// Escolhe a meta a destacar: a mais próxima do prazo entre as ainda não concluídas, ou a
// primeira cadastrada se todas já estiverem concluídas. Usada pelo card da sobra do mês.
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

  const [lancamentos, dividas, cartoes, metas, usuario, limites, limiteFuturoCalendario, statusPrimeirosPassos] = await Promise.all([
    getLancamentos(ano, mes),
    getDividas(),
    getCartoes(),
    getMetas(),
    getUsuarioAtual(),
    getLimites(),
    getLimiteFuturoCalendario(),
    getStatusPrimeirosPassos(),
    // Registra a "foto" do patrimônio do mês corrente para acumular histórico ao longo do
    // tempo (usado no gráfico e no relatório de Evolução Patrimonial). Não bloqueia nada se falhar.
    registrarSnapshotPatrimonio().catch(() => {}),
  ]);

  // Dívidas quitadas não entram em nenhum cálculo financeiro (saldo devedor, parcela do mês,
  // dívida cara, alertas): já foram pagas. Só aparecem na lista para o usuário ver o histórico.
  const dividasAtivas = dividas.filter((d) => !d.quitada);

  const snapshotsPatrimonio = await getHistoricoPatrimonio();
  const historicoPatrimonio = snapshotsPatrimonio.map((s) => ({ ano: s.ano, mes: s.mes, patrimonio: Number(s.patrimonio) }));

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const totalInvestimentos = lancamentos
    .filter((l) => l.tipo === "INVESTIMENTO")
    .reduce((s, l) => s + Number(l.valor), 0);

  // Dinheiro que ainda não tem destino: o que sobrou depois de pagar despesas e já ter
  // investido/guardado. Dinheiro já investido não é mais "livre", por isso sai da conta.
  const saldo = totalReceitas - totalDespesas - totalInvestimentos;
  const parcelasPorCategoria = parcelasPorCategoriaNoMes(cartoes, mes, ano);
  const alocacao = calcularAlocacao(totalReceitas, lancamentos, dividasAtivas, parcelasPorCategoria);

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
  const parcelasDividaMes = totalParcelasMensais(dividasAtivas);
  // Parte do saldo disponível que ainda sobra depois de reservar para pagar cartão e dívida
  // deste mês. Precisa partir do saldo (que já descontou despesas e investimentos), nunca da
  // receita bruta, senão o valor sugerido pode ficar maior que o próprio saldo disponível.
  const poupancaRecomendada = Math.max(saldo - parcelasCartaoMes - parcelasDividaMes, 0);

  const metaPrincipal = calcularMetaPrincipal(metas);

  const progressoLimites = calcularProgressoLimites(lancamentos, limites, parcelasPorCategoria);
  const estouradas = categoriasEstouradas(progressoLimites);

  const alertas = ordenarPorSeveridade([
    ...alertasLimites(progressoLimites, LABEL_CATEGORIA),
    ...alertasCartoes(cartoes),
    ...alertasDividas(dividasAtivas),
    ...alertasMetas(metas),
  ]);

  return (
    <div className="container container-largo">
      {/* Cabeçalho */}
      <div className="topo">
        <div className="marca">
          <Logo />
          <h1>Fin<span style={{ color: "var(--verde)" }}>Clara</span></h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="saudacao">
        Olá, {usuario.nome?.split(" ")[0] || user?.email?.split("@")[0]}. Aqui está o resumo de {" "}
        {new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.
      </p>

      {/* Seletor de mês */}
      <Suspense>
        <SeletorMes ano={ano} mes={mes} anoMinimo={usuario.criadoEm.getFullYear()} limiteFuturo={limiteFuturoCalendario} />
      </Suspense>

      <BannerGuia />

      <OnboardingPrimeirosPassos
        temReceita={statusPrimeirosPassos.temReceita}
        temDespesa={statusPrimeirosPassos.temDespesa}
        temMeta={statusPrimeirosPassos.temMeta}
        ano={ano}
        mes={mes}
      />

      {/* Bloco A — destaque obrigatório: fluxo do mês e a leitura da renda */}

      {/* 1. Como está seu mês (sobrou/faltou, entrou, saiu, guardado, renda com dono) */}
      <Resumo
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        totalInvestimentos={totalInvestimentos}
        saldo={saldo}
        parcelasCartaoMes={parcelasCartaoMes}
        parcelasDividaMes={parcelasDividaMes}
      />

      {/* 2. Para onde foi sua renda (comparativo com a sugestão + dicas + IA) */}
      <GraficoAlocacao alocacao={alocacao} />

      {/* Bloco B — grid de decisão, 2 colunas no desktop / 1 no mobile, gap único */}
      <div className="dashboard-grid">
        {/* 3. Sua prioridade agora (única voz de prioridade do dashboard) */}
        <CardOrientacao orientacao={orientacao} />

        {/* 4. Sobra do mês com ação (some sozinho quando não há sobra) */}
        <CardSobra
          valor={poupancaRecomendada}
          prioridade={orientacao.prioridade}
          metaPrincipal={metaPrincipal}
          metas={metas.map((m) => ({ id: m.id, descricao: m.descricao }))}
          ano={ano}
          mes={mes}
        />

        {/* 4b. Economia do mês (quanto da renda já foi guardado — some sozinho sem investimento) */}
        <CardEconomia totalReceitas={totalReceitas} totalInvestimentos={totalInvestimentos} />

        {/* 5. Metas (meta principal com progresso) */}
        <CardMetas metas={metas} />

        {/* 6. Cartões */}
        <CardCartoes cartoes={cartoes} mes={mes} ano={ano} />

        {/* 7. Dívidas */}
        <CardDividas dividas={dividasAtivas} />

        {/* 8. Central de alertas */}
        <CardAlertas alertas={alertas} ano={ano} mes={mes} />

        {/* 9. Seu dinheiro ao longo do tempo (só aparece com 2+ meses de histórico) */}
        <div className="dashboard-grid-full">
          <GraficoEvolucaoPatrimonial historico={historicoPatrimonio} />
        </div>

        {/* 10. Últimos registros (card recolhível) — full-width */}
        <div className="dashboard-grid-full">
          <ListaLancamentos lancamentos={lancamentos} categoriasEstouradas={estouradas} />
        </div>
      </div>
    </div>
  );
}
