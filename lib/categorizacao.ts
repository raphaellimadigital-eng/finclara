import type { Categoria } from "@prisma/client";

// Regras simples por palavra-chave para sugerir a categoria a partir da descrição
// digitada pelo usuário (reduz fricção de precisar escolher manualmente todo lançamento).
const REGRAS: { palavras: string[]; categoria: Categoria }[] = [
  { palavras: ["salario", "salário", "holerite", "pagamento da empresa"], categoria: "SALARIO" },
  { palavras: ["freela", "freelance", "bico", "projeto extra"], categoria: "FREELANCE" },
  { palavras: ["mercado", "supermercado", "feira", "hortifruti", "padaria", "restaurante", "lanche", "ifood"], categoria: "ALIMENTACAO" },
  { palavras: ["aluguel", "condominio", "condomínio", "luz", "energia eletrica", "energia elétrica", "agua", "água", "internet", "gas de cozinha", "gás de cozinha"], categoria: "MORADIA" },
  { palavras: ["uber", "99", "taxi", "táxi", "gasolina", "combustivel", "combustível", "estacionamento", "onibus", "ônibus", "metro", "metrô", "pedagio", "pedágio"], categoria: "TRANSPORTE" },
  { palavras: ["farmacia", "farmácia", "remedio", "remédio", "medico", "médico", "consulta", "exame", "plano de saude", "plano de saúde", "dentista"], categoria: "SAUDE" },
  { palavras: ["escola", "faculdade", "curso", "mensalidade escolar", "material escolar", "livro didatico", "livro didático"], categoria: "EDUCACAO" },
  { palavras: ["cinema", "show", "bar", "balada", "viagem", "passeio", "ingresso"], categoria: "LAZER" },
  { palavras: ["netflix", "spotify", "amazon prime", "disney+", "disney plus", "hbo", "youtube premium", "assinatura"], categoria: "ASSINATURAS" },
  { palavras: ["reserva de emergencia", "reserva de emergência"], categoria: "RESERVA_EMERGENCIA" },
  { palavras: ["tesouro direto", "tesouro selic", "tesouro ipca"], categoria: "TESOURO_DIRETO" },
  { palavras: ["acao", "ação", "acoes", "ações", "fii", "fiis", "renda variavel", "renda variável", "bolsa"], categoria: "RENDA_VARIAVEL" },
];

// Sugere uma categoria a partir do texto da descrição, ou null se nenhuma regra bater.
export function sugerirCategoria(descricao: string): Categoria | null {
  const texto = descricao.trim().toLowerCase();
  if (!texto) return null;

  for (const regra of REGRAS) {
    if (regra.palavras.some((palavra) => texto.includes(palavra))) {
      return regra.categoria;
    }
  }

  return null;
}
