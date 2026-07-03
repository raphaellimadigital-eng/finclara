"use client";

import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const TAMANHO_MINIMO_SENHA = 6;

export function TrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
      setErro(`A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação não bate com a nova senha.");
      return;
    }

    setProcessando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Não foi possível confirmar sua identidade. Tente entrar novamente.");

      // Confirma a senha atual tentando entrar com ela, antes de trocar (evita que alguém
      // com a sessão aberta em um dispositivo esquecido troque a senha sem saber a atual).
      const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual,
      });
      if (erroSenhaAtual) throw new Error("Senha atual incorreta.");

      const { error: erroAtualizar } = await supabase.auth.updateUser({ password: novaSenha });
      if (erroAtualizar) throw erroAtualizar;

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || "Não foi possível trocar a senha. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <KeyRound size={16} aria-hidden="true" /> Trocar senha
      </h2>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={processando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="senhaAtual">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              minLength={TAMANHO_MINIMO_SENHA}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              minLength={TAMANHO_MINIMO_SENHA}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
          {sucesso && (
            <p style={{ color: "var(--verde)", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={15} aria-hidden="true" /> Senha alterada com sucesso.
            </p>
          )}

          <button
            type="submit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {processando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {processando ? "Trocando..." : "Trocar senha"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
