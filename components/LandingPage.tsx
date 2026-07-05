import Link from "next/link";
import {
  Wallet,
  PiggyBank,
  Target,
  CreditCard,
  BellRing,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const FUNCIONALIDADES = [
  {
    Icone: Wallet,
    titulo: "Visão clara do mês",
    descricao: "Quanto entrou, quanto saiu e quanto sobrou — tudo num único painel, sem planilha.",
  },
  {
    Icone: PiggyBank,
    titulo: "Regra 50/30/20 na sua realidade",
    descricao: "A sugestão de quanto guardar se adapta à sua renda, não é uma conta genérica.",
  },
  {
    Icone: Target,
    titulo: "Metas com progresso automático",
    descricao: "Guarde dinheiro para um objetivo e acompanhe o quanto falta, sem fazer conta na mão.",
  },
  {
    Icone: CreditCard,
    titulo: "Cartões e dívidas sob controle",
    descricao: "Acompanhe faturas, parcelas e o quanto suas dívidas pesam na sua renda.",
  },
  {
    Icone: BellRing,
    titulo: "Alertas e limites por categoria",
    descricao: "Saiba antes de estourar o orçamento em alimentação, lazer ou qualquer outra categoria.",
  },
  {
    Icone: Sparkles,
    titulo: "Sugestões educativas por IA",
    descricao: "Recomendações de alocação em texto simples — nunca uma ordem de comprar um ativo específico.",
  },
];

const PASSOS = [
  { numero: 1, titulo: "Crie sua conta grátis", descricao: "Leva menos de um minuto, sem precisar de cartão de crédito." },
  { numero: 2, titulo: "Registre seus gastos e receitas", descricao: "Lance o que entra e o que sai — o FinClara organiza o resto." },
  { numero: 3, titulo: "Acompanhe e ajuste", descricao: "Veja sugestões, metas e alertas, e vá ajustando o rumo mês a mês." },
];

export function LandingPage() {
  return (
    <div className="container container-largo">
      <div className="landing-topo">
        <div className="marca">
          <Logo size={36} />
          <span style={{ fontSize: 19, fontWeight: 700 }}>
            Fin<span style={{ color: "var(--verde)" }}>Clara</span>
          </span>
        </div>
        <div className="landing-topo-acoes">
          <ThemeToggle />
          <Link href="/login" className="botao-secundario">
            Entrar
          </Link>
        </div>
      </div>

      <section className="landing-hero">
        <span className="badge-saude confortavel">
          <Sparkles size={13} aria-hidden="true" /> 7 dias grátis, sem cartão de crédito
        </span>
        <h1>
          Organize suas finanças e faça seu dinheiro{" "}
          <span style={{ color: "var(--verde)", fontStyle: "italic" }}>render</span>.
        </h1>
        <p className="landing-hero-subtitulo">
          O FinClara ajuda qualquer pessoa, com qualquer renda, a entender para onde o dinheiro
          vai, economizar de verdade e planejar o futuro — em português simples, sem jargão.
        </p>
        <div className="landing-hero-cta">
          <Link href="/login?modo=cadastro" className="botao-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Criar conta grátis <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/login" className="botao-secundario" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            Já tenho conta
          </Link>
        </div>
        <p className="landing-hero-nota">
          Depois do teste grátis, continue no plano Free ou assine o Pro por R$ 19,90/mês.
        </p>
      </section>

      <section className="landing-secao">
        <h2 className="landing-secao-titulo">Tudo o que você precisa num só lugar</h2>
        <p className="landing-secao-subtitulo">
          Sem depender de planilha, sem fórmula complicada — só clareza sobre o seu dinheiro.
        </p>
        <div className="landing-grid landing-grid-3">
          {FUNCIONALIDADES.map(({ Icone, titulo, descricao }) => (
            <div key={titulo} className="card">
              <div className="landing-feature-icone">
                <Icone size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: 15, margin: "0 0 6px" }}>{titulo}</h3>
              <p className="texto-secundario" style={{ margin: 0, lineHeight: 1.5 }}>{descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-secao">
        <h2 className="landing-secao-titulo">Como funciona</h2>
        <div className="landing-grid" style={{ maxWidth: 640, margin: "0 auto" }}>
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="landing-passo">
              <div className="landing-passo-numero">{passo.numero}</div>
              <div>
                <h3 style={{ fontSize: 14.5, margin: "0 0 4px" }}>{passo.titulo}</h3>
                <p className="texto-secundario" style={{ margin: 0, lineHeight: 1.5 }}>{passo.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-final">
        <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>Pronto para ter clareza sobre suas finanças?</h2>
        <p className="texto-secundario" style={{ margin: "0 0 18px" }}>
          Comece agora — 7 dias grátis com tudo desbloqueado, sem cartão de crédito.
        </p>
        <Link
          href="/login?modo=cadastro"
          className="botao-cta"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, maxWidth: 260, margin: "0 auto" }}
        >
          Criar conta grátis <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <footer className="landing-rodape">
        <p style={{ margin: 0 }}>
          Isto é uma sugestão educativa, não uma recomendação de investimento.
        </p>
        <p style={{ margin: "6px 0 0" }}>
          <Link href="/termos" style={{ color: "var(--texto-secundario)" }}>Termos de Uso e Privacidade</Link>
          {" · "}
          © {new Date().getFullYear()} FinClara
        </p>
      </footer>
    </div>
  );
}
