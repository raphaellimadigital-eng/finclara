"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { criarDivida } from "@/app/dashboard/dividas/actions";
import { TAXA_JUROS_CARA_AO_MES } from "@/lib/dividas";

export function FormDivida() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarDivida(data);
      formRef.current?.reset();
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PlusCircle size={16} aria-hidden="true" /> Nova dívida
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Ex: Empréstimo pessoal, Cartão de crédito..."
              required
              maxLength={100}
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorTotal">Saldo devedor (valor total)</label>
            <input
              id="valorTotal"
              name="valorTotal"
              type="number"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorParcela">Valor da parcela mensal</label>
            <input
              id="valorParcela"
              name="valorParcela"
              type="number"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="taxaJuros">Taxa de juros (% ao mês)</label>
            <input
              id="taxaJuros"
              name="taxaJuros"
              type="number"
              placeholder={`Ex: 2.5 (acima de ${TAXA_JUROS_CARA_AO_MES}% é considerada cara)`}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="vencimento">Próximo vencimento</label>
            <input
              id="vencimento"
              name="vencimento"
              type="date"
              required
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button
            type="submit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar dívida"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
