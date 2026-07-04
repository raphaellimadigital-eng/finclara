"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { formatarMoeda } from "@/lib/formatos";

const TEXTO_INFO =
  "O que você juntou nas metas menos o que ainda deve. Um retrato é salvo automaticamente por mês, toda vez que você abre o app. O gráfico aparece a partir do segundo mês registrado.";

const NOME_MES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type Ponto = { ano: number; mes: number; patrimonio: number };

export function GraficoEvolucaoPatrimonial({ historico }: { historico: Ponto[] }) {
  // Com menos de dois meses de histórico não há evolução para mostrar — melhor não ocupar
  // espaço nobre do dashboard com um card vazio (o retrato mensal segue sendo salvo).
  if (historico.length < 2) return null;

  const dados = historico.map((p) => ({
    label: `${NOME_MES_ABREV[p.mes - 1]}/${String(p.ano).slice(2)}`,
    patrimonio: p.patrimonio,
  }));

  const ultimo = historico[historico.length - 1].patrimonio;
  const corLinha = ultimo >= 0 ? "var(--verde)" : "var(--vermelho)";

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={16} aria-hidden="true" /> Seu dinheiro ao longo do tempo
        </span>
        <InfoTooltip texto={TEXTO_INFO} />
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 14 }}>
        O que você juntou nas metas menos as dívidas, mês a mês.
      </p>

      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={dados} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientePatrimonio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={corLinha} stopOpacity={0.3} />
                <stop offset="95%" stopColor={corLinha} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--borda)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => formatarMoeda(Number(v))} labelStyle={{ color: "#111827" }} />
            <Area type="monotone" dataKey="patrimonio" stroke={corLinha} strokeWidth={2} fill="url(#gradientePatrimonio)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 8, textAlign: "right" }}>
        <span className="texto-secundario" style={{ fontSize: 12 }}>Hoje: </span>
        <strong style={{ color: corLinha }}>{formatarMoeda(ultimo)}</strong>
      </div>
    </div>
  );
}
