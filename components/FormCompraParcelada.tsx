"use client";

import { useRef, useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { criarCompraParcelada } from "@/app/dashboard/cartoes/actions";
import type { CartaoCredito } from "@prisma/client";

export function FormCompraParcelada({ cartoes }: { cartoes: CartaoCredito[] }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const hoje = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarCompraParcelada(data);
      formRef.current?.reset();
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (cartoes.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShoppingCart size={16} aria-hidden="true" /> Nova compra parcelada
        </h2>
        <p className="texto-secundario">Cadastre um cartão acima para poder lançar uma compra parcelada.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ShoppingCart size={16} aria-hidden="true" /> Nova compra parcelada
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="cartaoId">Cartão</label>
            <select id="cartaoId" name="cartaoId" required defaultValue="">
              <option value="" disabled>Selecione o cartão</option>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="descricaoCompra">Descrição</label>
            <input
              id="descricaoCompra"
              name="descricao"
              type="text"
              placeholder="Ex: Notebook, Passagem aérea..."
              required
              maxLength={100}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div className="campo" style={{ flex: 1 }}>
              <label className="rotulo" htmlFor="valorTotalCompra">Valor total</label>
              <input id="valorTotalCompra" name="valorTotal" type="number" placeholder="0,00" step="0.01" min="0.01" required />
            </div>
            <div className="campo" style={{ flex: 1 }}>
              <label className="rotulo" htmlFor="numParcelas">Parcelas</label>
              <input id="numParcelas" name="numParcelas" type="number" placeholder="Ex: 10" min="1" max="60" required />
            </div>
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="dataCompra">Data da compra</label>
            <input id="dataCompra" name="dataCompra" type="date" defaultValue={hoje} required />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar compra"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
