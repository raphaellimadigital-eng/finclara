"use client";

import { useRef, useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { enviarMensagemSuporte } from "@/app/dashboard/ajuda/actions";
import { LIMITE_CARACTERES_MENSAGEM } from "@/lib/suporte";

export function FormContatoSuporte() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const dados = new FormData(e.currentTarget);
      await enviarMensagemSuporte(dados);
      formRef.current?.reset();
      setMensagem("");
      setEnviado(true);
    } catch (err: any) {
      setErro(err.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Mail size={16} aria-hidden="true" /> Mandar uma mensagem
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 14, fontSize: 12.5 }}>
        A gente responde no e-mail da sua conta.
      </p>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo" style={{ marginBottom: 12 }}>
            <label className="rotulo" htmlFor="mensagem">Sua mensagem</label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={4}
              placeholder="Conta pra gente sua dúvida ou o que aconteceu..."
              required
              maxLength={LIMITE_CARACTERES_MENSAGEM}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              style={{
                width: "100%",
                fontSize: 16,
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--borda)",
                fontFamily: "inherit",
                background: "var(--card-bg)",
                color: "var(--texto)",
                resize: "vertical",
              }}
            />
            <div
              className="texto-secundario"
              style={{ fontSize: 11.5, textAlign: "right", marginTop: 4 }}
            >
              {mensagem.length}/{LIMITE_CARACTERES_MENSAGEM}
            </div>
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
          {enviado && (
            <p style={{ color: "var(--verde)", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} aria-hidden="true" /> Mensagem enviada! A gente te responde em breve.
            </p>
          )}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Enviando..." : "Enviar mensagem"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
