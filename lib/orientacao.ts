import type { PerfilInvestidor } from "@prisma/client";
import { LABEL_PERFIL } from "./perfilInvestidor";

// Meses de despesas essenciais que a reserva de emergência deve cobrir. Dois marcos, usados
// em todo o app (Orientação, dicas do GraficoAlocacao, skill do produto) para acabar com os
// três números diferentes que existiam para o mesmo conceito:
// - primeiro objetivo: cobre imprevistos comuns, já é uma conquista comemorada na barra;
// - ideal: mais confortável para quem tem renda variável ou dependentes.
export const MESES_MINIMOS_RESERVA = 3;
export const MESES_IDEAL_RESERVA = 6;

export type PrioridadeOrientacao = "QUITAR_DIVIDA" | "FORMAR_RESERVA" | "INVESTIR";

export type Orientacao = {
  prioridade: PrioridadeOrientacao;
  titulo: string;
  explicacao: string;
  reservaAtual: number;
  reservaAlvo: number;
  reservaAlvoIdeal: number;
  mesesReserva: number;
};

const TEXTOS_PERFIL: Record<PerfilInvestidor, string> = {
  CONSERVADOR:
    "Com perfil conservador, uma alternativa a considerar é priorizar renda fixa com liquidez e baixo risco, evitando exposição relevante a renda variável.",
  MODERADO:
    "Com perfil moderado, uma alternativa a considerar é combinar renda fixa com uma parcela menor em renda variável, buscando equilíbrio entre segurança e crescimento.",
  ARROJADO:
    "Com perfil arrojado, você pode considerar uma parcela maior em renda variável e diversificação, sempre alinhado ao prazo de cada objetivo.",
};

export function calcularOrientacao({
  temDividaCara,
  reservaAtual,
  essenciaisMensal,
  perfilInvestidor,
}: {
  temDividaCara: boolean;
  reservaAtual: number;
  essenciaisMensal: number;
  perfilInvestidor: PerfilInvestidor | null;
}): Orientacao {
  const reservaAlvo = essenciaisMensal * MESES_MINIMOS_RESERVA;
  const reservaAlvoIdeal = essenciaisMensal * MESES_IDEAL_RESERVA;
  const mesesReserva = essenciaisMensal > 0 ? reservaAtual / essenciaisMensal : 0;

  if (temDividaCara) {
    return {
      prioridade: "QUITAR_DIVIDA",
      titulo: "Quite suas dívidas caras primeiro",
      explicacao:
        "Você tem dívida com juros altos. Quitar essa dívida é o retorno mais garantido que você pode ter agora, nenhum investimento supera isso com segurança. Deixe investimentos para depois de resolver isso.",
      reservaAtual,
      reservaAlvo,
      reservaAlvoIdeal,
      mesesReserva,
    };
  }

  if (reservaAlvo > 0 && reservaAtual < reservaAlvo) {
    return {
      prioridade: "FORMAR_RESERVA",
      titulo: "Forme sua reserva de emergência",
      explicacao: `Sua reserva cobre ${mesesReserva.toFixed(1)} de ${MESES_MINIMOS_RESERVA} meses recomendados de gastos essenciais (de ${MESES_MINIMOS_RESERVA} a ${MESES_IDEAL_RESERVA} meses no ideal). Foque em completá-la (guardando em algo com liquidez diária) antes de direcionar dinheiro para investimentos de mais longo prazo.`,
      reservaAtual,
      reservaAlvo,
      reservaAlvoIdeal,
      mesesReserva,
    };
  }

  const textoPerfil = perfilInvestidor
    ? TEXTOS_PERFIL[perfilInvestidor]
    : "Responda o questionário de perfil de investidor no menu Perfil de investidor para receber uma orientação mais precisa.";

  const textoReservaIdeal =
    reservaAtual < reservaAlvoIdeal
      ? ` Sua reserva já cobre o primeiro objetivo (${MESES_MINIMOS_RESERVA} meses) — se quiser ainda mais segurança, o ideal é chegar a ${MESES_IDEAL_RESERVA} meses.`
      : "";

  return {
    prioridade: "INVESTIR",
    titulo: "Você está pronto para investir",
    explicacao: `Sem dívidas caras e com reserva de emergência formada, este é um bom momento para direcionar novos aportes para investimentos.${textoReservaIdeal} ${textoPerfil}`,
    reservaAtual,
    reservaAlvo,
    reservaAlvoIdeal,
    mesesReserva,
  };
}

export { LABEL_PERFIL };
