import { z } from "zod";
import type { ChangeEvent } from "react";

// Tetos de tamanho para campos de texto do app — usados nos formulários (maxLength/minLength)
// e replicados aqui para validação no server, já que o client nunca é a única linha de defesa.
export const NOME_MIN = 2;
export const NOME_MAX = 80;
export const NOME_CARTAO_MAX = 50;
export const DESCRICAO_MAX = 100;
export const TELEFONE_MAX = 20;
export const ENDERECO_MAX = 200;
// Sem campo "número de parcelas" na dívida (diferente da compra parcelada) para calibrar um
// teto natural — usamos um limite alto o bastante para não incomodar (50 anos de parcela mensal).
export const PARCELAS_RESTANTES_MAX = 600;

function schemaTexto(min: number, max: number, rotulo: string) {
  return z
    .string()
    .trim()
    .min(min, `${rotulo} deve ter entre ${min} e ${max} caracteres.`)
    .max(max, `${rotulo} deve ter entre ${min} e ${max} caracteres.`);
}

export const schemaNomeUsuario = schemaTexto(NOME_MIN, NOME_MAX, "O nome");
export const schemaNomeCartao = schemaTexto(NOME_MIN, NOME_CARTAO_MAX, "O apelido do cartão");
export const schemaDescricao = schemaTexto(NOME_MIN, DESCRICAO_MAX, "A descrição");

export const schemaTelefone = z
  .string()
  .trim()
  .max(TELEFONE_MAX, `O telefone deve ter no máximo ${TELEFONE_MAX} caracteres.`)
  .regex(/^[\d\s()+-]*$/, "O telefone deve conter apenas números e símbolos como (), - e +.");

export const schemaEndereco = z
  .string()
  .trim()
  .max(ENDERECO_MAX, `O endereço deve ter no máximo ${ENDERECO_MAX} caracteres.`);

// Valida um valor com o schema informado e lança um Error com a primeira mensagem em pt-BR —
// mantém o padrão já usado no resto do app (`throw new Error(...)` capturado pelo formulário).
export function validar<T>(schema: z.ZodType<T>, valor: unknown): T {
  const resultado = schema.safeParse(valor);
  if (!resultado.success) {
    throw new Error(resultado.error.issues[0]?.message ?? "Valor inválido.");
  }
  return resultado.data;
}

// Contraparte no client de schemaTexto: mostra a mesma mensagem em pt-BR via setCustomValidity
// (o `maxLength` do próprio input já bloqueia excesso ao digitar/colar; falta cobrir vazio e
// "só espaços" com uma mensagem clara, e o mínimo de caracteres real).
export function validarTextoNoInput(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  min: number,
  max: number,
  rotulo: string
) {
  const valor = e.target.value.trim();
  if (valor.length === 0) {
    e.target.setCustomValidity(`Informe ${rotulo.toLowerCase()}.`);
  } else if (valor.length < min) {
    e.target.setCustomValidity(`${rotulo} deve ter entre ${min} e ${max} caracteres.`);
  } else {
    e.target.setCustomValidity("");
  }
}
