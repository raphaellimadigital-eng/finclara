"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

// Ícone de informação que abre um pequeno texto explicativo ao clicar (funciona em mobile,
// diferente de um tooltip só de hover). Fecha ao clicar fora ou apertar Esc, mesmo padrão do
// menu do usuário e do botão de pergunta flutuante.
export function InfoTooltip({ texto }: { texto: string | string[] }) {
  const paragrafos = Array.isArray(texto) ? texto : [texto];
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={(e) => {
          // Alguns cards são inteiros um <Link>; sem isso, clicar aqui navegaria de página.
          e.preventDefault();
          e.stopPropagation();
          setAberto((v) => !v);
        }}
        aria-label="Mais informações sobre este card"
        aria-expanded={aberto}
        style={{
          width: 18,
          height: 18,
          minHeight: 0,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          color: "var(--texto-secundario)",
          cursor: "pointer",
        }}
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {aberto && (
        <div
          role="tooltip"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            position: "absolute",
            top: "130%",
            right: 0,
            zIndex: 20,
            width: 240,
            maxWidth: "80vw",
            background: "var(--card-bg)",
            border: "1px solid var(--borda)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--texto-secundario)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          {paragrafos.map((paragrafo, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
              {paragrafo}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
