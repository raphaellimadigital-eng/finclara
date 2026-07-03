"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { salvarLimite } from "@/app/dashboard/limites/actions";
import { CATEGORIAS_DESPESA } from "@/lib/categorias";
import { mensagemPaywall } from "@/lib/assinatura";
import { PromptUpgrade } from "@/components/PromptUpgrade";

export function FormLimiteCategoria() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroPaywall, setErroPaywall] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setErroPaywall(null);
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await salvarLimite(data);
      formRef.current?.reset();
    } catch (err: any) {
      const paywall = mensagemPaywall(err);
      if (paywall) setErroPaywall(paywall);
      else setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PlusCircle size={16} aria-hidden="true" /> Definir limite por categoria
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="categoriaLimite">Categoria</label>
            <select id="categoriaLimite" name="categoria" required defaultValue="">
              <option value="" disabled>Selecione uma categoria</option>
              {CATEGORIAS_DESPESA.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorLimite">Limite mensal</label>
            <input id="valorLimite" name="valorLimite" type="number" placeholder="0,00" step="0.01" min="0.01" required />
          </div>

          {erroPaywall && <PromptUpgrade mensagem={erroPaywall} />}
          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar limite"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
