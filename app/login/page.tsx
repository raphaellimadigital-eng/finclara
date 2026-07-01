"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

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

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="container">
      <div className="marca">
        <Logo />
        <h1>FinClara</h1>
      </div>
      <p className="slogan" style={{ marginBottom: 24 }}>Finanças simples, decisões claras.</p>

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

        <button type="submit" disabled={carregando} style={{ marginTop: 4 }}>
          {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="texto-secundario" style={{ textAlign: "center" }}>
        {modo === "login" ? (
          <>
            Ainda não tem conta?{" "}
            <button type="button" className="botao-secundario" onClick={() => setModo("cadastro")}>
              Criar conta grátis
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button type="button" className="botao-secundario" onClick={() => setModo("login")}>
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
