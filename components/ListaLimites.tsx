"use client";

import { useState } from "react";
import { Inbox, Trash2, Loader2, AlertTriangle, AlertOctagon } from "lucide-react";
import { deletarLimite } from "@/app/dashboard/limites/actions";
import type { ProgressoLimite } from "@/lib/limites";

const LABEL_CATEGORIA: Record<string, string> = {
  MORADIA: "Moradia",
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  SAUDE: "Saúde",
  EDUCACAO: "Educação",
  LAZER: "Lazer",
  ASSINATURAS: "Assinaturas",
  OUTRAS_DESPESAS: "Outras despesas",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const COR_SITUACAO: Record<ProgressoLimite["situacao"], string> = {
  ok: "var(--azul)",
  aviso: "var(--amarelo)",
  estouro: "var(--vermelho)",
};

export function ListaLimites({ limites }: { limites: (ProgressoLimite & { id: string })[] }) {
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (limites.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhum limite definido ainda.
            <br />
            Cadastre o primeiro no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  async function handleExcluir(id: string, label: string) {
    if (!confirm(`Remover o limite de "${label}"?`)) return;
    setErro("");
    setExcluindo(id);
    try {
      await deletarLimite(id);
    } catch {
      setErro("Não foi possível remover o limite. Tente novamente.");
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <>
      {erro && (
        <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>
          {erro}
        </p>
      )}

      {limites.map((limite) => {
        const label = LABEL_CATEGORIA[limite.categoria] ?? limite.categoria;
        const cor = COR_SITUACAO[limite.situacao];

        return (
          <div key={limite.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  {limite.situacao === "estouro" && <AlertOctagon size={15} style={{ color: cor }} aria-hidden="true" />}
                  {limite.situacao === "aviso" && <AlertTriangle size={15} style={{ color: cor }} aria-hidden="true" />}
                  {label}
                </div>
                <div className="texto-secundario">
                  {formatarMoeda(limite.gastoAtual)} de {formatarMoeda(limite.valorLimite)} ({Math.round(limite.percentual)}%)
                </div>
              </div>
              <button
                onClick={() => handleExcluir(limite.id, label)}
                disabled={excluindo !== null}
                className="botao-icone"
                aria-label={`Remover limite de ${label}`}
              >
                {excluindo === limite.id ? (
                  <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="barra-fundo">
              <div
                className="barra-preenchimento"
                style={{ width: `${Math.min(limite.percentual, 100)}%`, background: cor }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
