import Link from "next/link";
import { ChevronLeft, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConfiguracaoDoisFatores } from "@/components/ConfiguracaoDoisFatores";
import { ExportarExcluirDados } from "@/components/ExportarExcluirDados";

export default function ConfiguracoesPage() {
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
        <Settings size={20} aria-hidden="true" /> Configurações
      </h1>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14.5 }}>Aparência</div>
          <div className="texto-secundario">Alternar entre modo claro e escuro</div>
        </div>
        <ThemeToggle />
      </div>

      <ConfiguracaoDoisFatores />

      <ExportarExcluirDados />
    </div>
  );
}
