import type { CartaoCredito, CompraParcelada } from "@prisma/client";

export type Parcela = {
  numero: number;
  valor: number;
  mes: number;
  ano: number;
};

// Compras feitas após o dia de fechamento entram na fatura seguinte (regra do FinClara)
export function calcularPrimeiraFatura(dataCompra: Date, diaFechamento: number): { mes: number; ano: number } {
  let mes = dataCompra.getMonth() + 1;
  let ano = dataCompra.getFullYear();

  if (dataCompra.getDate() > diaFechamento) {
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }

  return { mes, ano };
}

// Gera as N parcelas de uma compra, distribuídas mês a mês a partir da primeira fatura.
// A última parcela absorve a diferença de arredondamento para o total bater certinho.
export function gerarParcelas(compra: Pick<CompraParcelada, "valorTotal" | "numParcelas" | "dataCompra">, diaFechamento: number): Parcela[] {
  const valorTotal = Number(compra.valorTotal);
  const valorParcelaBase = Math.round((valorTotal / compra.numParcelas) * 100) / 100;

  let { mes, ano } = calcularPrimeiraFatura(compra.dataCompra, diaFechamento);
  const parcelas: Parcela[] = [];
  let acumulado = 0;

  for (let numero = 1; numero <= compra.numParcelas; numero++) {
    const ultima = numero === compra.numParcelas;
    const valor = ultima ? Math.round((valorTotal - acumulado) * 100) / 100 : valorParcelaBase;
    acumulado += valor;

    parcelas.push({ numero, valor, mes, ano });

    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }

  return parcelas;
}

// Soma o valor da fatura de um cartão em um mês/ano específico, somando as parcelas de todas
// as compras daquele cartão que caem naquele mês.
export function valorFaturaNoMes(
  compras: CompraParcelada[],
  diaFechamento: number,
  mes: number,
  ano: number
): number {
  return compras.reduce((soma, compra) => {
    const parcelas = gerarParcelas(compra, diaFechamento);
    const parcelaDoMes = parcelas.find((p) => p.mes === mes && p.ano === ano);
    return soma + (parcelaDoMes?.valor ?? 0);
  }, 0);
}

// Soma todas as parcelas ainda não vencidas (fatura atual e futuras) — é o valor "comprometido"
// do limite do cartão.
export function limiteComprometido(compras: CompraParcelada[], diaFechamento: number, referencia: Date = new Date()): number {
  const mesAtual = referencia.getMonth() + 1;
  const anoAtual = referencia.getFullYear();

  return compras.reduce((soma, compra) => {
    const parcelas = gerarParcelas(compra, diaFechamento);
    const futuras = parcelas.filter((p) => p.ano > anoAtual || (p.ano === anoAtual && p.mes >= mesAtual));
    return soma + futuras.reduce((s, p) => s + p.valor, 0);
  }, 0);
}

export function limiteDisponivel(cartao: Pick<CartaoCredito, "limite" | "diaFechamento">, compras: CompraParcelada[]): number {
  return Number(cartao.limite) - limiteComprometido(compras, cartao.diaFechamento);
}

// Soma, por categoria, a parcela do mês de todas as compras parceladas de todos os cartões —
// integra a fatura nos Limites por categoria e no comparativo de alocação da renda (§5.3),
// que hoje só enxergam lançamentos avulsos.
export function parcelasPorCategoriaNoMes(
  cartoes: (Pick<CartaoCredito, "diaFechamento"> & { compras: CompraParcelada[] })[],
  mes: number,
  ano: number
): Record<string, number> {
  const totais: Record<string, number> = {};

  for (const cartao of cartoes) {
    for (const compra of cartao.compras) {
      const parcelaDoMes = gerarParcelas(compra, cartao.diaFechamento).find((p) => p.mes === mes && p.ano === ano);
      if (parcelaDoMes) {
        totais[compra.categoria] = (totais[compra.categoria] ?? 0) + parcelaDoMes.valor;
      }
    }
  }

  return totais;
}
