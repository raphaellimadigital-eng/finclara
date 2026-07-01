import { describe, expect, it } from "vitest";
import { TAXA_JUROS_CARA_AO_MES, ehDividaCara, ordenarPorPrioridade, temDividaCara, totalDevedor, totalParcelasMensais } from "./dividas";
import type { Divida } from "@prisma/client";

function divida(overrides: Partial<Divida> = {}): Divida {
  return {
    id: "1",
    usuarioId: "u1",
    descricao: "Cartão",
    valorTotal: 1000 as any,
    valorParcela: 200 as any,
    taxaJuros: 1 as any,
    vencimento: new Date("2026-08-10"),
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("ehDividaCara", () => {
  it("considera cara acima do limiar", () => {
    expect(ehDividaCara({ taxaJuros: (TAXA_JUROS_CARA_AO_MES + 0.1) as any })).toBe(true);
  });

  it("não considera cara exatamente no limiar", () => {
    expect(ehDividaCara({ taxaJuros: TAXA_JUROS_CARA_AO_MES as any })).toBe(false);
  });

  it("não considera cara abaixo do limiar", () => {
    expect(ehDividaCara({ taxaJuros: (TAXA_JUROS_CARA_AO_MES - 0.5) as any })).toBe(false);
  });
});

describe("temDividaCara", () => {
  it("retorna false para lista vazia", () => {
    expect(temDividaCara([])).toBe(false);
  });

  it("retorna true se ao menos uma dívida for cara", () => {
    const dividas = [divida({ taxaJuros: 0.5 as any }), divida({ id: "2", taxaJuros: 5 as any })];
    expect(temDividaCara(dividas)).toBe(true);
  });

  it("retorna false se nenhuma dívida for cara", () => {
    const dividas = [divida({ taxaJuros: 0.5 as any }), divida({ id: "2", taxaJuros: 1 as any })];
    expect(temDividaCara(dividas)).toBe(false);
  });
});

describe("ordenarPorPrioridade", () => {
  it("ordena da maior para a menor taxa de juros", () => {
    const dividas = [
      divida({ id: "baixa", taxaJuros: 0.5 as any }),
      divida({ id: "alta", taxaJuros: 8 as any }),
      divida({ id: "media", taxaJuros: 3 as any }),
    ];
    const ordenado = ordenarPorPrioridade(dividas).map((d) => d.id);
    expect(ordenado).toEqual(["alta", "media", "baixa"]);
  });

  it("não modifica o array original", () => {
    const dividas = [divida({ id: "a", taxaJuros: 1 as any }), divida({ id: "b", taxaJuros: 5 as any })];
    const original = [...dividas];
    ordenarPorPrioridade(dividas);
    expect(dividas).toEqual(original);
  });
});

describe("totalDevedor", () => {
  it("soma o valor total de todas as dívidas", () => {
    const dividas = [divida({ valorTotal: 1000 as any }), divida({ id: "2", valorTotal: 500 as any })];
    expect(totalDevedor(dividas)).toBe(1500);
  });

  it("retorna 0 para lista vazia", () => {
    expect(totalDevedor([])).toBe(0);
  });
});

describe("totalParcelasMensais", () => {
  it("soma o valor das parcelas mensais de todas as dívidas", () => {
    const dividas = [divida({ valorParcela: 200 as any }), divida({ id: "2", valorParcela: 150 as any })];
    expect(totalParcelasMensais(dividas)).toBe(350);
  });
});
