import { describe, expect, it } from "vitest";
import { gerarDadosRelatorio } from "./relatorio";
import type { Lancamento, Meta } from "@prisma/client";

function lancamento(overrides: Partial<Lancamento>): Lancamento {
  return {
    id: Math.random().toString(),
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

function meta(overrides: Partial<Meta> = {}): Meta {
  return {
    id: "m1",
    usuarioId: "u1",
    tipo: "OUTRO",
    descricao: "Meta",
    valorAlvo: 1000 as any,
    valorAtual: 500 as any,
    prazo: new Date("2030-01-01"),
    criadoEm: new Date("2026-01-01"),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("gerarDadosRelatorio", () => {
  it("calcula totais de receitas, despesas e saldo", () => {
    const lancamentos = [
      lancamento({ tipo: "RECEITA", valor: 3000 as any }),
      lancamento({ tipo: "DESPESA", categoria: "MORADIA", valor: 1000 as any }),
    ];
    const dados = gerarDadosRelatorio(2026, 7, lancamentos, []);
    expect(dados.totalReceitas).toBe(3000);
    expect(dados.totalDespesas).toBe(1000);
    expect(dados.saldo).toBe(2000);
  });

  it("agrupa gastos por categoria em ordem decrescente de valor", () => {
    const lancamentos = [
      lancamento({ categoria: "MORADIA", valor: 500 as any }),
      lancamento({ categoria: "LAZER", valor: 800 as any }),
      lancamento({ categoria: "MORADIA", valor: 200 as any }),
    ];
    const dados = gerarDadosRelatorio(2026, 7, lancamentos, []);
    expect(dados.gastosPorCategoria.map((g) => g.categoria)).toEqual(["LAZER", "MORADIA"]);
    expect(dados.gastosPorCategoria[1].valor).toBe(700);
  });

  it("inclui a evolução das metas com situação calculada", () => {
    const dados = gerarDadosRelatorio(2026, 7, [], [meta()]);
    expect(dados.metas).toHaveLength(1);
    expect(dados.metas[0].situacao).toBe("em_dia");
  });

  it("lida com meses sem lançamentos nem metas", () => {
    const dados = gerarDadosRelatorio(2026, 7, [], []);
    expect(dados.gastosPorCategoria).toHaveLength(0);
    expect(dados.metas).toHaveLength(0);
    expect(dados.saldo).toBe(0);
  });
});
