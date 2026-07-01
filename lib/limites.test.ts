import { describe, expect, it } from "vitest";
import { calcularProgressoLimites, categoriasEstouradas } from "./limites";
import type { Lancamento, LimiteCategoria } from "@prisma/client";

function lancamento(categoria: string, valor: number): Lancamento {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    tipo: "DESPESA",
    categoria: categoria as any,
    descricao: "Item",
    valor: valor as any,
    data: new Date(),
    recorrente: false,
    serieRecorrenciaId: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

function limite(categoria: string, valorLimite: number): LimiteCategoria {
  return {
    id: categoria,
    usuarioId: "u1",
    categoria: categoria as any,
    valorLimite: valorLimite as any,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

describe("calcularProgressoLimites", () => {
  it("classifica como 'ok' abaixo de 80%", () => {
    const [p] = calcularProgressoLimites([lancamento("LAZER", 50)], [limite("LAZER", 100)]);
    expect(p.situacao).toBe("ok");
    expect(p.percentual).toBe(50);
  });

  it("classifica como 'aviso' entre 80% e 100%", () => {
    const [p] = calcularProgressoLimites([lancamento("LAZER", 85)], [limite("LAZER", 100)]);
    expect(p.situacao).toBe("aviso");
  });

  it("classifica como 'estouro' a partir de 100%", () => {
    const [p] = calcularProgressoLimites([lancamento("LAZER", 120)], [limite("LAZER", 100)]);
    expect(p.situacao).toBe("estouro");
  });

  it("ignora lançamentos de receita/investimento e de outras categorias", () => {
    const lancamentos = [
      lancamento("LAZER", 50),
      { ...lancamento("LAZER", 999), tipo: "RECEITA" as any },
      lancamento("MORADIA", 500),
    ];
    const [p] = calcularProgressoLimites(lancamentos, [limite("LAZER", 100)]);
    expect(p.gastoAtual).toBe(50);
  });
});

describe("categoriasEstouradas", () => {
  it("retorna só as categorias com situação de estouro", () => {
    const progresso = calcularProgressoLimites(
      [lancamento("LAZER", 150), lancamento("MORADIA", 10)],
      [limite("LAZER", 100), limite("MORADIA", 1000)]
    );
    const estouradas = categoriasEstouradas(progresso);
    expect(estouradas.has("LAZER")).toBe(true);
    expect(estouradas.has("MORADIA")).toBe(false);
  });
});
