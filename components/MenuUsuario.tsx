"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, UserRound, Settings, LifeBuoy, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export function MenuUsuario() {
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, []);

  async function handleSair() {
    setErro("");
    setSaindo(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErro("Não foi possível sair. Tente novamente.");
      setSaindo(false);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="botao-icone"
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Abrir menu do usuário"
        onClick={() => setAberto((v) => !v)}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {aberto && (
        <div role="menu" className="menu-usuario">
          <Link
            href="/dashboard/perfil"
            role="menuitem"
            className="menu-usuario-item"
            onClick={() => setAberto(false)}
          >
            <UserRound size={16} aria-hidden="true" /> Dados cadastrais
          </Link>
          <Link
            href="/dashboard/configuracoes"
            role="menuitem"
            className="menu-usuario-item"
            onClick={() => setAberto(false)}
          >
            <Settings size={16} aria-hidden="true" /> Configurações
          </Link>
          <Link
            href="/dashboard/ajuda"
            role="menuitem"
            className="menu-usuario-item"
            onClick={() => setAberto(false)}
          >
            <LifeBuoy size={16} aria-hidden="true" /> Ajuda ou suporte
          </Link>

          <div className="menu-usuario-divisor" />

          <button
            type="button"
            role="menuitem"
            className="menu-usuario-item menu-usuario-item-perigo"
            onClick={handleSair}
            disabled={saindo}
          >
            {saindo ? <Loader2 size={16} className="icone-carregando" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
            {saindo ? "Saindo..." : "Sair"}
          </button>

          {erro && (
            <p role="alert" style={{ color: "var(--vermelho)", fontSize: 12, padding: "0 12px", margin: "6px 0 2px" }}>
              {erro}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
