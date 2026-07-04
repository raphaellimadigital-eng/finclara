"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  House,
  Target,
  Plus,
  WalletCards,
  Menu,
  Bell,
  Compass,
  FileText,
  TrendingUp,
  UserRound,
  ShieldCheck,
  Settings,
  LifeBuoy,
  LogOut,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { FolhaFormulario } from "@/components/FolhaFormulario";
import { FormLancamento, type MetaParaVincular } from "@/components/FormLancamento";
import { Logo } from "@/components/Logo";

type ItemNav = { href: string; rotulo: string; Icone: LucideIcon; ativoEm: string[] };

// Itens principais, na ordem da jornada: visão do mês → metas → (registrar) → contas do dia a dia
const ITENS_PRINCIPAIS: ItemNav[] = [
  { href: "/dashboard", rotulo: "Início", Icone: House, ativoEm: ["/dashboard"] },
  { href: "/dashboard/metas", rotulo: "Metas", Icone: Target, ativoEm: ["/dashboard/metas"] },
];

const ITENS_CONTAS: ItemNav = {
  href: "/dashboard/contas",
  rotulo: "Contas",
  Icone: WalletCards,
  ativoEm: ["/dashboard/contas", "/dashboard/cartoes", "/dashboard/dividas", "/dashboard/limites"],
};

type ItemSecundario = { href: string; rotulo: string; Icone: LucideIcon };

// Itens secundários: expandidos na sidebar (desktop), atrás do botão "Mais" no mobile.
// Agrupados por tema (financeiro → conta → suporte), com "Sua prioridade" primeiro por ser o
// diferencial do produto — cada grupo ganha um divisor visual entre si (ver GRUPOS_SECUNDARIOS).
const GRUPOS_SECUNDARIOS: { rotulo: string; itens: ItemSecundario[] }[] = [
  {
    rotulo: "financeiro",
    itens: [
      { href: "/dashboard/orientacao", rotulo: "Sua prioridade", Icone: Compass },
      { href: "/dashboard/alertas", rotulo: "Alertas", Icone: Bell },
      { href: "/dashboard/relatorios", rotulo: "Relatórios", Icone: FileText },
      { href: "/dashboard/perfil-investidor", rotulo: "Perfil de investidor", Icone: TrendingUp },
    ],
  },
  {
    rotulo: "conta",
    itens: [
      { href: "/dashboard/perfil", rotulo: "Perfil", Icone: UserRound },
      { href: "/dashboard/seguranca", rotulo: "Segurança", Icone: ShieldCheck },
      { href: "/dashboard/configuracoes", rotulo: "Configurações", Icone: Settings },
    ],
  },
  {
    rotulo: "suporte",
    itens: [{ href: "/dashboard/ajuda", rotulo: "Ajuda ou suporte", Icone: LifeBuoy }],
  },
];

const ITENS_SECUNDARIOS: ItemSecundario[] = GRUPOS_SECUNDARIOS.flatMap((grupo) => grupo.itens);

export function NavPrincipal({ metas = [] }: { metas?: MetaParaVincular[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [registrando, setRegistrando] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erroSair, setErroSair] = useState("");

  // Mês/ano em visualização seguem o usuário pela navegação (e alimentam o Registrar)
  const agora = new Date();
  const ano = Number(params.get("ano")) || agora.getFullYear();
  const mes = Number(params.get("mes")) || agora.getMonth() + 1;
  const query = params.get("ano") && params.get("mes") ? `?ano=${ano}&mes=${mes}` : "";

  function estaAtivo(item: ItemNav) {
    return item.ativoEm.some((base) => (base === "/dashboard" ? pathname === base : pathname.startsWith(base)));
  }

  async function handleSair() {
    setErroSair("");
    setSaindo(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErroSair("Não foi possível sair. Tente novamente.");
      setSaindo(false);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  function ItemLink({ href, rotulo, Icone, ativo }: { href: string; rotulo: string; Icone: LucideIcon; ativo?: boolean }) {
    return (
      <Link href={`${href}${query}`} className={`nav-item ${ativo ? "ativo" : ""}`} onClick={() => setMaisAberto(false)}>
        <Icone size={20} aria-hidden="true" /> {rotulo}
      </Link>
    );
  }

  return (
    <>
      <nav className="nav-principal" aria-label="Navegação principal">
        <div className="nav-marca">
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            Fin<span style={{ color: "var(--verde)" }}>Clara</span>
          </span>
        </div>

        <ItemLink {...ITENS_PRINCIPAIS[0]} ativo={estaAtivo(ITENS_PRINCIPAIS[0])} />
        <ItemLink {...ITENS_PRINCIPAIS[1]} ativo={estaAtivo(ITENS_PRINCIPAIS[1])} />

        <button type="button" className="nav-registrar" onClick={() => setRegistrando(true)} aria-haspopup="dialog">
          <Plus size={26} aria-hidden="true" />
          <span className="nav-so-desktop">Registrar</span>
        </button>

        <ItemLink {...ITENS_CONTAS} ativo={estaAtivo(ITENS_CONTAS)} />

        {/* Mobile: os itens secundários ficam atrás de "Mais" */}
        <button
          type="button"
          className="nav-item nav-so-mobile"
          onClick={() => setMaisAberto(true)}
          aria-haspopup="dialog"
          aria-expanded={maisAberto}
        >
          <Menu size={20} aria-hidden="true" /> Mais
        </button>

        {/* Desktop: itens secundários expandidos na sidebar, agrupados por tema */}
        <div className="nav-divisor" />
        {GRUPOS_SECUNDARIOS.map((grupo, i) => (
          <Fragment key={grupo.rotulo}>
            {i > 0 && <div className="nav-divisor" />}
            {grupo.itens.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item nav-so-desktop ${pathname.startsWith(item.href) ? "ativo" : ""}`}
              >
                <item.Icone size={18} aria-hidden="true" /> {item.rotulo}
              </Link>
            ))}
          </Fragment>
        ))}
        <button type="button" className="nav-item nav-so-desktop" onClick={handleSair} disabled={saindo} style={{ color: "var(--vermelho)" }}>
          {saindo ? <Loader2 size={18} className="icone-carregando" aria-hidden="true" /> : <LogOut size={18} aria-hidden="true" />}
          {saindo ? "Saindo..." : "Sair"}
        </button>
        {erroSair && (
          <p role="alert" className="nav-so-desktop" style={{ color: "var(--vermelho)", fontSize: 12, margin: "4px 12px" }}>
            {erroSair}
          </p>
        )}
      </nav>

      {/* Folha "Mais" (mobile) */}
      <FolhaFormulario titulo="Mais" aberta={maisAberto} aoFechar={() => setMaisAberto(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {GRUPOS_SECUNDARIOS.map((grupo, i) => (
            <Fragment key={grupo.rotulo}>
              {i > 0 && <div className="menu-usuario-divisor" />}
              {grupo.itens.map((item) => (
                <Link key={item.href} href={item.href} className="menu-usuario-item" onClick={() => setMaisAberto(false)}>
                  <item.Icone size={16} aria-hidden="true" /> {item.rotulo}
                </Link>
              ))}
            </Fragment>
          ))}
          <div className="menu-usuario-divisor" />
          <button
            type="button"
            className="menu-usuario-item menu-usuario-item-perigo"
            onClick={handleSair}
            disabled={saindo}
          >
            {saindo ? <Loader2 size={16} className="icone-carregando" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
            {saindo ? "Saindo..." : "Sair"}
          </button>
          {erroSair && (
            <p role="alert" style={{ color: "var(--vermelho)", fontSize: 12, padding: "0 12px", margin: "6px 0 2px" }}>
              {erroSair}
            </p>
          )}
        </div>
      </FolhaFormulario>

      {/* Folha do Registrar — disponível em qualquer tela do dashboard */}
      <FolhaFormulario titulo="Registrar" aberta={registrando} aoFechar={() => setRegistrando(false)}>
        <FormLancamento key={`${ano}-${mes}-${registrando}`} ano={ano} mes={mes} metas={metas} semCard aoSalvar={() => setRegistrando(false)} />
      </FolhaFormulario>
    </>
  );
}
