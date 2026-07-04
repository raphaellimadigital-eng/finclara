"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Folha genérica: bottom-sheet no mobile, modal centralizado no desktop. Fecha com Esc,
// clique no fundo ou no X. Quem abre controla o estado (aberta/aoFechar).
export function FolhaFormulario({
  titulo,
  aberta,
  aoFechar,
  children,
}: {
  titulo: string;
  aberta: boolean;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberta) return;

    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoPressionarEsc);

    // Trava o scroll da página enquanto a folha está aberta
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoPressionarEsc);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberta, aoFechar]);

  if (!aberta) return null;

  return (
    <div
      className="folha-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={titulo} className="folha">
        <div className="folha-topo">
          <h2 className="folha-titulo">{titulo}</h2>
          <button type="button" className="botao-icone" aria-label="Fechar" onClick={aoFechar}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
