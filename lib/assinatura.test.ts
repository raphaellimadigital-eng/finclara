import { describe, expect, it } from "vitest";
import {
  DURACAO_TRIAL_DIAS,
  ERRO_PAYWALL,
  calcularFimTrial,
  diasRestantesTrial,
  erroPaywall,
  mensagemPaywall,
  podeUsarFeature,
  temAcessoCompleto,
  trialAtivo,
} from "./assinatura";
import type { Usuario } from "@prisma/client";

const AGORA = new Date("2026-07-10T12:00:00Z");

function usuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: "u1",
    nome: "Teste",
    email: "teste@example.com",
    criadoEm: new Date("2026-07-01T00:00:00Z"),
    perfilInvestidor: null,
    telefone: null,
    endereco: null,
    trialEndsAt: new Date("2026-07-08T00:00:00Z"), // trial já vencido em relação a AGORA
    plano: "FREE",
    statusAssinatura: "SEM_ASSINATURA",
    mpAssinaturaId: null,
    periodoAtualFim: null,
    ...overrides,
  } as Usuario;
}

describe("calcularFimTrial", () => {
  it("soma a duração do trial em dias à data de criação", () => {
    const criadoEm = new Date("2026-07-01T10:00:00Z");
    const fim = calcularFimTrial(criadoEm);
    expect(fim.getTime() - criadoEm.getTime()).toBe(DURACAO_TRIAL_DIAS * 24 * 60 * 60 * 1000);
  });
});

describe("trialAtivo", () => {
  it("true um instante antes do fim do trial", () => {
    const u = usuario({ trialEndsAt: new Date(AGORA.getTime() + 1) });
    expect(trialAtivo(u, AGORA)).toBe(true);
  });

  it("false exatamente no instante do fim do trial", () => {
    const u = usuario({ trialEndsAt: AGORA });
    expect(trialAtivo(u, AGORA)).toBe(false);
  });

  it("false depois do fim do trial", () => {
    const u = usuario({ trialEndsAt: new Date(AGORA.getTime() - 1) });
    expect(trialAtivo(u, AGORA)).toBe(false);
  });
});

describe("temAcessoCompleto", () => {
  it("Free com trial ativo tem acesso completo", () => {
    const u = usuario({ trialEndsAt: new Date(AGORA.getTime() + 1000), plano: "FREE" });
    expect(temAcessoCompleto(u, AGORA)).toBe(true);
  });

  it("Free com trial vencido não tem acesso completo", () => {
    const u = usuario({ plano: "FREE", statusAssinatura: "SEM_ASSINATURA" });
    expect(temAcessoCompleto(u, AGORA)).toBe(false);
  });

  it("PRO com assinatura ATIVA tem acesso completo mesmo com trial vencido", () => {
    const u = usuario({ plano: "PRO", statusAssinatura: "ATIVA" });
    expect(temAcessoCompleto(u, AGORA)).toBe(true);
  });

  it("PRO com assinatura PAUSADA ainda tem acesso completo", () => {
    const u = usuario({ plano: "PRO", statusAssinatura: "PAUSADA" });
    expect(temAcessoCompleto(u, AGORA)).toBe(true);
  });

  it("PRO com assinatura PENDENTE (checkout não confirmado) não tem acesso completo", () => {
    const u = usuario({ plano: "PRO", statusAssinatura: "PENDENTE" });
    expect(temAcessoCompleto(u, AGORA)).toBe(false);
  });

  it("PRO CANCELADA com período pago ainda no futuro mantém acesso", () => {
    const u = usuario({
      plano: "PRO",
      statusAssinatura: "CANCELADA",
      periodoAtualFim: new Date(AGORA.getTime() + 1000),
    });
    expect(temAcessoCompleto(u, AGORA)).toBe(true);
  });

  it("PRO CANCELADA com período pago já vencido perde acesso", () => {
    const u = usuario({
      plano: "PRO",
      statusAssinatura: "CANCELADA",
      periodoAtualFim: new Date(AGORA.getTime() - 1000),
    });
    expect(temAcessoCompleto(u, AGORA)).toBe(false);
  });

  it("PRO CANCELADA sem periodoAtualFim registrado perde acesso", () => {
    const u = usuario({ plano: "PRO", statusAssinatura: "CANCELADA", periodoAtualFim: null });
    expect(temAcessoCompleto(u, AGORA)).toBe(false);
  });
});

describe("podeUsarFeature", () => {
  const usuarioFreeTrialVencido = usuario({ plano: "FREE", statusAssinatura: "SEM_ASSINATURA" });
  const usuarioPro = usuario({ plano: "PRO", statusAssinatura: "ATIVA" });

  it("bloqueia dividas_quitacao para Free com trial vencido", () => {
    expect(podeUsarFeature(usuarioFreeTrialVencido, "dividas_quitacao", undefined, AGORA)).toBe(false);
  });

  it("bloqueia alertas_completos, relatorios_pdf e ia_recomendacao para Free com trial vencido", () => {
    expect(podeUsarFeature(usuarioFreeTrialVencido, "alertas_completos", undefined, AGORA)).toBe(false);
    expect(podeUsarFeature(usuarioFreeTrialVencido, "relatorios_pdf", undefined, AGORA)).toBe(false);
    expect(podeUsarFeature(usuarioFreeTrialVencido, "ia_recomendacao", undefined, AGORA)).toBe(false);
  });

  it("libera tudo para PRO ativo", () => {
    expect(podeUsarFeature(usuarioPro, "dividas_quitacao", undefined, AGORA)).toBe(true);
    expect(podeUsarFeature(usuarioPro, "relatorios_pdf", undefined, AGORA)).toBe(true);
  });

  it("cartao_extra: permite o 1º cartão mas bloqueia o 2º para Free com trial vencido", () => {
    expect(podeUsarFeature(usuarioFreeTrialVencido, "cartao_extra", { contagemAtual: 0 }, AGORA)).toBe(true);
    expect(podeUsarFeature(usuarioFreeTrialVencido, "cartao_extra", { contagemAtual: 1 }, AGORA)).toBe(false);
  });

  it("meta_extra: mesma regra de limite 1 do cartao_extra", () => {
    expect(podeUsarFeature(usuarioFreeTrialVencido, "meta_extra", { contagemAtual: 0 }, AGORA)).toBe(true);
    expect(podeUsarFeature(usuarioFreeTrialVencido, "meta_extra", { contagemAtual: 1 }, AGORA)).toBe(false);
  });

  it("cartao_extra sem limite para quem tem acesso completo mesmo com contagem alta", () => {
    expect(podeUsarFeature(usuarioPro, "cartao_extra", { contagemAtual: 10 }, AGORA)).toBe(true);
  });
});

describe("diasRestantesTrial", () => {
  it("arredonda para cima e nunca é negativo", () => {
    const u = usuario({ trialEndsAt: new Date(AGORA.getTime() + 25 * 60 * 60 * 1000) }); // 25h
    expect(diasRestantesTrial(u, AGORA)).toBe(2);
  });

  it("zero quando o trial já venceu", () => {
    const u = usuario({ trialEndsAt: new Date(AGORA.getTime() - 1000) });
    expect(diasRestantesTrial(u, AGORA)).toBe(0);
  });
});

describe("erroPaywall", () => {
  it("prefixa a mensagem com o marcador reconhecido pelo cliente", () => {
    const err = erroPaywall("Assine o Pro para usar isso.");
    expect(err.message).toBe(`${ERRO_PAYWALL}Assine o Pro para usar isso.`);
  });
});

describe("mensagemPaywall", () => {
  it("extrai a mensagem sem o prefixo de um erro de paywall", () => {
    const err = erroPaywall("Assine o Pro para usar isso.");
    expect(mensagemPaywall(err)).toBe("Assine o Pro para usar isso.");
  });

  it("retorna null para um Error comum (sem o prefixo)", () => {
    expect(mensagemPaywall(new Error("Preencha todos os campos."))).toBeNull();
  });

  it("retorna null para algo que não é um Error", () => {
    expect(mensagemPaywall("string qualquer")).toBeNull();
    expect(mensagemPaywall(null)).toBeNull();
  });
});
