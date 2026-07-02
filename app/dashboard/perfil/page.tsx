import Link from "next/link";
import { ChevronLeft, ChevronRight, UserRound, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUsuarioAtual } from "./actions";
import { FormDadosCadastrais } from "@/components/FormDadosCadastrais";
import { LABEL_PERFIL } from "@/lib/perfilInvestidor";

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const usuario = await getUsuarioAtual();

  const criadoEm = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";

  return (
    <div className="container">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <UserRound size={20} aria-hidden="true" /> Dados cadastrais
      </h1>

      <FormDadosCadastrais
        email={user?.email ?? ""}
        criadoEm={criadoEm}
        nome={usuario.nome ?? ""}
        telefone={usuario.telefone ?? ""}
        endereco={usuario.endereco ?? ""}
      />

      <Link
        href="/dashboard/perfil-investidor"
        className="card"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TrendingUp size={18} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>Perfil de investidor</div>
            <div className="texto-secundario" style={{ fontSize: 12 }}>
              {usuario.perfilInvestidor ? LABEL_PERFIL[usuario.perfilInvestidor] : "Ainda não definido"}
            </div>
          </div>
        </div>
        <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
      </Link>
    </div>
  );
}
