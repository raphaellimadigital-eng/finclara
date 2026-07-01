import type { Lancamento } from "@prisma/client";

// Classificação das categorias de despesa para a regra 50/30/20
export const CATEGORIAS_ESSENCIAIS = ["MORADIA", "ALIMENTACAO", "TRANSPORTE", "SAUDE", "EDUCACAO"];
export const CATEGORIAS_DESEJOS = ["LAZER", "ASSINATURAS", "OUTRAS_DESPESAS"];

const PERCENTUAL_ESSENCIAIS = 0.5;
const PERCENTUAL_DESEJOS = 0.3;
const PERCENTUAL_RESERVA = 0.1;
const PERCENTUAL_INVESTIMENTO = 0.1;

export type Alocacao = {
  totalReceitas: number;
  atual: { essenciais: number; desejos: number; naoAlocado: number };
  ideal: { essenciais: number; desejos: number; reserva: number; investimento: number };
  dicas: string[];
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Calcula a alocação ideal da renda (regra 50/30/20) e compara com os gastos reais do mês
export function calcularAlocacao(totalReceitas: number, lancamentos: Lancamento[]): Alocacao {
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA");

  const essenciais = despesas
    .filter((l) => CATEGORIAS_ESSENCIAIS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const desejos = despesas
    .filter((l) => CATEGORIAS_DESEJOS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const naoAlocado = Math.max(totalReceitas - essenciais - desejos, 0);

  const ideal = {
    essenciais: totalReceitas * PERCENTUAL_ESSENCIAIS,
    desejos: totalReceitas * PERCENTUAL_DESEJOS,
    reserva: totalReceitas * PERCENTUAL_RESERVA,
    investimento: totalReceitas * PERCENTUAL_INVESTIMENTO,
  };

  const dicas: string[] = [];

  if (totalReceitas > 0) {
    const pctEssenciais = essenciais / totalReceitas;
    const pctDesejos = desejos / totalReceitas;

    if (pctEssenciais > PERCENTUAL_ESSENCIAIS) {
      dicas.push(
        `Seus gastos essenciais consomem ${Math.round(pctEssenciais * 100)}% da renda — acima dos 50% recomendados. Vale revisar moradia, transporte e alimentação.`
      );
    }
    if (pctDesejos > PERCENTUAL_DESEJOS) {
      dicas.push(
        `Gastos com desejos (lazer, assinaturas) estão em ${Math.round(pctDesejos * 100)}% da renda — o ideal é até 30%.`
      );
    }
    if (naoAlocado > 0) {
      dicas.push(
        `Você tem ${formatarMoeda(naoAlocado)} sem destino definido este mês. Considere direcionar para reserva de emergência ou investimentos.`
      );
    }
  }

  dicas.push(
    "Mantenha uma reserva de emergência equivalente a 3–6 meses dos seus gastos essenciais antes de investir em renda variável."
  );

  return {
    totalReceitas,
    atual: { essenciais, desejos, naoAlocado },
    ideal,
    dicas,
  };
}
