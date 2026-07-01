import { describe, expect, it } from "vitest";
import { sugerirCategoria } from "./categorizacao";

describe("sugerirCategoria", () => {
  it("sugere categoria a partir de palavra-chave de despesa", () => {
    expect(sugerirCategoria("Mercado do bairro")).toBe("ALIMENTACAO");
    expect(sugerirCategoria("Uber para o trabalho")).toBe("TRANSPORTE");
    expect(sugerirCategoria("Netflix mensal")).toBe("ASSINATURAS");
  });

  it("é case-insensitive", () => {
    expect(sugerirCategoria("SALARIO DE JULHO")).toBe("SALARIO");
  });

  it("retorna null quando nenhuma regra bate", () => {
    expect(sugerirCategoria("xyz123")).toBeNull();
  });

  it("retorna null para descrição vazia", () => {
    expect(sugerirCategoria("   ")).toBeNull();
  });
});
