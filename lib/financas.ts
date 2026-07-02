import type { Divida, Lancamento } from "@prisma/client";
import { TAXA_JUROS_CARA_AO_MES, temDividaCara } from "./dividas";

// Classificação das categorias de despesa para a regra 50/30/20
export const CATEGORIAS_ESSENCIAIS = ["MORADIA", "ALIMENTACAO", "TRANSPORTE", "SAUDE", "EDUCACAO"];
export const CATEGORIAS_DESEJOS = ["LAZER", "ASSINATURAS", "OUTRAS_DESPESAS"];

// Categorias de aporte (tipo INVESTIMENTO)
export const CATEGORIAS_RESERVA = ["RESERVA_EMERGENCIA"];
export const CATEGORIAS_INVESTIMENTO = ["TESOURO_DIRETO", "RENDA_VARIAVEL", "OUTROS_INVESTIMENTOS"];

const PERCENTUAL_ESSENCIAIS = 0.5;
const PERCENTUAL_DESEJOS = 0.3;
const PERCENTUAL_RESERVA = 0.1;
const PERCENTUAL_INVESTIMENTO = 0.1;

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

// Calcula a alocação ideal da renda (regra 50/30/20), compara com os gastos e aportes reais do
// mês, e aplica a prioridade "quitar dívida cara → formar reserva → investir" quando há dívidas.
export function calcularAlocacao(
  totalReceitas: number,
  lancamentos: Lancamento[],
  dividas: Divida[] = []
): Alocacao {
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA");
  const aportes = lancamentos.filter((l) => l.tipo === "INVESTIMENTO");

  const essenciais = despesas
    .filter((l) => CATEGORIAS_ESSENCIAIS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const desejos = despesas
    .filter((l) => CATEGORIAS_DESEJOS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const reserva = aportes
    .filter((l) => CATEGORIAS_RESERVA.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const investimento = aportes
    .filter((l) => CATEGORIAS_INVESTIMENTO.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const naoAlocado = Math.max(totalReceitas - essenciais - desejos - reserva - investimento, 0);

  const ideal = {
    essenciais: totalReceitas * PERCENTUAL_ESSENCIAIS,
    desejos: totalReceitas * PERCENTUAL_DESEJOS,
    reserva: totalReceitas * PERCENTUAL_RESERVA,
    investimento: totalReceitas * PERCENTUAL_INVESTIMENTO,
  };

  const possuiDividaCara = temDividaCara(dividas);
  const dicas: string[] = [];

  if (possuiDividaCara) {
    dicas.push(
      `Você tem dívida com juros acima de ${TAXA_JUROS_CARA_AO_MES}% ao mês. Antes de investir, priorize quitar essa dívida: é o retorno mais garantido que você pode ter agora.`
    );
  }

  if (totalReceitas > 0) {
    const pctEssenciais = essenciais / totalReceitas;
    const pctDesejos = desejos / totalReceitas;

    if (pctEssenciais > PERCENTUAL_ESSENCIAIS) {
      dicas.push(
        `Seus gastos essenciais consomem ${Math.round(pctEssenciais * 100)}% da renda, acima dos 50% recomendados. Vale revisar moradia, transporte e alimentação.`
      );
    }
    if (pctDesejos > PERCENTUAL_DESEJOS) {
      dicas.push(
        `Gastos com desejos (lazer, assinaturas) estão em ${Math.round(pctDesejos * 100)}% da renda. O ideal é até 30%.`
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
    if (naoAlocado > 0) {
      dicas.push(
        possuiDividaCara
          ? `Você tem ${formatarMoeda(naoAlocado)} sem destino definido este mês. Direcione para acelerar a quitação da dívida cara.`
          : `Você tem ${formatarMoeda(naoAlocado)} sem destino definido este mês. Considere direcionar para reserva de emergência ou investimentos.`
      );
    }
  }

  if (!possuiDividaCara) {
    dicas.push(
      "Mantenha uma reserva de emergência equivalente a 3–6 meses dos seus gastos essenciais antes de investir em renda variável."
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
