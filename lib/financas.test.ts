import { describe, expect, it } from "vitest";
import { calcularAlocacao } from "./financas";
import type { Divida, Lancamento } from "@prisma/client";

function lancamento(overrides: Partial<Lancamento>): Lancamento {
  return {
    id: "1",
    usuarioId: "u1",
    tipo: "DESPESA",
    categoria: "OUTRAS_DESPESAS",
    descricao: "Item",
    valor: 0 as any,
    data: new Date("2026-07-01"),
    recorrente: false,
    serieRecorrenciaId: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

function divida(taxaJuros: number): Divida {
  return {
    id: "d1",
    usuarioId: "u1",
    descricao: "Dívida",
    valorOriginal: 1000 as any,
    valorTotal: 1000 as any,
    valorParcela: 100 as any,
    taxaJuros: taxaJuros as any,
    vencimento: new Date(),
    quitada: false,
    quitadaEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

describe("calcularAlocacao", () => {
  it("classifica corretamente essenciais, desejos, reserva e investimento", () => {
    const lancamentos = [
      lancamento({ categoria: "MORADIA", valor: 1000 as any }),
      lancamento({ categoria: "LAZER", valor: 300 as any }),
      lancamento({ tipo: "INVESTIMENTO", categoria: "RESERVA_EMERGENCIA", valor: 200 as any }),
      lancamento({ tipo: "INVESTIMENTO", categoria: "TESOURO_DIRETO", valor: 150 as any }),
    ];
    const alocacao = calcularAlocacao(5000, lancamentos);
    expect(alocacao.atual.essenciais).toBe(1000);
    expect(alocacao.atual.desejos).toBe(300);
    expect(alocacao.atual.reserva).toBe(200);
    expect(alocacao.atual.investimento).toBe(150);
    expect(alocacao.atual.naoAlocado).toBe(5000 - 1000 - 300 - 200 - 150);
  });

  it("calcula os valores ideais pela regra 50/30/20 (essenciais/desejos/reserva+investimento)", () => {
    const alocacao = calcularAlocacao(1000, []);
    expect(alocacao.ideal.essenciais).toBe(500);
    expect(alocacao.ideal.desejos).toBe(300);
    expect(alocacao.ideal.reserva).toBe(100);
    expect(alocacao.ideal.investimento).toBe(100);
  });

  it("sinaliza dívida cara e prioriza quitação nas dicas, suprimindo dica de investimento", () => {
    const alocacao = calcularAlocacao(1000, [], [divida(5)]);
    expect(alocacao.temDividaCara).toBe(true);
    expect(alocacao.dicas.some((d) => d.toLowerCase().includes("quitar"))).toBe(true);
    expect(alocacao.dicas.some((d) => d.toLowerCase().includes("aportar em investimentos"))).toBe(false);
  });

  it("sem dívida cara, sugere investimento quando abaixo do ideal", () => {
    const alocacao = calcularAlocacao(1000, [], [divida(0.5)]);
    expect(alocacao.temDividaCara).toBe(false);
    expect(alocacao.dicas.length).toBeGreaterThan(0);
  });

  it("não gera divisão por zero quando não há receitas", () => {
    const alocacao = calcularAlocacao(0, []);
    expect(alocacao.ideal.essenciais).toBe(0);
    expect(Number.isFinite(alocacao.atual.naoAlocado)).toBe(true);
  });
});
