import { describe, expect, it } from "vitest";
import { cpfValido, formatarCpf } from "./cpf";

describe("formatarCpf", () => {
  it("aplica a máscara 000.000.000-00 num CPF completo", () => {
    expect(formatarCpf("11144477735")).toBe("111.444.777-35");
  });

  it("ignora caracteres não numéricos na entrada", () => {
    expect(formatarCpf("111.444.777-35")).toBe("111.444.777-35");
  });

  it("corta em 11 dígitos, ignorando o excedente", () => {
    expect(formatarCpf("111444777359999")).toBe("111.444.777-35");
  });

  it("formata parcialmente durante a digitação", () => {
    expect(formatarCpf("111444")).toBe("111.444");
  });
});

describe("cpfValido", () => {
  it("aceita um CPF com dígitos verificadores corretos", () => {
    expect(cpfValido("111.444.777-35")).toBe(true);
    expect(cpfValido("11144477735")).toBe(true);
  });

  it("rejeita quando o primeiro dígito verificador está errado", () => {
    expect(cpfValido("11144477745")).toBe(false);
  });

  it("rejeita quando o segundo dígito verificador está errado", () => {
    expect(cpfValido("11144477736")).toBe(false);
  });

  it("rejeita sequências de dígito repetido, mesmo que a conta feche", () => {
    expect(cpfValido("00000000000")).toBe(false);
    expect(cpfValido("11111111111")).toBe(false);
  });

  it("rejeita tamanho diferente de 11 dígitos", () => {
    expect(cpfValido("123456789")).toBe(false);
    expect(cpfValido("111444777350")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(cpfValido("")).toBe(false);
  });
});
