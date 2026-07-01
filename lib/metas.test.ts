import { describe, expect, it } from "vitest";
import { calcularProjecao, estrategiaSugerida, ordenarPorPrazo } from "./metas";
import type { Meta } from "@prisma/client";

function meta(overrides: Partial<Meta> = {}): Meta {
  return {
    id: "1",
    usuarioId: "u1",
    tipo: "OUTRO",
    descricao: "Meta",
    valorAlvo: 1000 as any,
    valorAtual: 0 as any,
    prazo: new Date("2027-01-01"),
    criadoEm: new Date("2026-01-01"),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("calcularProjecao", () => {
  it("marca como concluída quando o valor atual atinge o alvo", () => {
    const projecao = calcularProjecao(meta({ valorAtual: 1000 as any, valorAlvo: 1000 as any }));
    expect(projecao.concluida).toBe(true);
    expect(projecao.percentual).toBe(100);
    expect(projecao.atrasada).toBe(false);
  });

  it("sem aportes e prazo no futuro não está atrasada", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    const projecao = calcularProjecao(meta({ valorAtual: 0 as any, prazo: futuro }));
    expect(projecao.atrasada).toBe(false);
    expect(projecao.dataProjetada).toBeNull();
  });

  it("sem aportes e prazo já vencido está atrasada", () => {
    const passado = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    const projecao = calcularProjecao(meta({ valorAtual: 0 as any, prazo: passado }));
    expect(projecao.atrasada).toBe(true);
  });

  it("projeta atraso quando o ritmo atual não chega ao alvo antes do prazo", () => {
    const criadoEm = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // 30 dias atrás
    const prazoProximo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 dias no futuro
    // ritmo de 10/dia por 30 dias = 300 acumulados; faltam 700 para o alvo de 1000 em só 5 dias
    const projecao = calcularProjecao(meta({ valorAtual: 300 as any, valorAlvo: 1000 as any, criadoEm, prazo: prazoProximo }));
    expect(projecao.atrasada).toBe(true);
    expect(projecao.dataProjetada).not.toBeNull();
  });

  it("percentual nunca passa de 100", () => {
    const projecao = calcularProjecao(meta({ valorAtual: 5000 as any, valorAlvo: 1000 as any }));
    expect(projecao.percentual).toBe(100);
  });
});

describe("estrategiaSugerida", () => {
  it("sugere conservadora para prazo curto (até 12 meses)", () => {
    const prazo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6);
    expect(estrategiaSugerida(prazo)).toMatch(/curto/i);
  });

  it("sugere equilibrada para prazo médio", () => {
    const prazo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 30);
    expect(estrategiaSugerida(prazo)).toMatch(/médio/i);
  });

  it("sugere diversificada para prazo longo", () => {
    const prazo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 100);
    expect(estrategiaSugerida(prazo)).toMatch(/longo/i);
  });
});

describe("ordenarPorPrazo", () => {
  it("ordena pelo prazo mais próximo primeiro", () => {
    const metas = [
      meta({ id: "distante", prazo: new Date("2030-01-01") }),
      meta({ id: "proxima", prazo: new Date("2026-08-01") }),
      meta({ id: "media", prazo: new Date("2027-01-01") }),
    ];
    expect(ordenarPorPrazo(metas).map((m) => m.id)).toEqual(["proxima", "media", "distante"]);
  });
});
