import Link from "next/link";
import { ChevronLeft, Settings, Compass, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LembreteDiario } from "@/components/LembreteDiario";

export default function ConfiguracoesPage() {
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
        <Settings size={20} aria-hidden="true" /> Configurações
      </h1>

      <div className="dashboard-grid">
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14.5 }}>Aparência</div>
            <div className="texto-secundario">Alternar entre modo claro e escuro</div>
          </div>
          <ThemeToggle />
        </div>

        <LembreteDiario />

        {/* Reabre o tour guiado do dashboard (?tour=1 é lido pelo TourPrimeirosPassos) */}
        <Link
          href="/dashboard?tour=1"
          className="card"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass size={18} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14.5 }}>Refazer tour guiado</div>
              <div className="texto-secundario">Rever a apresentação das principais funcionalidades</div>
            </div>
          </div>
          <ChevronRight size={18} className="texto-secundario" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
