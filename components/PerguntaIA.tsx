"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { perguntarIA } from "@/app/dashboard/ajuda/actions";
import { LIMITE_CARACTERES_PERGUNTA_IA } from "@/lib/suporte";

export function PerguntaIA() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setResposta("");
    setCarregando(true);

    try {
      const dados = new FormData(e.currentTarget);
      const texto = await perguntarIA(dados);
      setResposta(texto);
    } catch (err: any) {
      setErro(err.message || "Não foi possível responder agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={16} aria-hidden="true" style={{ color: "var(--investimento)" }} /> Pergunte à FinClara
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 14, fontSize: 12.5 }}>
        Tire dúvidas de como usar o app: como lançar algo, baixar um relatório, e por aí vai.
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input
              type="text"
              name="pergunta"
              placeholder="Ex: Como eu baixo o relatório do mês?"
              required
              maxLength={LIMITE_CARACTERES_PERGUNTA_IA}
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              aria-label="Perguntar"
              style={{ width: "auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {carregando ? <Loader2 size={16} className="icone-carregando" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
            </button>
          </div>
        </fieldset>
      </form>

      {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginTop: 10 }}>{erro}</p>}

      {resposta && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--borda)",
            fontSize: 13.5,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {resposta}
        </div>
      )}
    </div>
  );
}
