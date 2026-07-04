import { describe, expect, it } from "vitest";
import { parseValorBR, formatarValorParaCampo, valorMonetarioValido } from "./valores";

describe("parseValorBR", () => {
  it("entende vírgula como separador decimal", () => {
    expect(parseValorBR("1234,56")).toBe(1234.56);
    expect(parseValorBR("0,5")).toBe(0.5);
  });

  it("entende ponto de milhar com vírgula decimal", () => {
    expect(parseValorBR("1.234,56")).toBe(1234.56);
    expect(parseValorBR("1.234.567,89")).toBe(1234567.89);
  });

  it("entende ponto de milhar sem parte decimal", () => {
    expect(parseValorBR("1.234")).toBe(1234);
    expect(parseValorBR("1.234.567")).toBe(1234567);
  });

  it("tolera ponto como separador decimal (teclado numérico)", () => {
    expect(parseValorBR("1234.56")).toBe(1234.56);
    expect(parseValorBR("10.5")).toBe(10.5);
  });

  it("entende número inteiro simples", () => {
    expect(parseValorBR("100")).toBe(100);
  });

  it("retorna NaN para texto vazio ou inválido", () => {
    expect(parseValorBR("")).toBeNaN();
    expect(parseValorBR("abc")).toBeNaN();
  });
});

describe("formatarValorParaCampo", () => {
  it("formata com vírgula e duas casas", () => {
    expect(formatarValorParaCampo(1234.5)).toBe("1234,50");
    expect(formatarValorParaCampo(10)).toBe("10,00");
  });
});

describe("valorMonetarioValido", () => {
  it("aceita valores positivos dentro do teto", () => {
    expect(valorMonetarioValido(100)).toBe(true);
  });

  it("rejeita zero, negativo, NaN e acima do teto", () => {
    expect(valorMonetarioValido(0)).toBe(false);
    expect(valorMonetarioValido(-1)).toBe(false);
    expect(valorMonetarioValido(NaN)).toBe(false);
    expect(valorMonetarioValido(1_000_001)).toBe(false);
  });
});
