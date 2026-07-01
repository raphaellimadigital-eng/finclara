"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { criarMeta } from "@/app/dashboard/metas/actions";
import { LABEL_TIPO_META } from "@/lib/metas";

export function FormMeta() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarMeta(data);
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
        <PlusCircle size={16} aria-hidden="true" /> Nova meta
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" required defaultValue="">
              <option value="" disabled>Selecione o tipo</option>
              {Object.entries(LABEL_TIPO_META).map(([valor, label]) => (
                <option key={valor} value={valor}>{label}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="descricaoMeta">Descrição</label>
            <input
              id="descricaoMeta"
              name="descricao"
              type="text"
              placeholder="Ex: Viagem para Portugal, Carro novo..."
              required
              maxLength={100}
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorAlvo">Valor-alvo</label>
            <input id="valorAlvo" name="valorAlvo" type="number" placeholder="0,00" step="0.01" min="0.01" required />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="prazo">Prazo (data-alvo)</label>
            <input id="prazo" name="prazo" type="date" required />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar meta"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
