import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Download, Sparkles, Table, GitCompare, LineChart, Crown } from "lucide-react";
import { SeletorMes } from "@/components/SeletorMes";
import { getHistoricoPatrimonio } from "../evolucao-patrimonial/actions";
import { getStatusAssinatura } from "@/lib/auth";
import { podeUsarFeature } from "@/lib/assinatura";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

function BadgePro() {
  return (
    <span
      className="categoria-tag"
      style={{ color: "var(--amarelo-texto)", borderColor: "var(--amarelo)", background: "var(--amarelo-clara)" }}
    >
      <Crown size={11} aria-hidden="true" /> Pro
    </span>
  );
}

export default async function RelatoriosPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const historicoPatrimonio = await getHistoricoPatrimonio();
  const mesesFaltando = Math.max(2 - historicoPatrimonio.length, 0);

  const usuario = await getStatusAssinatura();
  const temAcessoRelatorios = podeUsarFeature(usuario, "relatorios_pdf");

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
        <FileText size={20} aria-hidden="true" /> Relatórios
      </h1>

      <Suspense>
        <SeletorMes ano={ano} mes={mes} baseHref="/dashboard/relatorios" />
      </Suspense>

      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Relatório Mensal {!temAcessoRelatorios && <BadgePro />}
        </h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Receitas x despesas, gastos por categoria e evolução das metas do mês selecionado, prontos
          para revisão pessoal ou familiar.
        </p>
        <a
          href={`/dashboard/relatorio?ano=${ano}&mes=${mes}`}
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar Relatório Mensal (PDF)
        </a>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={15} aria-hidden="true" style={{ color: "var(--investimento)" }} /> Diagnóstico Financeiro
          {!temAcessoRelatorios && <BadgePro />}
        </h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Sua prioridade atual (quitar dívida, formar reserva ou investir) com uma análise
          personalizada gerada por IA a partir da sua situação financeira do mês.
        </p>
        <a
          href={`/dashboard/diagnostico?ano=${ano}&mes=${mes}`}
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar Diagnóstico Financeiro (PDF)
        </a>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Table size={15} aria-hidden="true" /> Extrato de Lançamentos
        </h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Todos os lançamentos do mês selecionado em planilha, prontos para abrir no Excel ou
          Google Planilhas.
        </p>
        <a
          href={`/dashboard/extrato?ano=${ano}&mes=${mes}`}
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar Extrato de Lançamentos (CSV)
        </a>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GitCompare size={15} aria-hidden="true" /> Comparativo Mensal
          {!temAcessoRelatorios && <BadgePro />}
        </h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Compara receitas, despesas e gastos por categoria do mês selecionado com o mês anterior.
          <strong> Precisa de lançamentos registrados em pelo menos dois meses seguidos.</strong>{" "}
          Sem isso, o relatório avisa que ainda não há dado suficiente em vez de comparar com zero.
        </p>
        <a
          href={`/dashboard/comparativo?ano=${ano}&mes=${mes}`}
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar Comparativo Mensal (PDF)
        </a>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LineChart size={15} aria-hidden="true" /> Evolução Patrimonial
          {!temAcessoRelatorios && <BadgePro />}
        </h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Mostra como seu patrimônio (metas acumuladas menos dívidas) mudou mês a mês.{" "}
          <strong>
            O FinClara registra um retrato automático a cada mês que você acessa o app
            {mesesFaltando > 0
              ? `. Ainda faltam ${mesesFaltando} ${mesesFaltando === 1 ? "mês" : "meses"} de histórico para este relatório ficar completo.`
              : ", e já há histórico suficiente pra esse relatório."}
          </strong>
        </p>
        <a
          href="/dashboard/evolucao-patrimonial"
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar Evolução Patrimonial (PDF)
        </a>
      </div>
    </div>
  );
}
