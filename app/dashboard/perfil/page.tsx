import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUsuarioAtual } from "./actions";
import { QuestionarioPerfil } from "@/components/QuestionarioPerfil";
import { LABEL_PERFIL, DESCRICAO_PERFIL } from "@/lib/perfilInvestidor";

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const usuario = await getUsuarioAtual();

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

      <div className="card">
        <div className="campo">
          <div className="rotulo">Nome</div>
          <div>{usuario.nome || "-"}</div>
        </div>
        <div className="campo">
          <div className="rotulo">E-mail</div>
          <div>{user?.email}</div>
        </div>
        <div className="campo">
          <div className="rotulo">Telefone</div>
          <div>{usuario.telefone || "-"}</div>
        </div>
        <div className="campo">
          <div className="rotulo">Endereço</div>
          <div>{usuario.endereco || "-"}</div>
        </div>
        <div className="campo" style={{ marginBottom: 0 }}>
          <div className="rotulo">Conta criada em</div>
          <div>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
              : "-"}
          </div>
        </div>
      </div>

      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 16 }}>
        Edição de nome, telefone e outros dados chega em breve.
      </p>

      {usuario.perfilInvestidor && (
        <div className="card">
          <div className="rotulo">Seu perfil de investidor atual</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {LABEL_PERFIL[usuario.perfilInvestidor]}
          </div>
          <p className="texto-secundario" style={{ margin: 0 }}>
            {DESCRICAO_PERFIL[usuario.perfilInvestidor]}
          </p>
        </div>
      )}

      <QuestionarioPerfil />
    </div>
  );
}
