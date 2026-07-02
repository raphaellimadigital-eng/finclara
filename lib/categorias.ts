// Listas e rótulos de categoria centralizados — usados no formulário de lançamento, no
// formulário de limite por categoria, e em toda exibição de categoria (lista de lançamentos,
// limites, alertas, resumo, relatório em PDF).

export const CATEGORIAS_RECEITA = [
  { value: "SALARIO", label: "Salário" },
  { value: "FREELANCE", label: "Freelance / Bico" },
  { value: "OUTRAS_RECEITAS", label: "Outras receitas" },
];

export const CATEGORIAS_DESPESA = [
  { value: "MORADIA", label: "Moradia (aluguel, luz, água)" },
  { value: "ALIMENTACAO", label: "Alimentação" },
  { value: "TRANSPORTE", label: "Transporte / Combustível" },
  { value: "SAUDE", label: "Saúde / Farmácia" },
  { value: "EDUCACAO", label: "Educação / Colégio" },
  { value: "LAZER", label: "Lazer" },
  { value: "ASSINATURAS", label: "Assinaturas" },
  { value: "OUTRAS_DESPESAS", label: "Outras despesas" },
];

export const CATEGORIAS_INVESTIMENTO = [
  { value: "RESERVA_EMERGENCIA", label: "Reserva de emergência" },
  { value: "TESOURO_DIRETO", label: "Tesouro Direto" },
  { value: "RENDA_VARIAVEL", label: "Renda variável (ações, FIIs...)" },
  { value: "OUTROS_INVESTIMENTOS", label: "Outros investimentos" },
];

export const LABEL_CATEGORIA: Record<string, string> = {
  SALARIO: "Salário",
  FREELANCE: "Freelance",
  OUTRAS_RECEITAS: "Outras receitas",
  MORADIA: "Moradia",
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  SAUDE: "Saúde",
  EDUCACAO: "Educação",
  LAZER: "Lazer",
  ASSINATURAS: "Assinaturas",
  OUTRAS_DESPESAS: "Outras despesas",
  RESERVA_EMERGENCIA: "Reserva de emergência",
  TESOURO_DIRETO: "Tesouro Direto",
  RENDA_VARIAVEL: "Renda variável",
  OUTROS_INVESTIMENTOS: "Outros investimentos",
};
