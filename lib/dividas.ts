import type { Divida } from "@prisma/client";
import { avancarMeses, type MesAno } from "./data";

// Acima desse percentual ao mês, a dívida é considerada "cara" e o motor de
// recomendação passa a priorizar a quitação antes de qualquer investimento
// (parametrizável — referência: bem acima da Selic mensal equivalente).
export const TAXA_JUROS_CARA_AO_MES = 2;

// Palavras que, na descrição, indicam um tipo de dívida tradicionalmente com juros altos no
// Brasil (cartão, cheque especial) — usado como padrão conservador quando o usuário não sabe
// os juros, para não deixar de priorizar a quitação por falta de informação.
const PADRAO_DIVIDA_TIPICAMENTE_CARA = /cart[aã]o|cheque especial/i;

export function ehDividaCara(divida: Pick<Divida, "taxaJuros" | "jurosDesconhecidos" | "descricao">): boolean {
  if (divida.jurosDesconhecidos) {
    return PADRAO_DIVIDA_TIPICAMENTE_CARA.test(divida.descricao);
  }
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

// Percentual já quitado da dívida, com base no valor original guardado no cadastro.
export function percentualQuitado(divida: Pick<Divida, "valorOriginal" | "valorTotal">): number {
  const original = Number(divida.valorOriginal);
  if (original <= 0) return 0;
  return Math.min(100, Math.max(0, (1 - Number(divida.valorTotal) / original) * 100));
}

// Mesmo dia do mês seguinte, ajustado para o último dia quando o mês de destino for mais curto
// (ex: vencimento em 31/jan avança para 28 ou 29/fev).
export function avancarUmMes(data: Date): Date {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();
  const ultimoDiaDoProximoMes = new Date(ano, mes + 2, 0).getDate();
  return new Date(ano, mes + 1, Math.min(dia, ultimoDiaDoProximoMes));
}

export type ResultadoPagamento = {
  valorTotal: number;
  vencimento: Date;
  quitada: boolean;
};

// Abate uma parcela do saldo devedor. Quando o saldo restante zera, a dívida fica quitada;
// caso contrário, o vencimento avança um mês para o próximo ciclo de cobrança.
export function calcularPagamento(
  divida: Pick<Divida, "valorTotal" | "valorParcela" | "vencimento">
): ResultadoPagamento {
  const restante = Math.round((Number(divida.valorTotal) - Number(divida.valorParcela)) * 100) / 100;

  if (restante <= 0) {
    return { valorTotal: 0, vencimento: new Date(divida.vencimento), quitada: true };
  }

  return { valorTotal: restante, vencimento: avancarUmMes(new Date(divida.vencimento)), quitada: false };
}

// Inverso de avancarUmMes: mesmo dia do mês anterior, ajustado para o último dia quando o mês
// de destino for mais curto.
export function recuarUmMes(data: Date): Date {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();
  const ultimoDiaDoMesAnterior = new Date(ano, mes, 0).getDate();
  return new Date(ano, mes - 1, Math.min(dia, ultimoDiaDoMesAnterior));
}

// Desfaz o último pagamento registrado: devolve a parcela ao saldo devedor (sem passar do valor
// original), reabre a dívida se estava quitada e recua o vencimento um mês (a não ser que a
// quitação não tenha avançado o vencimento, já que ele só avança quando ainda sobra saldo).
export function desfazerPagamento(
  divida: Pick<Divida, "valorTotal" | "valorParcela" | "vencimento" | "valorOriginal" | "quitada">
): ResultadoPagamento {
  const valorTotal = Math.min(
    Math.round((Number(divida.valorTotal) + Number(divida.valorParcela)) * 100) / 100,
    Number(divida.valorOriginal)
  );
  const vencimento = divida.quitada ? new Date(divida.vencimento) : recuarUmMes(new Date(divida.vencimento));

  return { valorTotal, vencimento, quitada: false };
}

// Estima até quando uma dívida ainda vai ter parcela, a partir de quantas parcelas do tamanho
// atual faltam pra quitar o saldo (vencimento já é a data da próxima parcela — por isso o -1).
// É uma estimativa: se o valor da parcela mudar no meio do caminho, a data real muda também.
export function ultimoMesProjetado(
  divida: Pick<Divida, "vencimento" | "valorTotal" | "valorParcela">
): MesAno {
  const valorParcela = Number(divida.valorParcela);
  const mesesRestantes = valorParcela > 0 ? Math.max(1, Math.ceil(Number(divida.valorTotal) / valorParcela)) : 1;
  const vencimento = new Date(divida.vencimento);

  return avancarMeses({ mes: vencimento.getMonth() + 1, ano: vencimento.getFullYear() }, mesesRestantes - 1);
}
