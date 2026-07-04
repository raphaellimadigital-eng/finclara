// Teto padrão para qualquer campo monetário digitado no app: R$ 1.000.000,00. As colunas no
// banco são Decimal(12,2) e estouram a partir de R$ 10 bilhões ("numeric field overflow"), mas
// o limite de produto é bem menor: em um app de finanças pessoais, um valor individual acima
// de 1 milhão é quase sempre erro de digitação.
export const VALOR_MONETARIO_MAXIMO = 1_000_000;

// Teto da taxa de juros aceita no cadastro de dívidas (% ao mês). A coluna é Decimal(5,2) e
// estoura a partir de 1000; nenhuma dívida real cobra mais de 100% ao mês.
export const TAXA_JUROS_MAXIMA = 100;

export const MSG_VALOR_MAXIMO = "O valor máximo permitido é R$ 1.000.000,00.";

// Validação padrão de campo monetário vindo de formulário: número bem formado, positivo e
// dentro do teto.
export function valorMonetarioValido(valor: number): boolean {
  return !isNaN(valor) && valor > 0 && valor <= VALOR_MONETARIO_MAXIMO;
}

// Interpreta um valor digitado do jeito brasileiro: "1.234,56", "1234,56" ou "1234".
// Também tolera ponto decimal ("1234.56") para quem usa teclado numérico que só tem ponto.
// Regra: com vírgula, todo ponto é separador de milhar; sem vírgula, uma sequência de grupos
// de 3 dígitos separados por ponto ("1.234" ou "1.234.567") é milhar, senão o ponto é decimal.
export function parseValorBR(texto: string): number {
  const t = texto.trim();
  if (!t) return NaN;

  if (t.includes(",")) {
    return parseFloat(t.replace(/\./g, "").replace(",", "."));
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    return parseFloat(t.replace(/\./g, ""));
  }
  return parseFloat(t);
}

// Formata um número para exibição em campo de digitação (sem "R$"): 1234.5 → "1234,50"
export function formatarValorParaCampo(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}
