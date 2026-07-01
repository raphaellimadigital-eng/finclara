"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export function BotaoSair() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSair}
      className="botao-secundario"
      aria-label="Sair da conta"
      style={{ display: "flex", alignItems: "center", gap: 4 }}
    >
      <LogOut size={14} aria-hidden="true" /> Sair
    </button>
  );
}
