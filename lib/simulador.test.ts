import { describe, expect, it } from "vitest";
import { calcularSimulacao, calcularAporteNecessario } from "./simulador";

describe("calcularSimulacao", () => {
  it("sem aporte e sem juros, o valor final é igual ao valor investido", () => {
    const resultado = calcularSimulacao({ valorInicial: 1000, aporteMensal: 0, meses: 0, tipoInvestimento: "TESOURO_SELIC" });
    expect(resultado.valorFinal).toBe(1000);
    expect(resultado.totalJuros).toBe(0);
  });

  it("acumula o total investido como valor inicial mais todos os aportes", () => {
    const resultado = calcularSimulacao({ valorInicial: 1000, aporteMensal: 200, meses: 12, tipoInvestimento: "CDB" });
    expect(resultado.totalInvestido).toBe(1000 + 200 * 12);
  });

  it("gera juros positivos ao longo do tempo", () => {
    const resultado = calcularSimulacao({ valorInicial: 1000, aporteMensal: 100, meses: 24, tipoInvestimento: "TESOURO_SELIC" });
    expect(resultado.totalJuros).toBeGreaterThan(0);
    expect(resultado.valorFinal).toBeGreaterThan(resultado.totalInvestido);
  });

  it("a série mensal tem um ponto por mês, incluindo o mês zero", () => {
    const resultado = calcularSimulacao({ valorInicial: 500, aporteMensal: 50, meses: 6, tipoInvestimento: "POUPANCA" });
    expect(resultado.serieMensal).toHaveLength(7);
    expect(resultado.serieMensal[0].mes).toBe(0);
    expect(resultado.serieMensal[6].mes).toBe(6);
  });
});

describe("calcularAporteNecessario", () => {
  it("não é possível calcular com prazo já vencido", () => {
    const resultado = calcularAporteNecessario({ valorAtual: 0, valorAlvo: 1000, meses: 0, tipoInvestimento: "TESOURO_SELIC" });
    expect(resultado.possivel).toBe(false);
  });

  it("aporte necessário é zero quando o valor atual já projeta alcançar a meta", () => {
    const resultado = calcularAporteNecessario({ valorAtual: 100000, valorAlvo: 1000, meses: 12, tipoInvestimento: "TESOURO_SELIC" });
    expect(resultado.possivel).toBe(true);
    if (resultado.possivel) expect(resultado.aporteMensal).toBe(0);
  });

  it("o aporte sugerido, aplicado na simulação, efetivamente alcança a meta no prazo", () => {
    const valorAtual = 1000;
    const valorAlvo = 20000;
    const meses = 36;
    const tipoInvestimento = "CDB";

    const necessario = calcularAporteNecessario({ valorAtual, valorAlvo, meses, tipoInvestimento });
    expect(necessario.possivel).toBe(true);
    if (!necessario.possivel) return;

    const projecao = calcularSimulacao({ valorInicial: valorAtual, aporteMensal: necessario.aporteMensal, meses, tipoInvestimento });
    expect(projecao.valorFinal).toBeCloseTo(valorAlvo, 2);
  });
});
