// Formatação brasileira centralizada — usada por todos os cards, listas e telas.
// (Antes cada componente tinha uma cópia própria de formatarMoeda/formatarData.)

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(data: Date): string {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const NOME_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function nomeMesAno(ano: number, mes: number): string {
  return `${NOME_MES[mes - 1]} de ${ano}`;
}
