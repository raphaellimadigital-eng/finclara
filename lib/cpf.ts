// CPF: máscara de digitação e validação real pelo algoritmo de dígitos verificadores — não só o
// formato, para não aceitar sequências inventadas (ex: 111.111.111-11) que "parecem" um CPF.

export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function calcularDigitoVerificador(digitos: string, pesoInicial: number): number {
  const soma = digitos
    .split("")
    .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

// Valida os dois dígitos verificadores do CPF (algoritmo oficial da Receita Federal) e rejeita
// sequências de dígito repetido (000.000.000-00, 111.111.111-11 etc.), que passam na conta do
// dígito verificador mas nunca foram emitidas como CPF real.
export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const digitoUm = calcularDigitoVerificador(digitos.slice(0, 9), 10);
  if (digitoUm !== Number(digitos[9])) return false;

  const digitoDois = calcularDigitoVerificador(digitos.slice(0, 10), 11);
  if (digitoDois !== Number(digitos[10])) return false;

  return true;
}
