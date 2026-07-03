"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2 } from "lucide-react";
import { excluirMeusDados } from "@/app/dashboard/seguranca/actions";
import { createClient } from "@/lib/supabase-browser";

export function ExportarExcluirDados() {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleExcluir() {
    const primeiraConfirmacao = confirm(
      "Isso vai apagar TODOS os seus lançamentos, dívidas, cartões, metas e limites. O login continua existindo, mas os dados não podem ser recuperados. Continuar?"
    );
    if (!primeiraConfirmacao) return;

    const segundaConfirmacao = confirm("Tem certeza mesmo? Essa ação é irreversível.");
    if (!segundaConfirmacao) return;

    setErro("");
    setExcluindo(true);
    try {
      await excluirMeusDados();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setErro("Não foi possível excluir seus dados. Tente novamente.");
      setExcluindo(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Seus dados</h2>
      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 14 }}>
        Você pode exportar todos os seus dados financeiros a qualquer momento, ou excluí-los
        permanentemente (direitos garantidos pela LGPD).
      </p>

      <a
        href="/dashboard/exportar"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}
      >
        <Download size={16} aria-hidden="true" /> Baixar meus dados (JSON)
      </a>

      {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

      <button
        type="button"
        onClick={handleExcluir}
        disabled={excluindo}
        className="botao-perigo"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {excluindo ? <Loader2 size={16} className="icone-carregando" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
        {excluindo ? "Excluindo..." : "Excluir todos os meus dados"}
      </button>
    </div>
  );
}
