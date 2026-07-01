import type { PerfilInvestidor } from "@prisma/client";

export const LABEL_PERFIL: Record<PerfilInvestidor, string> = {
  CONSERVADOR: "Conservador",
  MODERADO: "Moderado",
  ARROJADO: "Arrojado",
};

export const DESCRICAO_PERFIL: Record<PerfilInvestidor, string> = {
  CONSERVADOR: "Prioriza segurança e liquidez, mesmo que o retorno seja menor.",
  MODERADO: "Busca equilíbrio entre segurança e crescimento do patrimônio.",
  ARROJADO: "Aceita mais oscilação no curto prazo em troca de buscar mais crescimento.",
};

export type PerguntaPerfil = {
  pergunta: string;
  opcoes: { valor: number; texto: string }[];
};

// Questionário curto (3 perguntas) para estimar o perfil de investidor — regra do FinClara,
// sem substituir uma análise de suitability formal.
export const PERGUNTAS_PERFIL: PerguntaPerfil[] = [
  {
    pergunta: "Como você reagiria se seus investimentos caíssem 10% em um mês?",
    opcoes: [
      { valor: 1, texto: "Venderia tudo para evitar mais perdas" },
      { valor: 2, texto: "Ficaria preocupado, mas esperaria melhorar" },
      { valor: 3, texto: "Manteria ou aumentaria os aportes — é normal" },
    ],
  },
  {
    pergunta: "Qual seu principal objetivo ao investir?",
    opcoes: [
      { valor: 1, texto: "Proteger o dinheiro que já tenho" },
      { valor: 2, texto: "Equilíbrio entre segurança e crescimento" },
      { valor: 3, texto: "Buscar o maior crescimento possível, mesmo com risco" },
    ],
  },
  {
    pergunta: "Por quanto tempo pretende deixar o dinheiro investido sem precisar dele?",
    opcoes: [
      { valor: 1, texto: "Menos de 1 ano" },
      { valor: 2, texto: "Entre 1 e 5 anos" },
      { valor: 3, texto: "Mais de 5 anos" },
    ],
  },
];

export function calcularPerfil(respostas: number[]): PerfilInvestidor {
  const soma = respostas.reduce((s, v) => s + v, 0);
  if (soma <= 4) return "CONSERVADOR";
  if (soma <= 7) return "MODERADO";
  return "ARROJADO";
}
