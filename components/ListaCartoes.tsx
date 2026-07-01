"use client";

import { useState } from "react";
import { CreditCard, Trash2, Loader2, Inbox, ShoppingCart } from "lucide-react";
import { deletarCartao, deletarCompraParcelada } from "@/app/dashboard/cartoes/actions";
import { limiteDisponivel } from "@/lib/cartoes";
import type { CartaoCredito, CompraParcelada } from "@prisma/client";

type CartaoComCompras = CartaoCredito & { compras: CompraParcelada[] };

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ListaCartoes({ cartoes }: { cartoes: CartaoComCompras[] }) {
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (cartoes.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhum cartão cadastrado ainda.
            <br />
            Cadastre o primeiro no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  async function handleExcluirCartao(id: string, nome: string) {
    if (!confirm(`Remover o cartão "${nome}"? Isso também remove as compras parceladas vinculadas a ele.`)) return;
    setErro("");
    setExcluindo(`cartao-${id}`);
    try {
      await deletarCartao(id);
    } catch {
      setErro("Não foi possível remover o cartão. Tente novamente.");
    } finally {
      setExcluindo(null);
    }
  }

  async function handleExcluirCompra(id: string, descricao: string) {
    if (!confirm(`Remover a compra "${descricao}"?`)) return;
    setErro("");
    setExcluindo(`compra-${id}`);
    try {
      await deletarCompraParcelada(id);
    } catch {
      setErro("Não foi possível remover a compra. Tente novamente.");
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

      {cartoes.map((cartao) => {
        const disponivel = limiteDisponivel(cartao, cartao.compras);
        const limite = Number(cartao.limite);
        const usado = Math.max(limite - disponivel, 0);
        const percentualUsado = limite > 0 ? Math.min((usado / limite) * 100, 100) : 0;
        const estourou = disponivel < 0;

        return (
          <div key={cartao.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <CreditCard size={16} aria-hidden="true" /> {cartao.nome}
              </h2>
              <button
                onClick={() => handleExcluirCartao(cartao.id, cartao.nome)}
                disabled={excluindo !== null}
                className="botao-icone"
                aria-label={`Remover cartão ${cartao.nome}`}
              >
                {excluindo === `cartao-${cartao.id}` ? (
                  <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="texto-secundario" style={{ marginBottom: 4 }}>
              Limite disponível:{" "}
              <strong style={{ color: estourou ? "var(--vermelho)" : "var(--texto)" }}>
                {formatarMoeda(disponivel)}
              </strong>{" "}
              de {formatarMoeda(limite)}
            </div>
            <div className="barra-fundo" style={{ marginBottom: 8 }}>
              <div
                className="barra-preenchimento"
                style={{ width: `${percentualUsado}%`, background: estourou ? "var(--vermelho)" : "var(--azul)" }}
              />
            </div>
            <div className="texto-secundario" style={{ fontSize: 11.5, marginBottom: 12 }}>
              Fecha dia {cartao.diaFechamento} · vence dia {cartao.diaVencimento}
            </div>

            {cartao.compras.length === 0 ? (
              <p className="texto-secundario" style={{ fontSize: 13, margin: 0 }}>
                Nenhuma compra parcelada neste cartão.
              </p>
            ) : (
              cartao.compras.map((compra) => (
                <div key={compra.id} className="lista-item">
                  <div className="lista-item-info">
                    <span className="lista-item-icone" aria-hidden="true">
                      <ShoppingCart size={16} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14.5 }}>{compra.descricao}</div>
                      <div className="texto-secundario" style={{ marginTop: 2 }}>
                        {compra.numParcelas}x de {formatarMoeda(Number(compra.valorTotal) / compra.numParcelas)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="valor-despesa">{formatarMoeda(Number(compra.valorTotal))}</span>
                    <button
                      onClick={() => handleExcluirCompra(compra.id, compra.descricao)}
                      disabled={excluindo !== null}
                      className="botao-icone"
                      aria-label={`Remover compra ${compra.descricao}`}
                    >
                      {excluindo === `compra-${compra.id}` ? (
                        <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                      ) : (
                        <Trash2 size={16} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </>
  );
}
