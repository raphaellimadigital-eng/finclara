import type { Lancamento, Meta } from "@prisma/client";
import { calcularProjecao, LABEL_TIPO_META } from "./metas";
import { LABEL_CATEGORIA } from "./categorias";

export type GastoCategoria = {
  categoria: string;
  label: string;
  valor: number;
  percentual: number;
};

export type MetaRelatorio = {
  descricao: string;
  tipo: string;
  valorAtual: number;
  valorAlvo: number;
  percentual: number;
  situacao: "concluida" | "atrasada" | "em_dia";
};

export type DadosRelatorio = {
  ano: number;
  mes: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  gastosPorCategoria: GastoCategoria[];
  metas: MetaRelatorio[];
};

// Agrega os dados do mês no formato usado pelo relatório em PDF (receitas x despesas,
// gastos por categoria e evolução das metas — regra 13.5 da proposta).
export function gerarDadosRelatorio(
  ano: number,
  mes: number,
  lancamentos: Lancamento[],
  metas: Meta[]
): DadosRelatorio {
  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0);

  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA");
  const totalDespesas = despesas.reduce((s, l) => s + Number(l.valor), 0);

  const porCategoria = new Map<string, number>();
  for (const l of despesas) {
    porCategoria.set(l.categoria, (porCategoria.get(l.categoria) ?? 0) + Number(l.valor));
  }

  const gastosPorCategoria: GastoCategoria[] = Array.from(porCategoria.entries())
    .map(([categoria, valor]) => ({
      categoria,
      label: LABEL_CATEGORIA[categoria] ?? categoria,
      valor,
      percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  const metasRelatorio: MetaRelatorio[] = metas.map((m) => {
    const projecao = calcularProjecao(m);
    return {
      descricao: m.descricao,
      tipo: LABEL_TIPO_META[m.tipo] ?? m.tipo,
      valorAtual: Number(m.valorAtual),
      valorAlvo: Number(m.valorAlvo),
      percentual: projecao.percentual,
      situacao: projecao.concluida ? "concluida" : projecao.atrasada ? "atrasada" : "em_dia",
    };
  });

  return {
    ano,
    mes,
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    gastosPorCategoria,
    metas: metasRelatorio,
  };
}
