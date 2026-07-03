// Lógica pura do layout em mosaico (masonry) usado por components/GridMosaico.tsx: distribui
// cards em colunas balanceadas pela altura real de cada um (algoritmo guloso — cada card vai
// pra coluna mais baixa no momento), diferente de CSS Grid (linha herda a altura do maior item
// da linha) ou CSS multi-column (balanceia por estimativa, ruim com poucos itens de altura muito
// diferente) — nenhum dos dois evita vão vazio de verdade.

export const LARGURA_MINIMA_COLUNA = 380;
export const GAP_MOSAICO = 16;
export const BREAKPOINT_DESKTOP_MOSAICO = 900;

export type ColunasMosaico = { numColunas: number; larguraColuna: number };

export type PosicaoMosaico = { top: number; left: number; largura: number };

export type LayoutMosaico = { posicoes: PosicaoMosaico[]; alturaContainer: number };

// Quantas colunas cabem numa dada largura de container, e a largura de cada uma. Retorna null
// abaixo do breakpoint de desktop ou quando só cabe 1 coluna — nesses casos o chamador deve usar
// o empilhamento normal (sem position:absolute nenhuma).
export function calcularColunas(larguraContainer: number): ColunasMosaico | null {
  if (larguraContainer < BREAKPOINT_DESKTOP_MOSAICO) return null;

  const numColunas = Math.max(1, Math.floor((larguraContainer + GAP_MOSAICO) / (LARGURA_MINIMA_COLUNA + GAP_MOSAICO)));
  if (numColunas <= 1) return null;

  const larguraColuna = (larguraContainer - GAP_MOSAICO * (numColunas - 1)) / numColunas;
  return { numColunas, larguraColuna };
}

// Distribui uma lista de alturas (uma por card, na ordem original) entre as colunas, sempre
// escolhendo a coluna mais baixa no momento. `alturas[i]` deve corresponder à altura do card já
// renderizado na largura de coluna final (não a largura cheia do container), senão o resultado
// não reflete a altura real do card no layout final.
export function distribuirPorAltura(alturas: number[], colunas: ColunasMosaico): LayoutMosaico {
  const { numColunas, larguraColuna } = colunas;
  const alturasColunas = new Array(numColunas).fill(0);

  const posicoes = alturas.map((altura) => {
    const colunaMaisBaixa = alturasColunas.indexOf(Math.min(...alturasColunas));
    const posicao: PosicaoMosaico = {
      top: alturasColunas[colunaMaisBaixa],
      left: colunaMaisBaixa * (larguraColuna + GAP_MOSAICO),
      largura: larguraColuna,
    };
    alturasColunas[colunaMaisBaixa] += altura + GAP_MOSAICO;
    return posicao;
  });

  return { posicoes, alturaContainer: Math.max(...alturasColunas) - GAP_MOSAICO };
}
