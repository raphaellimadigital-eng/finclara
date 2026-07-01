"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type Etapa = "carregando" | "desativado" | "ativado" | "enrolando";

export function ConfiguracaoDoisFatores() {
  const [etapa, setEtapa] = useState<Etapa>("carregando");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [segredo, setSegredo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const supabase = createClient();

  async function carregarFatores() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setErro("Não foi possível carregar as configurações de segurança.");
      setEtapa("desativado");
      return;
    }
    const totpAtivo = data.totp.find((f) => f.status === "verified");
    if (totpAtivo) {
      setFactorId(totpAtivo.id);
      setEtapa("ativado");
    } else {
      setEtapa("desativado");
    }
  }

  useEffect(() => {
    carregarFatores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAtivar() {
    setErro("");
    setProcessando(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSegredo(data.totp.secret);
      setEtapa("enrolando");
    } catch (err: any) {
      setErro(err.message || "Não foi possível iniciar a ativação.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleCancelar() {
    setProcessando(true);
    try {
      await supabase.auth.mfa.unenroll({ factorId });
    } finally {
      setCodigo("");
      setErro("");
      setProcessando(false);
      setEtapa("desativado");
    }
  }

  async function handleConfirmar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setProcessando(true);
    try {
      const { data: challenge, error: erroChallenge } = await supabase.auth.mfa.challenge({ factorId });
      if (erroChallenge) throw erroChallenge;

      const { error: erroVerify } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: codigo,
      });
      if (erroVerify) throw erroVerify;

      setCodigo("");
      setEtapa("ativado");
    } catch (err: any) {
      setErro(err.message || "Código inválido. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleDesativar() {
    if (!confirm("Desativar a autenticação em dois fatores? Você voltará a entrar só com e-mail e senha.")) return;
    setErro("");
    setProcessando(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setEtapa("desativado");
    } catch (err: any) {
      setErro(err.message || "Não foi possível desativar.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ShieldCheck size={16} aria-hidden="true" /> Autenticação em dois fatores
      </h2>

      {etapa === "carregando" && (
        <p className="texto-secundario" style={{ fontSize: 13 }}>Carregando...</p>
      )}

      {etapa === "desativado" && (
        <>
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 12 }}>
            Adicione uma camada extra de segurança: além da senha, você vai precisar de um código
            gerado por um app autenticador (Google Authenticator, Authy, etc.) para entrar.
          </p>
          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
          <button
            type="button"
            onClick={handleAtivar}
            disabled={processando}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "auto", padding: "10px 16px" }}
          >
            {processando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            Ativar autenticação em dois fatores
          </button>
        </>
      )}

      {etapa === "enrolando" && (
        <form onSubmit={handleConfirmar}>
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>
            Escaneie o código abaixo no seu app autenticador e digite o código de 6 dígitos gerado.
          </p>

          {qrCode && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qrCode} alt="QR code para configurar o autenticador" style={{ width: 160, height: 160, marginBottom: 10 }} />
          )}

          {segredo && (
            <p className="texto-secundario" style={{ fontSize: 11.5, marginBottom: 14, wordBreak: "break-all" }}>
              Não consegue escanear? Digite manualmente: <strong>{segredo}</strong>
            </p>
          )}

          <div className="campo">
            <label className="rotulo" htmlFor="codigoMfa">Código de 6 dígitos</label>
            <input
              id="codigoMfa"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={processando}
              required
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={processando}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {processando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
              Confirmar
            </button>
            <button type="button" className="botao-secundario" onClick={handleCancelar} disabled={processando}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {etapa === "ativado" && (
        <>
          <p style={{ fontSize: 13.5, color: "var(--verde)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={15} aria-hidden="true" /> Autenticação em dois fatores ativada
          </p>
          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
          <button
            type="button"
            onClick={handleDesativar}
            disabled={processando}
            className="botao-secundario"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "auto", padding: "10px 16px" }}
          >
            {processando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            Desativar
          </button>
        </>
      )}
    </div>
  );
}
