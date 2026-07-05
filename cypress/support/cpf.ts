// Réplica mínima do algoritmo de dígito verificador de lib/cpf.ts, só para gerar CPFs válidos
// em massa nos testes — os specs rodam no browser do Cypress, sem acesso direto ao código do app.
function calcularDigitoVerificador(digitos: string, pesoInicial: number): number {
  const soma = digitos
    .split("")
    .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function gerarCpfValido(): string {
  let base = "";
  for (let i = 0; i < 9; i++) base += Math.floor(Math.random() * 10);
  if (/^(\d)\1{8}$/.test(base)) return gerarCpfValido();

  const d1 = calcularDigitoVerificador(base, 10);
  const d2 = calcularDigitoVerificador(base + d1, 11);
  return `${base}${d1}${d2}`;
}
