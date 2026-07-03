"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { criarCartao } from "@/app/dashboard/cartoes/actions";
import { mensagemPaywall } from "@/lib/assinatura";
import { PromptUpgrade } from "@/components/PromptUpgrade";

export function FormCartao() {
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
      await criarCartao(data);
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
        <PlusCircle size={16} aria-hidden="true" /> Novo cartão
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="nome">Apelido do cartão</label>
            <input id="nome" name="nome" type="text" placeholder="Ex: Nubank, Inter..." required maxLength={50} />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="limite">Limite total</label>
            <input id="limite" name="limite" type="number" placeholder="0,00" step="0.01" min="0.01" required />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div className="campo" style={{ flex: 1 }}>
              <label className="rotulo" htmlFor="diaFechamento">Dia de fechamento</label>
              <input id="diaFechamento" name="diaFechamento" type="number" placeholder="Ex: 15" min="1" max="31" required />
            </div>
            <div className="campo" style={{ flex: 1 }}>
              <label className="rotulo" htmlFor="diaVencimento">Dia de vencimento</label>
              <input id="diaVencimento" name="diaVencimento" type="number" placeholder="Ex: 22" min="1" max="31" required />
            </div>
          </div>

          {erroPaywall && <PromptUpgrade mensagem={erroPaywall} />}
          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar cartão"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
