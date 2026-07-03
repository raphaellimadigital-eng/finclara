"use client";

import { Children, useLayoutEffect, useRef, useState } from "react";
import { calcularColunas, distribuirPorAltura, type LayoutMosaico } from "@/lib/mosaico";

// Distribui os cards filhos num layout em mosaico (masonry) — ver lib/mosaico.ts pro algoritmo.
// Os cards nunca trocam de elemento-pai entre re-renders (ficam sempre como irmãos diretos,
// só a posição position:absolute muda), pra não perder estado de formulário (ex: senha já
// digitada) quando a tela é redimensionada e a coluna do card muda.
export function GridMosaico({ children }: { children: React.ReactNode }) {
  const itens = Children.toArray(children);
  const containerRef = useRef<HTMLDivElement>(null);
  const refsItens = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState<LayoutMosaico | null>(null);

  useLayoutEffect(() => {
    // Guarda a última altura medida de cada card fora do estado — só chama setLayout quando algo
    // realmente mudou, pra (a) não re-renderizar à toa e (b) evitar loop: o próprio recalcular()
    // escreve a largura de cada card via style, o que dispara o ResizeObserver de novo.
    let ultimasAlturas: number[] | null = null;

    function alturasIguais(a: number[], b: number[] | null) {
      if (!b || a.length !== b.length) return false;
      return a.every((v, i) => Math.round(v) === Math.round(b[i]));
    }

    function recalcular() {
      const larguraContainer = containerRef.current?.offsetWidth ?? 0;
      const colunas = calcularColunas(larguraContainer);
      if (!colunas) {
        ultimasAlturas = null;
        setLayout(null);
        return;
      }

      // Aplica a largura final ANTES de medir a altura — senão a altura medida reflete a
      // largura cheia do container (texto quebra menos), não a largura real da coluna.
      refsItens.current.forEach((el) => {
        if (el) el.style.width = `${colunas.larguraColuna}px`;
      });

      const alturas = refsItens.current.map((el) => el?.offsetHeight ?? 0);
      if (alturasIguais(alturas, ultimasAlturas)) return;

      ultimasAlturas = alturas;
      setLayout(distribuirPorAltura(alturas, colunas));
    }

    recalcular();

    // Observa o container (largura muda ao redimensionar a janela) E cada card individualmente
    // — um card pode crescer DEPOIS da primeira medição sem o container mudar de tamanho (ex:
    // ConfiguracaoDoisFatores busca se o 2FA já está ativo de forma assíncrona; começa mostrando
    // "Carregando..." curto e só fica com a altura final quando a busca termina). Sem isso, o
    // próximo card na mesma coluna ficaria sobreposto.
    const observer = new ResizeObserver(() => recalcular());
    if (containerRef.current) observer.observe(containerRef.current);
    refsItens.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens.length]);

  return (
    <div ref={containerRef} style={layout ? { position: "relative", height: layout.alturaContainer } : undefined}>
      {itens.map((item, i) => (
        <div
          key={(item as { key?: string | number | null }).key ?? i}
          ref={(el) => {
            refsItens.current[i] = el;
          }}
          style={
            layout
              ? { position: "absolute", top: layout.posicoes[i].top, left: layout.posicoes[i].left, width: layout.posicoes[i].largura }
              : undefined
          }
        >
          {item}
        </div>
      ))}
    </div>
  );
}
