"use client";

import { useState } from "react";
import { List, Inbox, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deletarDivida } from "@/app/dashboard/dividas/actions";
import { ehDividaCara } from "@/lib/dividas";
import type { Divida } from "@prisma/client";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ListaDividas({ dividas }: { dividas: Divida[] }) {
  const [deletando, setDeletando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (dividas.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhuma dívida cadastrada.
            <br />
            Ótimo se for verdade — ou cadastre a primeira no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  async function handleDeletar(id: string, descricao: string) {
    if (!confirm(`Remover a dívida "${descricao}"? Use isso quando ela for quitada.`)) return;
    setErro("");
    setDeletando(id);
    try {
      await deletarDivida(id);
    } catch {
      setErro("Não foi possível remover a dívida. Tente novamente.");
    } finally {
      setDeletando(null);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <List size={16} aria-hidden="true" /> Suas dívidas (ordenadas por prioridade de quitação)
      </h2>

      {erro && (
        <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>
          {erro}
        </p>
      )}

      {dividas.map((d) => {
        const cara = ehDividaCara(d);
        return (
          <div key={d.id} className="lista-item">
            <div className="lista-item-info">
              <div>
                <div style={{ fontWeight: 500, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  {d.descricao}
                  {cara && (
                    <span className="categoria-tag" style={{ color: "var(--vermelho)", borderColor: "var(--vermelho-clara)", background: "var(--vermelho-clara)" }}>
                      <AlertTriangle size={11} aria-hidden="true" /> cara
                    </span>
                  )}
                </div>
                <div className="texto-secundario" style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span>{Number(d.taxaJuros).toLocaleString("pt-BR")}% a.m.</span>
                  <span>· parcela {formatarMoeda(Number(d.valorParcela))}</span>
                  <span>· vence {formatarData(d.vencimento)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="valor-despesa">{formatarMoeda(Number(d.valorTotal))}</span>

              <button
                onClick={() => handleDeletar(d.id, d.descricao)}
                disabled={deletando !== null}
                className="botao-icone"
                aria-label={`Remover dívida ${d.descricao}`}
              >
                {deletando === d.id ? (
                  <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
