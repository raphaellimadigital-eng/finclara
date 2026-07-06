import Link from "next/link";
import { ChevronLeft, Calculator } from "lucide-react";
import { SimuladorInvestimento } from "@/components/SimuladorInvestimento";

export default function SimuladorPage() {
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
        <Calculator size={20} aria-hidden="true" /> Simulador de investimentos
      </h1>

      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 16 }}>
        Veja quanto seu dinheiro pode render com aportes mensais, comparando diferentes tipos de
        investimento. Os cálculos usam taxas de referência do mercado e servem para você ter uma
        ideia — não são uma promessa de rentabilidade.
      </p>

      <SimuladorInvestimento />
    </div>
  );
}
