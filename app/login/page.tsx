"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck, ShieldCheck, Sparkles, Target, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatarCpf, cpfValido } from "@/lib/cpf";
import { maiorDeIdade, parseDataLocal } from "@/lib/data";
import { NOME_MAX, NOME_MIN, validarTextoNoInput } from "@/lib/textos";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import { cpfDisponivel } from "./actions";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const HOJE = new Date().toISOString().split("T")[0];
const DATA_NASCIMENTO_MIN = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split("T")[0];

const BENEFICIOS = [
  { Icone: Wallet, texto: "Visão clara do que entrou, saiu e sobrou no mês" },
  { Icone: Target, texto: "Metas com progresso automático e regra 50/30/20 na sua realidade" },
  { Icone: ShieldCheck, texto: "Seus dados protegidos, sem coletar cartão no cadastro" },
];

function validarCpfNoInput(e: React.ChangeEvent<HTMLInputElement>) {
  const digitos = e.target.value.replace(/\D/g, "");
  if (digitos.length < 11) {
    e.target.setCustomValidity("Digite os 11 números do CPF.");
  } else if (!cpfValido(e.target.value)) {
    e.target.setCustomValidity("Este CPF não é válido.");
  } else {
    e.target.setCustomValidity("");
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  // Sempre começa em "login" (idêntico no servidor e no cliente, sem risco de hidratação) — se a
  // URL pedir o cadastro (ex: CTA da landing em /login?modo=cadastro), troca logo após montar.
  // useSearchParams() exigiria um <Suspense> que, nesta página estática, faz o HTML do servidor
  // sair vazio e sempre diverge do cliente — daí ler a query direto de window.location aqui.
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("modo") === "cadastro") {
      setModo("cadastro");
    }
  }, []);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  // Etapa de verificação em dois fatores (só aparece se o usuário tiver 2FA ativado)
  const [precisaMfa, setPrecisaMfa] = useState(false);
  const [factorIdMfa, setFactorIdMfa] = useState("");
  const [codigoMfa, setCodigoMfa] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatarCpf(e.target.value));
    validarCpfNoInput(e);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (modo === "cadastro") {
      if (!cpfValido(cpf)) {
        setErro("Digite um CPF válido.");
        return;
      }
      if (!dataNascimento || !maiorDeIdade(parseDataLocal(dataNascimento))) {
        setErro("É preciso ser maior de 18 anos para criar uma conta no FinClara.");
        return;
      }
      setCarregando(true);
      if (!(await cpfDisponivel(cpf))) {
        setErro("Este CPF já está cadastrado em outra conta.");
        setCarregando(false);
        return;
      }
    } else {
      setCarregando(true);
    }

    // Nome/CPF/data de nascimento vão como metadados do próprio cadastro (em vez de uma Server
    // Action separada logo em seguida) para não depender da sessão já estar sincronizada no
    // servidor no exato instante após o signUp. Telefone e endereço saíram daqui — cadastro
    // enxuto — e ficam disponíveis (opcionais) para completar depois em Perfil.
    const acao =
      modo === "login"
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { nome, cpf: cpf.replace(/\D/g, ""), dataNascimento },
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
    <div className="login-layout">
      <div className="login-painel-marca">
        <div className="marca">
          <Logo size={40} />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            Fin<span style={{ color: "#dffbff" }}>Clara</span>
          </span>
        </div>
        <h2>Finanças simples, decisões claras.</h2>
        <p>
          Qualquer pessoa, com qualquer renda, consegue organizar as finanças, economizar e fazer
          o dinheiro render. Comece com 7 dias grátis, sem precisar de cartão de crédito.
        </p>
        <ul className="login-beneficios">
          {BENEFICIOS.map(({ Icone, texto }) => (
            <li key={texto} className="login-beneficio">
              <Icone size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="login-formulario-coluna">
        <div className="login-formulario-conteudo">
          <div className="topo" style={{ marginBottom: 8 }}>
            <div className="marca">
              <Logo />
              <h1>Fin<span style={{ color: "var(--verde)" }}>Clara</span></h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="slogan" style={{ marginBottom: 20 }}>
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
              <div className="login-modo-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === "login"}
                  className={modo === "login" ? "ativo" : ""}
                  disabled={carregando}
                  onClick={() => setModo("login")}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === "cadastro"}
                  className={modo === "cadastro" ? "ativo" : ""}
                  disabled={carregando}
                  onClick={() => setModo("cadastro")}
                >
                  Criar conta grátis
                </button>
              </div>

              <form ref={formRef} className="card" onSubmit={handleSubmit}>
                {modo === "cadastro" && (
                  <>
                    <div className="campo">
                      <label className="rotulo" htmlFor="nome">Nome</label>
                      <input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          validarTextoNoInput(e, NOME_MIN, NOME_MAX, "O nome");
                        }}
                        required
                        minLength={NOME_MIN}
                        maxLength={NOME_MAX}
                      />
                    </div>

                    <div className="campo-linha-dupla">
                      <div className="campo">
                        <label className="rotulo" htmlFor="cpf">CPF</label>
                        <input
                          id="cpf"
                          type="text"
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={handleCpfChange}
                          maxLength={14}
                          required
                        />
                      </div>
                      <div className="campo">
                        <label className="rotulo" htmlFor="dataNascimento">Data de nascimento</label>
                        <input
                          id="dataNascimento"
                          type="date"
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          min={DATA_NASCIMENTO_MIN}
                          max={HOJE}
                          required
                        />
                      </div>
                    </div>
                  </>
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
                    maxLength={72}
                    required
                  />
                </div>

                {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13.5, marginTop: 12 }}>{erro}</p>}

                <button
                  type="submit"
                  disabled={carregando || !valido}
                  className={modo === "cadastro" ? "botao-cta" : ""}
                  style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
                  {carregando
                    ? "Aguarde..."
                    : modo === "login"
                      ? "Entrar"
                      : (<><Sparkles size={16} aria-hidden="true" /> Criar conta grátis</>)}
                </button>
              </form>

              <p className="texto-secundario" style={{ textAlign: "center", fontSize: 11.5 }}>
                Ao continuar, você concorda com nossos{" "}
                <Link href="/termos" style={{ color: "var(--texto-secundario)" }}>
                  Termos de Uso e Privacidade
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
