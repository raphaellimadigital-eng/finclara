// Taxas de referência anuais para o simulador de investimentos. Valores fixos, atualizados
// manualmente de tempos em tempos (não há chamada a API externa) — ver decisão no plano do
// simulador. Ao atualizar, ajustar também os comentários com a data de referência.
// Referência: 07/2026, Selic em 10,75% a.a.
export const TAXA_SELIC_ANUAL = 0.1075;
export const TAXA_CDI_ANUAL = 0.1065;
export const TAXA_IPCA_ANUAL = 0.045;
// Tesouro IPCA+ costuma pagar IPCA + uma taxa fixa adicional; usamos uma média de mercado.
export const SPREAD_TESOURO_IPCA_ANUAL = 0.06;
// Poupança: 0,5% ao mês + TR quando a Selic está acima de 8,5% a.a. (regra atual, TR ~ 0).
export const TAXA_POUPANCA_MENSAL = 0.005;

export type TipoInvestimento = "TESOURO_SELIC" | "TESOURO_IPCA" | "CDB" | "CAIXINHA" | "POUPANCA";

export const OPCOES_INVESTIMENTO: Record<TipoInvestimento, { rotulo: string; descricao: string }> = {
  TESOURO_SELIC: {
    rotulo: "Tesouro Selic",
    descricao: "Título público pós-fixado, acompanha a Selic. Baixo risco e alta liquidez.",
  },
  TESOURO_IPCA: {
    rotulo: "Tesouro IPCA+",
    descricao: "Título público que rende inflação (IPCA) mais uma taxa fixa. Protege o poder de compra.",
  },
  CDB: {
    rotulo: "CDB (100% do CDI)",
    descricao: "Título de banco ou corretora, comum em recomendações de renda fixa privada.",
  },
  CAIXINHA: {
    rotulo: "Caixinha (nubank e similares)",
    descricao: "Reserva com rendimento diário oferecida por bancos digitais, geralmente 100% do CDI.",
  },
  POUPANCA: {
    rotulo: "Poupança",
    descricao: "Rende 0,5% ao mês enquanto a Selic estiver acima de 8,5% ao ano.",
  },
};

// Taxa mensal equivalente de cada tipo de investimento. Taxas anuais são convertidas para
// mensais com juros compostos (não dividir por 12 — isso subestima o rendimento).
export function taxaMensal(tipo: TipoInvestimento): number {
  switch (tipo) {
    case "TESOURO_SELIC":
      return Math.pow(1 + TAXA_SELIC_ANUAL, 1 / 12) - 1;
    case "TESOURO_IPCA":
      return Math.pow(1 + TAXA_IPCA_ANUAL + SPREAD_TESOURO_IPCA_ANUAL, 1 / 12) - 1;
    case "CDB":
    case "CAIXINHA":
      return Math.pow(1 + TAXA_CDI_ANUAL, 1 / 12) - 1;
    case "POUPANCA":
      return TAXA_POUPANCA_MENSAL;
  }
}

export type PontoSimulacao = { mes: number; totalInvestido: number; valorAcumulado: number };

export type SimulacaoResultado = {
  totalInvestido: number;
  totalJuros: number;
  valorFinal: number;
  taxaAnualEquivalente: number;
  serieMensal: PontoSimulacao[];
};

export function calcularSimulacao({
  valorInicial,
  aporteMensal,
  meses,
  tipoInvestimento,
}: {
  valorInicial: number;
  aporteMensal: number;
  meses: number;
  tipoInvestimento: TipoInvestimento;
}): SimulacaoResultado {
  const taxa = taxaMensal(tipoInvestimento);

  let saldo = valorInicial;
  let totalInvestido = valorInicial;
  const serieMensal: PontoSimulacao[] = [{ mes: 0, totalInvestido, valorAcumulado: saldo }];

  for (let mes = 1; mes <= meses; mes++) {
    saldo = saldo * (1 + taxa) + aporteMensal;
    totalInvestido += aporteMensal;
    serieMensal.push({ mes, totalInvestido, valorAcumulado: saldo });
  }

  return {
    totalInvestido,
    totalJuros: saldo - totalInvestido,
    valorFinal: saldo,
    taxaAnualEquivalente: Math.pow(1 + taxa, 12) - 1,
    serieMensal,
  };
}

export type ResultadoAporteNecessario =
  | { possivel: false }
  | { possivel: true; aporteMensal: number; taxaAnualEquivalente: number };

// Cálculo inverso: dado quanto falta para a meta e o prazo, qual aporte mensal fecha a conta.
// Fórmula de valor futuro de anuidade (VF = VP*(1+i)^n + PMT*((1+i)^n - 1)/i), isolando PMT.
export function calcularAporteNecessario({
  valorAtual,
  valorAlvo,
  meses,
  tipoInvestimento,
}: {
  valorAtual: number;
  valorAlvo: number;
  meses: number;
  tipoInvestimento: TipoInvestimento;
}): ResultadoAporteNecessario {
  if (meses <= 0) return { possivel: false };

  const taxa = taxaMensal(tipoInvestimento);
  const taxaAnualEquivalente = Math.pow(1 + taxa, 12) - 1;
  const faltante = valorAlvo - valorAtual * Math.pow(1 + taxa, meses);

  if (faltante <= 0) {
    return { possivel: true, aporteMensal: 0, taxaAnualEquivalente };
  }

  const fatorAnuidade = (Math.pow(1 + taxa, meses) - 1) / taxa;
  return { possivel: true, aporteMensal: faltante / fatorAnuidade, taxaAnualEquivalente };
}
