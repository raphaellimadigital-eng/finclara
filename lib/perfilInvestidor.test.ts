import { describe, expect, it } from "vitest";
import { calcularPerfil } from "./perfilInvestidor";

describe("calcularPerfil", () => {
  it("classifica como conservador com soma baixa", () => {
    expect(calcularPerfil([1, 1, 1])).toBe("CONSERVADOR");
  });

  it("classifica como moderado com soma intermediária", () => {
    expect(calcularPerfil([2, 2, 2])).toBe("MODERADO");
  });

  it("classifica como arrojado com soma alta", () => {
    expect(calcularPerfil([3, 3, 3])).toBe("ARROJADO");
  });

  it("respeita os limiares exatos (4 e 7)", () => {
    expect(calcularPerfil([1, 1, 2])).toBe("CONSERVADOR"); // soma 4
    expect(calcularPerfil([1, 1, 3])).toBe("MODERADO"); // soma 5
    expect(calcularPerfil([3, 3, 1])).toBe("MODERADO"); // soma 7
    expect(calcularPerfil([3, 3, 2])).toBe("ARROJADO"); // soma 8
  });
});
