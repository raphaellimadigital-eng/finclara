import { describe, expect, it } from "vitest";
import { maiorDeIdade, parseDataLocal } from "./data";

describe("parseDataLocal", () => {
  it("interpreta o valor de um <input type=date> como data local, não UTC", () => {
    const data = parseDataLocal("2026-01-15");
    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(0);
    expect(data.getDate()).toBe(15);
  });

  it("não sofre deslocamento de mês no primeiro dia do mês (caso que quebra com new Date(string))", () => {
    const data = parseDataLocal("2026-01-01");
    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(0);
    expect(data.getDate()).toBe(1);
  });

  it("lida corretamente com o último dia do ano", () => {
    const data = parseDataLocal("2025-12-31");
    expect(data.getFullYear()).toBe(2025);
    expect(data.getMonth()).toBe(11);
    expect(data.getDate()).toBe(31);
  });
});

describe("maiorDeIdade", () => {
  const agora = new Date("2026-07-03T12:00:00");

  it("true para quem já fez 18 anos", () => {
    expect(maiorDeIdade(new Date(2008, 6, 2), 18, agora)).toBe(true); // fez 18 ontem
  });

  it("true no dia exato do 18º aniversário", () => {
    expect(maiorDeIdade(new Date(2008, 6, 3), 18, agora)).toBe(true);
  });

  it("false para quem ainda não fez 18 anos (aniversário é amanhã)", () => {
    expect(maiorDeIdade(new Date(2008, 6, 4), 18, agora)).toBe(false);
  });

  it("false para quem nasceu há menos de 18 anos", () => {
    expect(maiorDeIdade(new Date(2015, 0, 1), 18, agora)).toBe(false);
  });

  it("respeita uma idade mínima diferente de 18", () => {
    expect(maiorDeIdade(new Date(2010, 6, 2), 16, agora)).toBe(true);
    expect(maiorDeIdade(new Date(2012, 6, 2), 16, agora)).toBe(false);
  });
});
