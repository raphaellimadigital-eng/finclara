"use client";

import { useState } from "react";
import { List, Inbox, Trash2, Loader2, AlertTriangle, CheckCircle2, PartyPopper, Undo2 } from "lucide-react";
import { deletarDivida, marcarDividaPaga, desfazerPagamentoDivida } from "@/app/dashboard/dividas/actions";
import { ehDividaCara, percentualQuitado } from "@/lib/dividas";
import type { Divida } from "@prisma/client";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ListaDividas({ dividas }: { dividas: Divida[] }) {
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (dividas.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhuma dívida cadastrada.
            <br />
            Ótimo se for verdade, ou cadastre a primeira no formulário acima (compra parcelada no
            cartão fica em Cartões, não aqui).
          </p>
        </div>
      </div>
    );
  }

  const ativas = dividas.filter((d) => !d.quitada);
  const quitadas = dividas.filter((d) => d.quitada);

  async function handleDeletar(id: string, descricao: string) {
    if (!confirm(`Remover a dívida "${descricao}"? Use isso quando quiser apagar o registro por completo.`)) return;
    setErro("");
    setProcessando(id);
    try {
      await deletarDivida(id);
    } catch {
      setErro("Não foi possível remover a dívida. Tente novamente.");
    } finally {
      setProcessando(null);
    }
  }

  async function handleMarcarPaga(divida: Divida) {
    const aindaNaoVenceu = new Date(divida.vencimento) > new Date();
    if (aindaNaoVenceu) {
      const confirmou = confirm(
        `Essa dívida ainda não venceu (vence em ${formatarData(divida.vencimento)}). Marcar como paga mesmo assim?`
      );
      if (!confirmou) return;
    }

    setErro("");
    setProcessando(divida.id);
    try {
      await marcarDividaPaga(divida.id);
    } catch {
      setErro("Não foi possível registrar o pagamento. Tente novamente.");
    } finally {
      setProcessando(null);
    }
  }

  async function handleDesfazer(id: string) {
    setErro("");
    setProcessando(id);
    try {
      await desfazerPagamentoDivida(id);
    } catch {
      setErro("Não foi possível desfazer o pagamento. Tente novamente.");
    } finally {
      setProcessando(null);
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

      {ativas.map((d) => {
        const cara = ehDividaCara(d);
        const percentual = percentualQuitado(d);
        return (
          <div key={d.id} className="lista-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span className="valor-despesa">{formatarMoeda(Number(d.valorTotal))}</span>

                <button
                  onClick={() => handleDeletar(d.id, d.descricao)}
                  disabled={processando !== null}
                  className="botao-icone"
                  aria-label={`Remover dívida ${d.descricao}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div>
              <div className="barra-fundo" role="progressbar" aria-valuenow={Math.round(percentual)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="barra-preenchimento"
                  style={{ width: `${percentual}%`, background: "var(--verde)" }}
                />
              </div>
              <div className="texto-secundario" style={{ fontSize: 11, marginTop: 5 }}>
                {Math.round(percentual)}% quitado
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 8, gap: 8, flexWrap: "wrap" }}>
                {percentual > 0 && (
                  <button
                    onClick={() => handleDesfazer(d.id)}
                    disabled={processando !== null}
                    aria-label={`Desmarcar parcela paga de ${d.descricao}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--texto-secundario)",
                      background: "var(--fundo)",
                      border: "1px solid var(--borda)",
                      borderRadius: 999,
                      padding: "6px 12px",
                      width: "auto",
                      minHeight: "auto",
                      cursor: "pointer",
                    }}
                  >
                    <Undo2 size={13} aria-hidden="true" /> Desmarcar parcela paga
                  </button>
                )}

                <button
                  onClick={() => handleMarcarPaga(d)}
                  disabled={processando !== null}
                  aria-label={`Marcar parcela de ${d.descricao} como paga`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--verde)",
                    background: "var(--verde-clara)",
                    border: "none",
                    borderRadius: 999,
                    padding: "6px 12px",
                    width: "auto",
                    minHeight: "auto",
                    cursor: "pointer",
                  }}
                >
                  {processando === d.id ? (
                    <Loader2 size={13} className="icone-carregando" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 size={13} aria-hidden="true" />
                  )}
                  Marcar parcela paga
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {quitadas.length > 0 && (
        <div style={{ marginTop: ativas.length > 0 ? 16 : 0, paddingTop: ativas.length > 0 ? 16 : 0, borderTop: ativas.length > 0 ? "1px solid var(--borda)" : "none" }}>
          <div className="texto-secundario" style={{ fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <PartyPopper size={13} aria-hidden="true" /> Quitadas
          </div>
          {quitadas.map((d) => (
            <div key={d.id} className="lista-item" style={{ opacity: 0.75 }}>
              <div className="lista-item-info">
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    {d.descricao}
                    <span className="categoria-tag" style={{ color: "var(--verde)", borderColor: "var(--verde-clara)", background: "var(--verde-clara)" }}>
                      <CheckCircle2 size={11} aria-hidden="true" /> quitada
                    </span>
                  </div>
                  <div className="texto-secundario" style={{ marginTop: 3 }}>
                    {formatarMoeda(Number(d.valorOriginal))} pagos
                    {d.quitadaEm && <> · quitada em {formatarData(d.quitadaEm)}</>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => handleDesfazer(d.id)}
                  disabled={processando !== null}
                  className="botao-secundario"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                  aria-label={`Reabrir dívida ${d.descricao}, desfazendo a quitação`}
                >
                  <Undo2 size={13} aria-hidden="true" /> Desfazer
                </button>

                <button
                  onClick={() => handleDeletar(d.id, d.descricao)}
                  disabled={processando !== null}
                  className="botao-icone"
                  aria-label={`Remover dívida ${d.descricao}`}
                >
                  {processando === d.id ? (
                    <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                  ) : (
                    <Trash2 size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
