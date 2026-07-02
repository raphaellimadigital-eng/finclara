"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { PerguntaIA } from "./PerguntaIA";

// Botão flutuante com acesso rápido ao "Pergunte à FinClara" em qualquer tela do dashboard.
// Escondido na própria página de Ajuda, que já mostra a mesma caixa fixa no topo.
export function BotaoPerguntaFlutuante() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
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

  if (pathname?.startsWith("/dashboard/ajuda")) {
    return null;
  }

  return (
    <div ref={ref} style={{ position: "fixed", bottom: "max(20px, env(safe-area-inset-bottom))", right: 16, zIndex: 60 }}>
      {aberto && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 0,
            width: "min(340px, calc(100vw - 32px))",
          }}
        >
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="botao-icone"
            aria-label="Fechar"
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 1,
              background: "var(--card-bg)",
              borderRadius: "50%",
              minWidth: 32,
              minHeight: 32,
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
          <div style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.18)", borderRadius: 14 }}>
            <PerguntaIA />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Pergunte à FinClara"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        style={{
          width: 52,
          height: 52,
          minHeight: 0,
          borderRadius: "50%",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--azul)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}
      >
        <Sparkles size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
