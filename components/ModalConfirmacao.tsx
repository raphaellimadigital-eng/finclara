"use client";

import { AlertTriangle } from "lucide-react";

// Modal de confirmação própria — substitui o confirm() nativo do navegador, que tem visual
// inconsistente e botões pequenos demais para toque.
export function ModalConfirmacao({
  aberta,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  aoConfirmar,
  aoCancelar,
}: {
  aberta: boolean;
  titulo?: string;
  mensagem: string;
  textoConfirmar?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  if (!aberta) return null;

  return (
    <div
      className="folha-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoCancelar();
      }}
    >
      <div role="alertdialog" aria-modal="true" aria-label={titulo ?? "Confirmar ação"} className="folha" style={{ maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <AlertTriangle size={20} style={{ color: "var(--vermelho)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>{mensagem}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="botao-secundario" style={{ flex: 1, border: "1px solid var(--borda)" }} onClick={aoCancelar}>
            Cancelar
          </button>
          <button type="button" className="botao-perigo" style={{ flex: 1, width: "auto" }} onClick={aoConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
