import { describe, expect, it } from "vitest";
import {
  DESCRICAO_MAX,
  NOME_CARTAO_MAX,
  NOME_MAX,
  NOME_MIN,
  schemaDescricao,
  schemaEndereco,
  schemaNomeCartao,
  schemaNomeUsuario,
  schemaTelefone,
  validar,
} from "./textos";

describe("schemaDescricao / schemaNomeUsuario / schemaNomeCartao", () => {
  it("aceita texto dentro do tamanho permitido", () => {
    expect(validar(schemaDescricao, "Mercado")).toBe("Mercado");
    expect(validar(schemaNomeUsuario, "Ana")).toBe("Ana");
    expect(validar(schemaNomeCartao, "Nubank")).toBe("Nubank");
  });

  it("remove espaços nas pontas (trim)", () => {
    expect(validar(schemaDescricao, "  Mercado  ")).toBe("Mercado");
  });

  it("rejeita string vazia ou só com espaços", () => {
    expect(() => validar(schemaDescricao, "")).toThrow(/entre 2 e/);
    expect(() => validar(schemaDescricao, "   ")).toThrow(/entre 2 e/);
  });

  it("rejeita texto com só 1 caractere (abaixo do mínimo)", () => {
    expect(() => validar(schemaDescricao, "a")).toThrow(/entre 2 e 100/);
    expect(() => validar(schemaNomeUsuario, "a")).toThrow(new RegExp(`entre 2 e ${NOME_MAX}`));
  });

  it("aceita exatamente o mínimo de caracteres", () => {
    expect(validar(schemaDescricao, "ab")).toBe("ab");
    expect(validar(schemaNomeUsuario, "Jô")).toBe("Jô");
  });

  it("rejeita texto acima do máximo permitido", () => {
    expect(() => validar(schemaDescricao, "a".repeat(DESCRICAO_MAX + 1))).toThrow();
    expect(() => validar(schemaNomeCartao, "a".repeat(NOME_CARTAO_MAX + 1))).toThrow();
  });

  it("aceita números misturados com letras (ex: nome de meta com ano)", () => {
    expect(validar(schemaDescricao, "Viagem 2027")).toBe("Viagem 2027");
  });
});

describe("schemaTelefone", () => {
  it("aceita dígitos e símbolos comuns de telefone", () => {
    expect(validar(schemaTelefone, "(11) 91234-5678")).toBe("(11) 91234-5678");
  });

  it("rejeita letras", () => {
    expect(() => validar(schemaTelefone, "abc123")).toThrow(/apenas números/);
  });

  it("rejeita texto acima do máximo", () => {
    expect(() => validar(schemaTelefone, "1".repeat(30))).toThrow();
  });
});

describe("schemaEndereco", () => {
  it("aceita endereço dentro do limite", () => {
    expect(validar(schemaEndereco, "Rua Exemplo, 123")).toBe("Rua Exemplo, 123");
  });

  it("rejeita acima do máximo", () => {
    expect(() => validar(schemaEndereco, "a".repeat(300))).toThrow();
  });
});

describe("NOME_MIN", () => {
  it("é 2, o mínimo combinado com o usuário", () => {
    expect(NOME_MIN).toBe(2);
  });
});
