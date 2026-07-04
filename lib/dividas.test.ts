import { describe, expect, it } from "vitest";
import {
  TAXA_JUROS_CARA_AO_MES,
  avancarUmMes,
  calcularPagamento,
  desfazerPagamento,
  ehDividaCara,
  ordenarPorPrioridade,
  percentualQuitado,
  recuarUmMes,
  temDividaCara,
  totalDevedor,
  totalParcelasMensais,
  ultimoMesProjetado,
} from "./dividas";
import type { Divida } from "@prisma/client";

function divida(overrides: Partial<Divida> = {}): Divida {
  return {
    id: "1",
    usuarioId: "u1",
    descricao: "Cartão",
    valorOriginal: 1000 as any,
    valorTotal: 1000 as any,
    valorParcela: 200 as any,
    taxaJuros: 1 as any,
    vencimento: new Date("2026-08-10"),
    quitada: false,
    quitadaEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("ehDividaCara", () => {
  it("considera cara acima do limiar", () => {
    expect(ehDividaCara({ taxaJuros: (TAXA_JUROS_CARA_AO_MES + 0.1) as any, jurosDesconhecidos: false, descricao: "Dívida" })).toBe(true);
  });

  it("não considera cara exatamente no limiar", () => {
    expect(ehDividaCara({ taxaJuros: TAXA_JUROS_CARA_AO_MES as any, jurosDesconhecidos: false, descricao: "Dívida" })).toBe(false);
  });

  it("não considera cara abaixo do limiar", () => {
    expect(ehDividaCara({ taxaJuros: (TAXA_JUROS_CARA_AO_MES - 0.5) as any, jurosDesconhecidos: false, descricao: "Dívida" })).toBe(false);
  });

  it("com juros desconhecidos, considera cara quando a descrição indica cartão ou cheque especial", () => {
    expect(ehDividaCara({ taxaJuros: 0 as any, jurosDesconhecidos: true, descricao: "Cartão Nubank" })).toBe(true);
    expect(ehDividaCara({ taxaJuros: 0 as any, jurosDesconhecidos: true, descricao: "Cheque especial" })).toBe(true);
  });

  it("com juros desconhecidos, não considera cara para outros tipos de dívida", () => {
    expect(ehDividaCara({ taxaJuros: 0 as any, jurosDesconhecidos: true, descricao: "Empréstimo com o primo" })).toBe(false);
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

describe("percentualQuitado", () => {
  it("calcula o percentual já pago com base no valor original", () => {
    expect(percentualQuitado({ valorOriginal: 1000 as any, valorTotal: 600 as any })).toBe(40);
  });

  it("retorna 100 quando o valor total zerou", () => {
    expect(percentualQuitado({ valorOriginal: 1000 as any, valorTotal: 0 as any })).toBe(100);
  });

  it("retorna 0 quando não há valor original registrado", () => {
    expect(percentualQuitado({ valorOriginal: 0 as any, valorTotal: 500 as any })).toBe(0);
  });
});

describe("avancarUmMes", () => {
  it("avança para o mesmo dia do mês seguinte", () => {
    const resultado = avancarUmMes(new Date(2026, 6, 10)); // 10/jul
    expect(resultado).toEqual(new Date(2026, 7, 10)); // 10/ago
  });

  it("ajusta para o último dia quando o mês seguinte for mais curto", () => {
    const resultado = avancarUmMes(new Date(2026, 0, 31)); // 31/jan
    expect(resultado).toEqual(new Date(2026, 1, 28)); // 28/fev (2026 não é bissexto)
  });

  it("vira o ano ao avançar a partir de dezembro", () => {
    const resultado = avancarUmMes(new Date(2026, 11, 15)); // 15/dez/2026
    expect(resultado).toEqual(new Date(2027, 0, 15)); // 15/jan/2027
  });
});

describe("calcularPagamento", () => {
  it("abate a parcela do saldo devedor e avança o vencimento quando ainda resta saldo", () => {
    const resultado = calcularPagamento(
      divida({ valorTotal: 1000 as any, valorParcela: 200 as any, vencimento: new Date(2026, 6, 10) })
    );
    expect(resultado.valorTotal).toBe(800);
    expect(resultado.quitada).toBe(false);
    expect(resultado.vencimento).toEqual(new Date(2026, 7, 10));
  });

  it("marca como quitada quando a parcela cobre o saldo restante", () => {
    const resultado = calcularPagamento(
      divida({ valorTotal: 150 as any, valorParcela: 200 as any, vencimento: new Date(2026, 6, 10) })
    );
    expect(resultado.valorTotal).toBe(0);
    expect(resultado.quitada).toBe(true);
  });

  it("marca como quitada quando a parcela zera o saldo exatamente", () => {
    const resultado = calcularPagamento(
      divida({ valorTotal: 200 as any, valorParcela: 200 as any, vencimento: new Date(2026, 6, 10) })
    );
    expect(resultado.valorTotal).toBe(0);
    expect(resultado.quitada).toBe(true);
  });
});

describe("recuarUmMes", () => {
  it("recua para o mesmo dia do mês anterior", () => {
    const resultado = recuarUmMes(new Date(2026, 7, 10)); // 10/ago
    expect(resultado).toEqual(new Date(2026, 6, 10)); // 10/jul
  });

  it("ajusta para o último dia quando o mês anterior for mais curto", () => {
    const resultado = recuarUmMes(new Date(2026, 2, 30)); // 30/mar
    expect(resultado).toEqual(new Date(2026, 1, 28)); // 28/fev
  });

  it("vira o ano ao recuar a partir de janeiro", () => {
    const resultado = recuarUmMes(new Date(2027, 0, 15)); // 15/jan/2027
    expect(resultado).toEqual(new Date(2026, 11, 15)); // 15/dez/2026
  });
});

describe("desfazerPagamento", () => {
  it("devolve a parcela ao saldo devedor e recua o vencimento", () => {
    const resultado = desfazerPagamento(
      divida({
        valorOriginal: 1000 as any,
        valorTotal: 800 as any,
        valorParcela: 200 as any,
        vencimento: new Date(2026, 7, 10),
        quitada: false,
      })
    );
    expect(resultado.valorTotal).toBe(1000);
    expect(resultado.vencimento).toEqual(new Date(2026, 6, 10));
    expect(resultado.quitada).toBe(false);
  });

  it("nunca devolve mais do que o valor original", () => {
    const resultado = desfazerPagamento(
      divida({
        valorOriginal: 1000 as any,
        valorTotal: 950 as any,
        valorParcela: 200 as any,
        vencimento: new Date(2026, 7, 10),
        quitada: false,
      })
    );
    expect(resultado.valorTotal).toBe(1000);
  });

  it("reabre uma dívida quitada sem recuar o vencimento (ele não avançou na quitação)", () => {
    const resultado = desfazerPagamento(
      divida({
        valorOriginal: 1000 as any,
        valorTotal: 0 as any,
        valorParcela: 200 as any,
        vencimento: new Date(2026, 7, 10),
        quitada: true,
      })
    );
    expect(resultado.valorTotal).toBe(200);
    expect(resultado.vencimento).toEqual(new Date(2026, 7, 10));
    expect(resultado.quitada).toBe(false);
  });
});

describe("ultimoMesProjetado", () => {
  it("com o saldo cabendo em 1 parcela, o último mês é o do próprio vencimento", () => {
    const d = divida({
      valorTotal: 200 as any,
      valorParcela: 200 as any,
      vencimento: new Date(2026, 7, 10), // agosto/2026 (mês 7 = agosto, 0-indexado)
    });
    expect(ultimoMesProjetado(d)).toEqual({ mes: 8, ano: 2026 });
  });

  it("projeta várias parcelas à frente (30 parcelas de uma dívida grande)", () => {
    const d = divida({
      valorTotal: 30000 as any,
      valorParcela: 1000 as any, // 30 parcelas
      vencimento: new Date(2026, 0, 10), // janeiro/2026
    });
    // 30 parcelas a partir de janeiro/2026 (inclusive) termina em junho/2028
    expect(ultimoMesProjetado(d)).toEqual({ mes: 6, ano: 2028 });
  });

  it("arredonda pra cima quando a última parcela é menor (resto da divisão)", () => {
    const d = divida({
      valorTotal: 250 as any,
      valorParcela: 100 as any, // 2 parcelas cheias + 1 parcela menor = 3 meses
      vencimento: new Date(2026, 5, 10), // junho/2026
    });
    expect(ultimoMesProjetado(d)).toEqual({ mes: 8, ano: 2026 });
  });
});
