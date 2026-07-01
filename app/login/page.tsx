"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Etapa de verificação em dois fatores (só aparece se o usuário tiver 2FA ativado)
  const [precisaMfa, setPrecisaMfa] = useState(false);
  const [factorIdMfa, setFactorIdMfa] = useState("");
  const [codigoMfa, setCodigoMfa] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const acao =
      modo === "login"
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({ email, password: senha });

    const { error } = await acao;

    if (error) {
      setCarregando(false);
      setErro(error.message);
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
      const { data: fatores } = await supabase.auth.mfa.listFactors();
      const fatorTotp = fatores?.totp.find((f) => f.status === "verified");
      if (fatorTotp) {
        setFactorIdMfa(fatorTotp.id);
        setPrecisaMfa(true);
        setCarregando(false);
        return;
      }
    }

    // Mantém o botão desabilitado/carregando até a navegação acontecer
    router.push("/dashboard");
    router.refresh();
  }

  async function handleConfirmarMfa(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data: challenge, error: erroChallenge } = await supabase.auth.mfa.challenge({ factorId: factorIdMfa });
    if (erroChallenge) {
      setErro(erroChallenge.message);
      setCarregando(false);
      return;
    }

    const { error: erroVerify } = await supabase.auth.mfa.verify({
      factorId: factorIdMfa,
      challengeId: challenge.id,
      code: codigoMfa,
    });
    if (erroVerify) {
      setErro("Código inválido. Tente novamente.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="container">
      <div className="topo">
        <div className="marca">
          <Logo />
          <h1>FinClara</h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="slogan" style={{ marginBottom: 24 }}>Finanças simples, decisões claras.</p>

      {precisaMfa ? (
        <form className="card" onSubmit={handleConfirmarMfa}>
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 12 }}>
            Digite o código de 6 dígitos do seu app autenticador.
          </p>
          <div className="campo">
            <label className="rotulo" htmlFor="codigoMfa">Código</label>
            <input
              id="codigoMfa"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={codigoMfa}
              onChange={(e) => setCodigoMfa(e.target.value)}
              required
              autoFocus
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13.5, marginTop: 12 }}>{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Verificando..." : "Confirmar"}
          </button>
        </form>
      ) : (
        <>
          <form className="card" onSubmit={handleSubmit}>
            <div className="campo">
              <label className="rotulo" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label className="rotulo" htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13.5, marginTop: 12 }}>{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
              {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="texto-secundario" style={{ textAlign: "center" }}>
            {modo === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button type="button" className="botao-secundario" disabled={carregando} onClick={() => setModo("cadastro")}>
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button type="button" className="botao-secundario" disabled={carregando} onClick={() => setModo("login")}>
                  Entrar
                </button>
              </>
            )}
          </p>

          <p className="texto-secundario" style={{ textAlign: "center", fontSize: 11.5, marginTop: -8 }}>
            Ao continuar, você concorda com nossos{" "}
            <Link href="/termos" style={{ color: "var(--texto-secundario)" }}>
              Termos de Uso e Privacidade
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
