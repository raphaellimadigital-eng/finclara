import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUsuarioAtual } from "./actions";
import { FormDadosCadastrais } from "@/components/FormDadosCadastrais";
import { AssinaturaCard } from "@/components/AssinaturaCard";
import { LABEL_PERFIL } from "@/lib/perfilInvestidor";

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const usuario = await getUsuarioAtual();

  const criadoEm = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";

  return (
    <div className="container container-largo">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <UserRound size={20} aria-hidden="true" /> Perfil
      </h1>

      <div className="dashboard-grid">
        <AssinaturaCard usuario={usuario} />

        <FormDadosCadastrais
          email={user?.email ?? ""}
          criadoEm={criadoEm}
          nome={usuario.nome ?? ""}
          telefone={usuario.telefone ?? ""}
          endereco={usuario.endereco ?? ""}
          cpf={usuario.cpf ?? ""}
          dataNascimento={
            usuario.dataNascimento
              ? new Date(usuario.dataNascimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
              : ""
          }
          perfilInvestidor={usuario.perfilInvestidor ? LABEL_PERFIL[usuario.perfilInvestidor] : "Ainda não definido"}
        />
      </div>
    </div>
  );
}
