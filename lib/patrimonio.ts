import type { Divida, Meta } from "@prisma/client";

// Patrimônio = soma do que já foi acumulado em metas (reserva, investimentos, outros objetivos)
// menos o total ainda devido em dívidas. É um retrato do momento atual, não uma média do mês.
export function calcularPatrimonioAtual(metas: Meta[], dividas: Divida[]): number {
  const totalMetas = metas.reduce((s, m) => s + Number(m.valorAtual), 0);
  const totalDividas = dividas.reduce((s, d) => s + Number(d.valorTotal), 0);
  return totalMetas - totalDividas;
}
