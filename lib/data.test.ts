import { describe, expect, it } from "vitest";
import { avancarMeses, compararMesAno, maiorDeIdade, maisTardio, parseDataLocal } from "./data";

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

describe("avancarMeses", () => {
  it("soma meses dentro do mesmo ano", () => {
    expect(avancarMeses({ mes: 3, ano: 2026 }, 2)).toEqual({ mes: 5, ano: 2026 });
  });

  it("vira o ano ao passar de dezembro", () => {
    expect(avancarMeses({ mes: 11, ano: 2026 }, 3)).toEqual({ mes: 2, ano: 2027 });
  });

  it("soma exatamente 12 meses cai no mesmo mês do ano seguinte", () => {
    expect(avancarMeses({ mes: 7, ano: 2026 }, 12)).toEqual({ mes: 7, ano: 2027 });
  });

  it("aceita quantidade negativa (recuar meses)", () => {
    expect(avancarMeses({ mes: 2, ano: 2026 }, -3)).toEqual({ mes: 11, ano: 2025 });
  });

  it("quantidade 0 retorna o mesmo mês/ano", () => {
    expect(avancarMeses({ mes: 6, ano: 2026 }, 0)).toEqual({ mes: 6, ano: 2026 });
  });
});

describe("compararMesAno", () => {
  it("positivo quando o primeiro é depois", () => {
    expect(compararMesAno({ mes: 1, ano: 2027 }, { mes: 12, ano: 2026 })).toBeGreaterThan(0);
  });

  it("negativo quando o primeiro é antes", () => {
    expect(compararMesAno({ mes: 1, ano: 2026 }, { mes: 2, ano: 2026 })).toBeLessThan(0);
  });

  it("zero quando são iguais", () => {
    expect(compararMesAno({ mes: 5, ano: 2026 }, { mes: 5, ano: 2026 })).toBe(0);
  });
});

describe("maisTardio", () => {
  it("acha o mais tardio numa lista com meses de anos diferentes", () => {
    const pontos = [{ mes: 12, ano: 2026 }, { mes: 3, ano: 2027 }, { mes: 6, ano: 2026 }];
    expect(maisTardio(pontos)).toEqual({ mes: 3, ano: 2027 });
  });

  it("com um único ponto, retorna ele mesmo", () => {
    expect(maisTardio([{ mes: 8, ano: 2026 }])).toEqual({ mes: 8, ano: 2026 });
  });
});
