import type { Usuario } from "@prisma/client";

export const DURACAO_TRIAL_DIAS = 7;

// Prefixo reconhecido pelos componentes cliente para distinguir um bloqueio de plano de um erro
// de validação comum — ambos chegam como Error lançado pela Server Action.
export const ERRO_PAYWALL = "PAYWALL:";

export function erroPaywall(mensagem: string): Error {
  return new Error(`${ERRO_PAYWALL}${mensagem}`);
}

// Componentes cliente chamam isso no catch de uma Server Action: se o erro veio de erroPaywall,
// retorna a mensagem (sem o prefixo) para mostrar no PromptUpgrade; senão retorna null, para o
// caller cair no tratamento de erro genérico de sempre.
export function mensagemPaywall(erro: unknown): string | null {
  if (!(erro instanceof Error) || !erro.message.startsWith(ERRO_PAYWALL)) return null;
  return erro.message.slice(ERRO_PAYWALL.length);
}

export function calcularFimTrial(criadoEm: Date): Date {
  return new Date(criadoEm.getTime() + DURACAO_TRIAL_DIAS * 24 * 60 * 60 * 1000);
}

export function trialAtivo(usuario: Pick<Usuario, "trialEndsAt">, agora = new Date()): boolean {
  return agora < usuario.trialEndsAt;
}

type UsuarioAssinatura = Pick<Usuario, "trialEndsAt" | "plano" | "statusAssinatura" | "periodoAtualFim">;

// Acesso completo vale enquanto o trial não venceu, ou enquanto o plano é PRO com assinatura
// ATIVA/PAUSADA (falha de cobrança recente, ainda dentro da tolerância do Mercado Pago antes de
// cancelar), ou com assinatura CANCELADA mas o período já pago ainda não terminou.
export function temAcessoCompleto(usuario: UsuarioAssinatura, agora = new Date()): boolean {
  if (trialAtivo(usuario, agora)) return true;
  if (usuario.plano !== "PRO") return false;

  if (usuario.statusAssinatura === "ATIVA" || usuario.statusAssinatura === "PAUSADA") return true;
  if (usuario.statusAssinatura === "CANCELADA") {
    return usuario.periodoAtualFim !== null && agora < usuario.periodoAtualFim;
  }
  return false;
}

export type Feature =
  | "dividas_quitacao"
  | "cartao_extra"
  | "meta_extra"
  | "alertas_completos"
  | "relatorios_pdf"
  | "ia_recomendacao";

// Limite de itens do plano Free para features que contam quantidade (cartões, metas ativas):
// o 1º item é sempre permitido, o 2º em diante exige acesso completo.
const LIMITE_FREE_POR_CONTAGEM = 1;

// Decide se o usuário pode usar a feature agora. `contagemAtual` é o número de itens já
// existentes ANTES da ação (ex: cartões já cadastrados) — usado só pelas features que contam
// quantidade; a função decide se MAIS UM item pode ser criado.
export function podeUsarFeature(
  usuario: UsuarioAssinatura,
  feature: Feature,
  contexto?: { contagemAtual?: number },
  agora = new Date()
): boolean {
  if (temAcessoCompleto(usuario, agora)) return true;

  switch (feature) {
    case "cartao_extra":
    case "meta_extra":
      return (contexto?.contagemAtual ?? 0) < LIMITE_FREE_POR_CONTAGEM;
    case "dividas_quitacao":
    case "alertas_completos":
    case "relatorios_pdf":
    case "ia_recomendacao":
      return false;
  }
}

// Dias restantes de trial, para exibir no banner — nunca negativo.
export function diasRestantesTrial(usuario: Pick<Usuario, "trialEndsAt">, agora = new Date()): number {
  const diffMs = usuario.trialEndsAt.getTime() - agora.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}
