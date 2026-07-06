"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { calcularAporteNecessario, OPCOES_INVESTIMENTO, type TipoInvestimento } from "@/lib/simulador";
import { formatarMoeda } from "@/lib/formatos";

const DIA_MS = 1000 * 60 * 60 * 24;

export function SimuladorAporteMeta({
  valorAtual,
  valorAlvo,
  prazo,
}: {
  valorAtual: number;
  valorAlvo: number;
  prazo: Date;
}) {
  const [tipoInvestimento, setTipoInvestimento] = useState<TipoInvestimento>("TESOURO_SELIC");

  const meses = Math.round((new Date(prazo).getTime() - Date.now()) / (DIA_MS * 30));

  const resultado = useMemo(
    () => calcularAporteNecessario({ valorAtual, valorAlvo, meses, tipoInvestimento }),
    [valorAtual, valorAlvo, meses, tipoInvestimento]
  );

  const linkSimulador = `/dashboard/simulador?valorInicial=${valorAtual}&aporteMensal=${
    resultado.possivel ? Math.ceil(resultado.aporteMensal) : 0
  }&meses=${Math.max(meses, 1)}&tipo=${tipoInvestimento}`;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <label className="texto-secundario" style={{ fontSize: 11.5 }} htmlFor="tipo-investimento-meta">
          Simular investindo em
        </label>
        <select
          id="tipo-investimento-meta"
          value={tipoInvestimento}
          onChange={(e) => setTipoInvestimento(e.target.value as TipoInvestimento)}
          style={{ fontSize: 12, padding: "4px 8px", height: "auto", width: "auto" }}
        >
          {(Object.keys(OPCOES_INVESTIMENTO) as TipoInvestimento[]).map((tipo) => (
            <option key={tipo} value={tipo}>
              {OPCOES_INVESTIMENTO[tipo].rotulo}
            </option>
          ))}
        </select>
      </div>

      <p className="texto-secundario" style={{ fontSize: 11.5, marginBottom: 6 }}>
        {!resultado.possivel
          ? "Esta meta já venceu o prazo — ajuste a data para simular um aporte mensal."
          : resultado.aporteMensal <= 0
          ? "No ritmo atual, você já tem o suficiente para chegar à meta no prazo."
          : `Para chegar lá no prazo, considere aportar cerca de ${formatarMoeda(resultado.aporteMensal)} por mês.`}
      </p>

      <Link href={linkSimulador} className="texto-secundario" style={{ fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
        Ver simulação completa <ArrowRight size={12} aria-hidden="true" />
      </Link>
    </div>
  );
}
