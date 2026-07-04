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

  it("adapta a faixa para 60/25/15 quando essenciais ficam entre 50% e 65% da renda", () => {
    const lancamentos = [lancamento({ categoria: "MORADIA", valor: 600 as any })];
    const alocacao = calcularAlocacao(1000, lancamentos);
    expect(alocacao.ideal.essenciais).toBe(600);
    expect(alocacao.ideal.desejos).toBe(250);
    expect(alocacao.ideal.reserva + alocacao.ideal.investimento).toBe(150);
  });

  it("adapta a faixa para 70/20/10 quando essenciais ficam entre 65% e 80% da renda", () => {
    const lancamentos = [lancamento({ categoria: "MORADIA", valor: 700 as any })];
    const alocacao = calcularAlocacao(1000, lancamentos);
    expect(alocacao.ideal.essenciais).toBe(700);
    expect(alocacao.ideal.desejos).toBe(200);
  });

  it("adapta a faixa para 80/15/5 quando essenciais passam de 80% da renda", () => {
    const lancamentos = [lancamento({ categoria: "MORADIA", valor: 900 as any })];
    const alocacao = calcularAlocacao(1000, lancamentos);
    expect(alocacao.ideal.essenciais).toBe(800);
    expect(alocacao.ideal.desejos).toBe(150);
    expect(alocacao.dicas.some((d) => d.toLowerCase().includes("caber no mês"))).toBe(true);
  });

  it("sugere elevar a fatia de investimento quando a sobra sem destino passa de 30% da renda", () => {
    const alocacao = calcularAlocacao(1000, []);
    expect(alocacao.dicas.some((d) => d.toLowerCase().includes("sobra é grande"))).toBe(true);
  });

  it("soma a parcela do mês de compras parceladas por categoria no comparativo de alocação", () => {
    const alocacao = calcularAlocacao(1000, [], [], { MORADIA: 200 });
    expect(alocacao.atual.essenciais).toBe(200);
    expect(alocacao.ideal.essenciais).toBe(500);
  });
});
