import type { Lancamento, LimiteCategoria } from "@prisma/client";

// A partir de 80% do limite o alerta é preventivo; a partir de 100% é estouro (regra 13.3)
const LIMIAR_AVISO_PCT = 80;

export type SituacaoLimite = "ok" | "aviso" | "estouro";

export type ProgressoLimite = {
  categoria: string;
  valorLimite: number;
  gastoAtual: number;
  percentual: number;
  situacao: SituacaoLimite;
};

// Compara o gasto do mês em cada categoria com limite definido pelo usuário. `extraPorCategoria`
// soma a parcela do mês de compras parceladas no cartão (ver parcelasPorCategoriaNoMes em
// lib/cartoes.ts), que hoje era invisível para os limites.
export function calcularProgressoLimites(
  lancamentos: Lancamento[],
  limites: LimiteCategoria[],
  extraPorCategoria: Record<string, number> = {}
): ProgressoLimite[] {
  return limites.map((limite) => {
    const gastoAtual =
      lancamentos
        .filter((l) => l.tipo === "DESPESA" && l.categoria === limite.categoria)
        .reduce((soma, l) => soma + Number(l.valor), 0) + (extraPorCategoria[limite.categoria] ?? 0);

    const valorLimite = Number(limite.valorLimite);
    const percentual = valorLimite > 0 ? (gastoAtual / valorLimite) * 100 : 0;

    const situacao: SituacaoLimite =
      percentual >= 100 ? "estouro" : percentual >= LIMIAR_AVISO_PCT ? "aviso" : "ok";

    return { categoria: limite.categoria, valorLimite, gastoAtual, percentual, situacao };
  });
}

export function categoriasEstouradas(progresso: ProgressoLimite[]): Set<string> {
  return new Set(progresso.filter((p) => p.situacao === "estouro").map((p) => p.categoria));
}
