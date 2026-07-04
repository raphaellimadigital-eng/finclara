"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { criarMeta } from "@/app/dashboard/metas/actions";
import { LABEL_TIPO_META } from "@/lib/metas";
import { CampoValor } from "@/components/CampoValor";
import { mensagemPaywall } from "@/lib/assinatura";
import { PromptUpgrade } from "@/components/PromptUpgrade";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import { DESCRICAO_MAX, NOME_MIN, validarTextoNoInput } from "@/lib/textos";

export function FormMeta() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroPaywall, setErroPaywall] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setErroPaywall(null);
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarMeta(data);
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
              minLength={NOME_MIN}
              maxLength={DESCRICAO_MAX}
              onChange={(e) => validarTextoNoInput(e, NOME_MIN, DESCRICAO_MAX, "A descrição")}
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorAlvo">Quanto você quer juntar</label>
            <CampoValor id="valorAlvo" name="valorAlvo" />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="prazo">Até quando</label>
            {/* min = hoje: sem isso dava para criar uma meta que já nasce atrasada */}
            <input id="prazo" name="prazo" type="date" min={new Date().toISOString().split("T")[0]} required />
          </div>

          {erroPaywall && <PromptUpgrade mensagem={erroPaywall} />}
          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button type="submit" disabled={carregando || !valido} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar meta"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
