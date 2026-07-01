import type { Divida } from "@prisma/client";

// Acima desse percentual ao mês, a dívida é considerada "cara" e o motor de
// recomendação passa a priorizar a quitação antes de qualquer investimento
// (parametrizável — referência: bem acima da Selic mensal equivalente).
export const TAXA_JUROS_CARA_AO_MES = 2;

export function ehDividaCara(divida: Pick<Divida, "taxaJuros">): boolean {
  return Number(divida.taxaJuros) > TAXA_JUROS_CARA_AO_MES;
}

export function temDividaCara(dividas: Divida[]): boolean {
  return dividas.some(ehDividaCara);
}

// Ordena por prioridade de quitação: juros mais altos primeiro (mais "caras" primeiro)
export function ordenarPorPrioridade(dividas: Divida[]): Divida[] {
  return [...dividas].sort((a, b) => Number(b.taxaJuros) - Number(a.taxaJuros));
}

export function totalDevedor(dividas: Divida[]): number {
  return dividas.reduce((soma, d) => soma + Number(d.valorTotal), 0);
}

export function totalParcelasMensais(dividas: Divida[]): number {
  return dividas.reduce((soma, d) => soma + Number(d.valorParcela), 0);
}
