import Link from "next/link";
import { ChevronLeft, Landmark } from "lucide-react";
import { getDividas } from "./actions";
import { FormDivida } from "@/components/FormDivida";
import { ListaDividas } from "@/components/ListaDividas";
import { totalDevedor, totalParcelasMensais, temDividaCara } from "@/lib/dividas";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DividasPage() {
  const dividas = await getDividas();
  const devedor = totalDevedor(dividas);
  const parcelas = totalParcelasMensais(dividas);
  const possuiCara = temDividaCara(dividas);

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
        <Landmark size={20} aria-hidden="true" /> Dívidas
      </h1>

      {dividas.length > 0 && (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="texto-secundario">Saldo devedor total</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--vermelho)" }}>
                {formatarMoeda(devedor)}
              </div>
            </div>
            <div>
              <div className="texto-secundario">Parcelas mensais</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatarMoeda(parcelas)}</div>
            </div>
          </div>
          {possuiCara && (
            <p className="texto-secundario" style={{ fontSize: 12.5, marginTop: 12, marginBottom: 0, color: "var(--vermelho)" }}>
              Você tem dívida com juros altos. Priorize quitá-la antes de investir.
            </p>
          )}
        </div>
      )}

      <FormDivida />
      <ListaDividas dividas={dividas} />
    </div>
  );
}
