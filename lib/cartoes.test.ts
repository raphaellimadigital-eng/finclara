import { describe, expect, it } from "vitest";
import { calcularPrimeiraFatura, gerarParcelas, limiteComprometido, limiteDisponivel, valorFaturaNoMes } from "./cartoes";
import type { CompraParcelada } from "@prisma/client";

function compra(overrides: Partial<CompraParcelada> = {}): CompraParcelada {
  return {
    id: "1",
    cartaoId: "c1",
    descricao: "Compra",
    valorTotal: 300 as any,
    numParcelas: 3,
    dataCompra: new Date("2026-07-10"),
    criadoEm: new Date(),
    ...overrides,
  };
}

describe("calcularPrimeiraFatura", () => {
  it("cai no mês da compra quando antes do fechamento", () => {
    const resultado = calcularPrimeiraFatura(new Date("2026-07-10"), 15);
    expect(resultado).toEqual({ mes: 7, ano: 2026 });
  });

  it("cai no mês seguinte quando depois do fechamento", () => {
    const resultado = calcularPrimeiraFatura(new Date("2026-07-20"), 15);
    expect(resultado).toEqual({ mes: 8, ano: 2026 });
  });

  it("rola o ano quando o fechamento cai em dezembro", () => {
    const resultado = calcularPrimeiraFatura(new Date("2026-12-20"), 15);
    expect(resultado).toEqual({ mes: 1, ano: 2027 });
  });
});

describe("gerarParcelas", () => {
  it("gera o número correto de parcelas com valores iguais quando divide certinho", () => {
    const parcelas = gerarParcelas(compra({ valorTotal: 300 as any, numParcelas: 3 }), 15);
    expect(parcelas).toHaveLength(3);
    expect(parcelas.map((p) => p.valor)).toEqual([100, 100, 100]);
  });

  it("a última parcela absorve a diferença de arredondamento", () => {
    const parcelas = gerarParcelas(compra({ valorTotal: 100 as any, numParcelas: 3 }), 15);
    const soma = parcelas.reduce((s, p) => s + p.valor, 0);
    expect(soma).toBeCloseTo(100, 2);
    expect(parcelas[2].valor).toBeCloseTo(100 - parcelas[0].valor - parcelas[1].valor, 2);
  });

  it("distribui as parcelas em meses consecutivos a partir da primeira fatura", () => {
    const parcelas = gerarParcelas(compra({ dataCompra: new Date("2026-07-10"), numParcelas: 3 }), 15);
    expect(parcelas.map((p) => `${p.mes}/${p.ano}`)).toEqual(["7/2026", "8/2026", "9/2026"]);
  });
});

describe("valorFaturaNoMes", () => {
  it("soma as parcelas de várias compras que caem no mesmo mês", () => {
    const compras = [
      compra({ id: "1", valorTotal: 300 as any, numParcelas: 3, dataCompra: new Date("2026-07-10") }),
      compra({ id: "2", valorTotal: 200 as any, numParcelas: 2, dataCompra: new Date("2026-07-05") }),
    ];
    // ambas caem na fatura de julho/2026 (primeira parcela)
    expect(valorFaturaNoMes(compras, 15, 7, 2026)).toBe(100 + 100);
  });

  it("retorna 0 quando não há parcela naquele mês", () => {
    const compras = [compra({ numParcelas: 1, dataCompra: new Date("2026-07-10") })];
    expect(valorFaturaNoMes(compras, 15, 12, 2026)).toBe(0);
  });
});

describe("limiteComprometido / limiteDisponivel", () => {
  it("soma apenas parcelas atuais e futuras, ignorando parcelas já vencidas", () => {
    const compras = [compra({ valorTotal: 300 as any, numParcelas: 3, dataCompra: new Date(2026, 0, 10) })];
    // parcelas caem em jan/fev/mar de 2026 — referência em março: só a de março ainda não passou
    const comprometido = limiteComprometido(compras, 15, new Date(2026, 2, 1));
    expect(comprometido).toBe(100);
  });

  it("limiteDisponivel é o limite menos o comprometido", () => {
    const compras = [compra({ valorTotal: 300 as any, numParcelas: 3, dataCompra: new Date("2026-07-10") })];
    const disponivel = limiteDisponivel({ limite: 1000 as any, diaFechamento: 15 }, compras);
    expect(disponivel).toBe(1000 - 300);
  });
});
