import { describe, expect, it } from "vitest";
import {
  BREAKPOINT_DESKTOP_MOSAICO,
  GAP_MOSAICO,
  LARGURA_MINIMA_COLUNA,
  calcularColunas,
  distribuirPorAltura,
} from "./mosaico";

describe("calcularColunas", () => {
  it("retorna null abaixo do breakpoint de desktop", () => {
    expect(calcularColunas(BREAKPOINT_DESKTOP_MOSAICO - 1)).toBeNull();
  });

  it("calcula 2 colunas numa largura de container-largo (980px)", () => {
    const resultado = calcularColunas(980);
    expect(resultado).not.toBeNull();
    expect(resultado!.numColunas).toBe(2);
  });

  it("largura de cada coluna soma de volta à largura do container, descontado o gap", () => {
    const resultado = calcularColunas(980)!;
    const totalUsado = resultado.larguraColuna * resultado.numColunas + GAP_MOSAICO * (resultado.numColunas - 1);
    expect(totalUsado).toBeCloseTo(980, 5);
  });

  it("aumenta o número de colunas em telas bem largas", () => {
    const larguraGrande = LARGURA_MINIMA_COLUNA * 3 + GAP_MOSAICO * 2 + 100;
    const resultado = calcularColunas(larguraGrande);
    expect(resultado!.numColunas).toBeGreaterThanOrEqual(3);
  });
});

describe("distribuirPorAltura", () => {
  const colunas2 = { numColunas: 2, larguraColuna: 480 };

  it("distribui itens de altura igual alternando entre colunas", () => {
    const layout = distribuirPorAltura([100, 100, 100, 100], colunas2);
    expect(layout.posicoes[0].left).toBe(0);
    expect(layout.posicoes[1].left).toBeGreaterThan(0);
  });

  it("sempre coloca o próximo item na coluna mais baixa no momento (evita vão vazio)", () => {
    // Um item bem alto na coluna 0, depois vários itens curtos — todos os curtos devem ir pra
    // coluna 1 (mais baixa), não alternar cegamente, senão sobra vão vazio do lado do item alto.
    const layout = distribuirPorAltura([500, 50, 50, 50, 50], colunas2);
    const colunaDoItemAlto = layout.posicoes[0].left;
    const outraColuna = colunaDoItemAlto === 0 ? colunas2.larguraColuna + GAP_MOSAICO : 0;
    for (let i = 1; i < 5; i++) {
      expect(layout.posicoes[i].left).toBe(outraColuna);
    }
  });

  it("a altura final do container é a da coluna mais alta, sem o gap sobrando no final", () => {
    const layout = distribuirPorAltura([100, 100], colunas2);
    // 1 item por coluna (100 cada) — a coluna mais alta tem só 100 (sem +GAP no fim, pois só há
    // um item nela).
    expect(layout.alturaContainer).toBe(100);
  });

  it("cada posição usa a largura de coluna informada", () => {
    const layout = distribuirPorAltura([10, 10, 10], colunas2);
    for (const posicao of layout.posicoes) {
      expect(posicao.largura).toBe(480);
    }
  });

  it("com 1 coluna, todos os itens se empilham na mesma coluna (top acumulado)", () => {
    const colunas1 = { numColunas: 1, larguraColuna: 900 };
    const layout = distribuirPorAltura([100, 200, 50], colunas1);
    expect(layout.posicoes.map((p) => p.top)).toEqual([0, 100 + GAP_MOSAICO, 100 + GAP_MOSAICO + 200 + GAP_MOSAICO]);
  });
});
