import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Download } from "lucide-react";
import { SeletorMes } from "@/components/SeletorMes";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default function RelatoriosPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

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
        <h2 className="card-title">Relatório mensal em PDF</h2>
        <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
          Receitas x despesas, gastos por categoria e evolução das metas do mês selecionado, prontos
          para revisão pessoal ou familiar.
        </p>
        <a
          href={`/dashboard/relatorio?ano=${ano}&mes=${mes}`}
          className="botao-secundario"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Download size={16} aria-hidden="true" /> Baixar relatório do mês (PDF)
        </a>
      </div>

      <p className="texto-secundario" style={{ fontSize: 12 }}>
        Mais tipos de relatório (comparativos, evolução patrimonial) chegam em versões futuras.
      </p>
    </div>
  );
}
