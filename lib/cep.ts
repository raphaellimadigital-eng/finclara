// Busca de endereço por CEP via ViaCEP (gratuito, sem chave) — usado no cadastro e na edição
// de dados cadastrais para preencher o endereço automaticamente.

export function formatarCep(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

export async function buscarEnderecoPorCep(cep: string): Promise<string> {
  const digitos = cep.replace(/\D/g, "");
  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  const dados = await resposta.json();

  if (dados.erro) {
    throw new Error("CEP não encontrado.");
  }

  const partes = [dados.logradouro, dados.bairro, [dados.localidade, dados.uf].filter(Boolean).join(" - ")].filter(Boolean);
  return partes.join(", ");
}
