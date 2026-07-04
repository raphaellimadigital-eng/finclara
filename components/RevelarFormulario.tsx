"use client";

import { useState } from "react";
import { Plus, ChevronUp } from "lucide-react";

// Padrão das telas internas: a situação (resumo + lista) vem primeiro; o formulário de
// cadastro fica recolhido atrás de um botão "+ Adicionar", pra não empurrar o conteúdo
// pra baixo da dobra no celular.
export function RevelarFormulario({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button type="button" className="botao-adicionar" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
        {aberto ? <ChevronUp size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        {aberto ? "Fechar" : rotulo}
      </button>
      {aberto && children}
    </>
  );
}
