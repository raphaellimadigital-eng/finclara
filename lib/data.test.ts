import { describe, expect, it } from "vitest";
import { parseDataLocal } from "./data";

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
