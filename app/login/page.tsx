"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatarCep, buscarEnderecoPorCep } from "@/lib/cep";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  // Etapa de verificação em dois fatores (só aparece se o usuário tiver 2FA ativado)
  const [precisaMfa, setPrecisaMfa] = useState(false);
  const [factorIdMfa, setFactorIdMfa] = useState("");
  const [codigoMfa, setCodigoMfa] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Busca o endereço automaticamente pelo CEP (ViaCEP, gratuito e sem chave). O campo Endereço
  // continua editável para completar com número e complemento, ou caso a busca falhe.
  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = formatarCep(e.target.value);
    setCep(formatado);
    setErroCep("");

    const digitos = formatado.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setBuscandoCep(true);
    try {
      setEndereco(await buscarEnderecoPorCep(digitos));
    } catch (err: any) {
      setErroCep(err.message || "Não foi possível buscar o CEP agora. Preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Nome/telefone/endereço vão como metadados do próprio cadastro (em vez de uma Server
    // Action separada logo em seguida) para não depender da sessão já estar sincronizada no
    // servidor no exato instante após o signUp.
    const acao =
      modo === "login"
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { nome, telefone, endereco },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

    const { data, error } = await acao;

    if (error) {
      setCarregando(false);
      setErro(error.message);
      return;
    }

    // Com confirmação de e-mail ativada no Supabase, o cadastro cria a conta mas não devolve
    // uma sessão ativa até o usuário clicar no link recebido por e-mail.
    if (modo === "cadastro" && !data.session) {
      setCarregando(false);
      setAguardandoConfirmacao(true);
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
          <h1>Fin<span style={{ color: "var(--verde)" }}>Clara</span></h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="slogan" style={{ marginBottom: 24 }}>
        Finanças simples, decisões{" "}
        <span style={{ color: "var(--verde)", fontWeight: 700, fontStyle: "italic" }}>claras</span>
        .
      </p>

      {aguardandoConfirmacao ? (
        <div className="card" style={{ textAlign: "center" }}>
          <MailCheck size={32} style={{ color: "var(--azul)", marginBottom: 10 }} aria-hidden="true" />
          <h2 className="card-title" style={{ justifyContent: "center" }}>Confirme seu e-mail</h2>
          <p className="texto-secundario" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra sua caixa de
            entrada e clique no link para ativar sua conta. Depois é só voltar aqui e entrar.
          </p>
          <p className="texto-secundario" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
            Não encontrou o e-mail? Confira também a caixa de spam ou lixo eletrônico, às vezes
            e-mails automáticos caem lá.
          </p>
          <button
            type="button"
            className="botao-secundario"
            style={{ marginTop: 8 }}
            onClick={() => {
              setAguardandoConfirmacao(false);
              setModo("login");
            }}
          >
            Voltar para o login
          </button>
        </div>
      ) : precisaMfa ? (
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
            {modo === "cadastro" && (
              <div className="campo">
                <label className="rotulo" htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}

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

            {modo === "cadastro" && (
              <>
                <div className="campo">
                  <label className="rotulo" htmlFor="telefone">Telefone</label>
                  <input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 91234-5678"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label className="rotulo" htmlFor="cep">CEP</label>
                  <input
                    id="cep"
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                    maxLength={9}
                  />
                  {buscandoCep && (
                    <span
                      className="texto-secundario"
                      style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}
                    >
                      <Loader2 size={12} className="icone-carregando" aria-hidden="true" /> Buscando endereço...
                    </span>
                  )}
                  {erroCep && (
                    <span style={{ color: "var(--vermelho)", fontSize: 11.5, marginTop: 4, display: "block" }}>
                      {erroCep}
                    </span>
                  )}
                </div>

                <div className="campo">
                  <label className="rotulo" htmlFor="endereco">Endereço</label>
                  <input
                    id="endereco"
                    type="text"
                    placeholder="Preenchido pelo CEP, complete com número e complemento"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </>
            )}

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
