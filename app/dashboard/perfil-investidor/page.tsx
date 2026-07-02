import Link from "next/link";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { getUsuarioAtual } from "../perfil/actions";
import { QuestionarioPerfil } from "@/components/QuestionarioPerfil";
import { LABEL_PERFIL, DESCRICAO_PERFIL } from "@/lib/perfilInvestidor";

export default async function PerfilInvestidorPage() {
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
        <TrendingUp size={20} aria-hidden="true" /> Perfil de investidor
      </h1>

      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 16 }}>
        Essa avaliação mede sua tolerância a risco e seu horizonte de tempo — ela ajusta o tom da
        orientação financeira do FinClara, sem indicar produtos específicos nem prometer
        rentabilidade. Você pode refazer o questionário sempre que sua situação mudar.
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
