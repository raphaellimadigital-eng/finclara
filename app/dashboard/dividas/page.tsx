import Link from "next/link";
import { ChevronLeft, Landmark } from "lucide-react";
import { getDividas } from "./actions";
import { FormDivida } from "@/components/FormDivida";
import { ListaDividas } from "@/components/ListaDividas";
import { RevelarFormulario } from "@/components/RevelarFormulario";
import { totalDevedor, totalParcelasMensais, temDividaCara } from "@/lib/dividas";
import { formatarMoeda } from "@/lib/formatos";

export default async function DividasPage() {
  const dividas = await getDividas();
  const dividasAtivas = dividas.filter((d) => !d.quitada);
  const devedor = totalDevedor(dividasAtivas);
  const parcelas = totalParcelasMensais(dividasAtivas);
  const possuiCara = temDividaCara(dividasAtivas);

  return (
    <div className="container">
      <Link
        href="/dashboard/contas"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 4 }}>
        <Landmark size={20} aria-hidden="true" /> Dívidas
      </h1>
      <p className="texto-secundario" style={{ fontSize: 12.5, marginBottom: 16 }}>
        Use esta tela para dívidas que não são de cartão: empréstimo, financiamento, dívida com
        alguém etc. Compra parcelada no cartão já é controlada em Cartões.
      </p>

      {/* Situação primeiro: resumo e lista; o cadastro fica recolhido atrás do botão */}
      {dividasAtivas.length > 0 && (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="texto-secundario">Quanto você ainda deve</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--vermelho)" }}>
                {formatarMoeda(devedor)}
              </div>
            </div>
            <div>
              <div className="texto-secundario">Parcelas por mês</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatarMoeda(parcelas)}</div>
            </div>
          </div>
          {possuiCara && (
            <p className="texto-secundario" style={{ fontSize: 12.5, marginTop: 12, marginBottom: 0, color: "var(--vermelho)" }}>
              Você tem dívida com juros altos. Priorizar quitá-la pode liberar sua renda mais rápido.
            </p>
          )}
        </div>
      )}

      <ListaDividas dividas={dividas} />

      <RevelarFormulario rotulo="Adicionar dívida">
        <FormDivida />
      </RevelarFormulario>
    </div>
  );
}
