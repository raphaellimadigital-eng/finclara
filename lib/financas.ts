import type { Divida, Lancamento } from "@prisma/client";
import { TAXA_JUROS_CARA_AO_MES, temDividaCara } from "./dividas";
import { MESES_MINIMOS_RESERVA, MESES_IDEAL_RESERVA } from "./orientacao";

// Classificação das categorias de despesa para a regra 50/30/20
export const CATEGORIAS_ESSENCIAIS = ["MORADIA", "ALIMENTACAO", "TRANSPORTE", "SAUDE", "EDUCACAO"];
export const CATEGORIAS_DESEJOS = ["LAZER", "ASSINATURAS", "OUTRAS_DESPESAS"];

// Categorias de aporte (tipo INVESTIMENTO)
export const CATEGORIAS_RESERVA = ["RESERVA_EMERGENCIA"];
export const CATEGORIAS_INVESTIMENTO = ["TESOURO_DIRETO", "RENDA_VARIAVEL", "OUTROS_INVESTIMENTOS"];

// A regra 50/30/20 vira ponto de partida, não teto único: quem gasta mais que isso com o
// essencial (moradia, alimentação, transporte, saúde, educação) não tem como caber em 50% só
// cortando "desejos" — a faixa se ajusta pela realidade de renda de cada pessoa, sem culpa.
// Acima de 80% comprometido, guardar qualquer valor já é uma vitória.
type FaixaAlocacao = { essenciais: number; desejos: number; guardar: number };

const FAIXAS_ALOCACAO: { ateEssenciais: number; faixa: FaixaAlocacao }[] = [
  { ateEssenciais: 0.5, faixa: { essenciais: 0.5, desejos: 0.3, guardar: 0.2 } },
  { ateEssenciais: 0.65, faixa: { essenciais: 0.6, desejos: 0.25, guardar: 0.15 } },
  { ateEssenciais: 0.8, faixa: { essenciais: 0.7, desejos: 0.2, guardar: 0.1 } },
];
const FAIXA_APERTADA: FaixaAlocacao = { essenciais: 0.8, desejos: 0.15, guardar: 0.05 };

// Acima desse percentual de sobra sem destino, sugerimos elevar a fatia de investimento além
// do padrão da faixa — a pessoa já está guardando mais do que a faixa esperava.
const PERCENTUAL_SOBRA_ALTA = 0.3;

function faixaParaEssenciais(pctEssenciais: number): FaixaAlocacao {
  const faixa = FAIXAS_ALOCACAO.find((f) => pctEssenciais <= f.ateEssenciais);
  return faixa ? faixa.faixa : FAIXA_APERTADA;
}

export type Alocacao = {
  totalReceitas: number;
  atual: { essenciais: number; desejos: number; reserva: number; investimento: number; naoAlocado: number };
  ideal: { essenciais: number; desejos: number; reserva: number; investimento: number };
  dicas: string[];
  temDividaCara: boolean;
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Calcula a alocação ideal da renda (regra 50/30/20 adaptativa), compara com os gastos e
// aportes reais do mês, e aplica a prioridade "quitar dívida cara → formar reserva → investir"
// quando há dívidas. `extraPorCategoria` soma a parcela do mês de compras parceladas no cartão
// (ver parcelasPorCategoriaNoMes em lib/cartoes.ts), hoje invisível neste comparativo.
export function calcularAlocacao(
  totalReceitas: number,
  lancamentos: Lancamento[],
  dividas: Divida[] = [],
  extraPorCategoria: Record<string, number> = {}
): Alocacao {
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA");
  const aportes = lancamentos.filter((l) => l.tipo === "INVESTIMENTO");

  function somaExtra(categorias: string[]) {
    return categorias.reduce((s, c) => s + (extraPorCategoria[c] ?? 0), 0);
  }

  const essenciais =
    despesas.filter((l) => CATEGORIAS_ESSENCIAIS.includes(l.categoria)).reduce((s, l) => s + Number(l.valor), 0) +
    somaExtra(CATEGORIAS_ESSENCIAIS);

  const desejos =
    despesas.filter((l) => CATEGORIAS_DESEJOS.includes(l.categoria)).reduce((s, l) => s + Number(l.valor), 0) +
    somaExtra(CATEGORIAS_DESEJOS);

  const reserva = aportes
    .filter((l) => CATEGORIAS_RESERVA.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const investimento = aportes
    .filter((l) => CATEGORIAS_INVESTIMENTO.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const naoAlocado = Math.max(totalReceitas - essenciais - desejos - reserva - investimento, 0);

  const pctEssenciais = totalReceitas > 0 ? essenciais / totalReceitas : 0;
  const faixa = faixaParaEssenciais(pctEssenciais);

  const ideal = {
    essenciais: totalReceitas * faixa.essenciais,
    desejos: totalReceitas * faixa.desejos,
    reserva: totalReceitas * (faixa.guardar / 2),
    investimento: totalReceitas * (faixa.guardar / 2),
  };

  const possuiDividaCara = temDividaCara(dividas);
  const dicas: string[] = [];

  if (possuiDividaCara) {
    dicas.push(
      `Você tem dívida com juros acima de ${TAXA_JUROS_CARA_AO_MES}% ao mês. Antes de investir, priorize quitar essa dívida: é o retorno mais garantido que você pode ter agora.`
    );
  }

  if (totalReceitas > 0) {
    const pctDesejos = desejos / totalReceitas;
    const pctSobra = naoAlocado / totalReceitas;

    if (pctEssenciais > 0.8) {
      dicas.push(
        "Seus gastos essenciais estão bem apertados este mês. O importante agora é caber no mês — guardar qualquer valor, mesmo pequeno, já conta muito."
      );
    } else if (pctEssenciais > 0.65) {
      dicas.push(
        `Seus gastos essenciais consomem ${Math.round(pctEssenciais * 100)}% da renda. Seu orçamento está apertado; guardar qualquer valor já é vitória.`
      );
    } else if (pctEssenciais > 0.5) {
      dicas.push(
        `Seus gastos essenciais consomem ${Math.round(pctEssenciais * 100)}% da renda — acima da média, mas dentro do esperado para sua faixa. Vale ficar de olho em moradia, transporte e alimentação.`
      );
    }
    if (pctDesejos > faixa.desejos) {
      dicas.push(
        `Gastos com desejos (lazer, assinaturas) estão em ${Math.round(pctDesejos * 100)}% da renda. Para sua faixa, o sugerido é até ${Math.round(faixa.desejos * 100)}%.`
      );
    }
    if (reserva < ideal.reserva) {
      const falta = ideal.reserva - reserva;
      dicas.push(
        reserva === 0
          ? `Você ainda não registrou aporte em reserva de emergência este mês. O ideal seria ${formatarMoeda(ideal.reserva)}.`
          : `Faltam ${formatarMoeda(falta)} para atingir a meta de reserva de emergência do mês.`
      );
    }
    if (!possuiDividaCara && investimento < ideal.investimento) {
      dicas.push(
        investimento === 0
          ? `Você ainda não registrou aporte em investimentos este mês. O ideal seria ${formatarMoeda(ideal.investimento)}.`
          : `Faltam ${formatarMoeda(ideal.investimento - investimento)} para atingir a meta de investimento do mês.`
      );
    }
    if (!possuiDividaCara && pctSobra > PERCENTUAL_SOBRA_ALTA) {
      dicas.push(
        `Sua sobra é grande este mês (${Math.round(pctSobra * 100)}% da renda sem destino). Considere elevar a fatia destinada a investimentos além do sugerido para sua faixa.`
      );
    } else if (naoAlocado > 0) {
      dicas.push(
        possuiDividaCara
          ? `Você tem ${formatarMoeda(naoAlocado)} sem destino definido este mês. Direcione para acelerar a quitação da dívida cara.`
          : `Você tem ${formatarMoeda(naoAlocado)} sem destino definido este mês. Considere direcionar para reserva de emergência ou investimentos.`
      );
    }
  }

  if (!possuiDividaCara) {
    dicas.push(
      `Mantenha uma reserva de emergência equivalente a ${MESES_MINIMOS_RESERVA}–${MESES_IDEAL_RESERVA} meses dos seus gastos essenciais antes de investir em renda variável.`
    );
  }

  return {
    totalReceitas,
    atual: { essenciais, desejos, reserva, investimento, naoAlocado },
    ideal,
    dicas,
    temDividaCara: possuiDividaCara,
  };
}
