import { describe, expect, it } from "vitest";
import { calcularOrientacao, MESES_MINIMOS_RESERVA } from "./orientacao";

describe("calcularOrientacao — motor de recomendação", () => {
  it("prioriza quitar dívida cara mesmo com reserva formada e perfil definido", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: true,
      reservaAtual: 100000,
      essenciaisMensal: 1000,
      perfilInvestidor: "ARROJADO",
    });
    expect(orientacao.prioridade).toBe("QUITAR_DIVIDA");
  });

  it("sem dívida cara e sem reserva mínima, recomenda formar reserva", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: false,
      reservaAtual: 0,
      essenciaisMensal: 1000,
      perfilInvestidor: null,
    });
    expect(orientacao.prioridade).toBe("FORMAR_RESERVA");
    expect(orientacao.reservaAlvo).toBe(1000 * MESES_MINIMOS_RESERVA);
  });

  it("sem dívida cara e com reserva completa, recomenda investir", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: false,
      reservaAtual: 1000 * MESES_MINIMOS_RESERVA,
      essenciaisMensal: 1000,
      perfilInvestidor: "MODERADO",
    });
    expect(orientacao.prioridade).toBe("INVESTIR");
  });

  it("orientação de investir cita o perfil quando informado", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: false,
      reservaAtual: 5000,
      essenciaisMensal: 1000,
      perfilInvestidor: "CONSERVADOR",
    });
    expect(orientacao.explicacao.toLowerCase()).toContain("conservador");
  });

  it("orientação de investir pede o questionário quando perfil não informado", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: false,
      reservaAtual: 5000,
      essenciaisMensal: 1000,
      perfilInvestidor: null,
    });
    expect(orientacao.explicacao).toMatch(/questionário/i);
  });

  it("sem despesas essenciais registradas, reserva alvo é zero e não bloqueia investir", () => {
    const orientacao = calcularOrientacao({
      temDividaCara: false,
      reservaAtual: 0,
      essenciaisMensal: 0,
      perfilInvestidor: "MODERADO",
    });
    expect(orientacao.reservaAlvo).toBe(0);
    expect(orientacao.prioridade).toBe("INVESTIR");
  });
});
