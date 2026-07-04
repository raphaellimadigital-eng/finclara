import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { TrocarSenha } from "@/components/TrocarSenha";
import { ConfiguracaoDoisFatores } from "@/components/ConfiguracaoDoisFatores";
import { ExportarExcluirDados } from "@/components/ExportarExcluirDados";

export default function SegurancaPage() {
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
        <ShieldCheck size={20} aria-hidden="true" /> Segurança
      </h1>

      <div className="dashboard-grid">
        <TrocarSenha />
        <ConfiguracaoDoisFatores />
        <ExportarExcluirDados />
      </div>
    </div>
  );
}
