"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

const TEXTO_INFO =
  "Metas acumuladas menos dívidas ativas. Um retrato é salvo automaticamente por mês, toda vez que você abre o app. O gráfico aparece a partir do segundo mês registrado.";

const NOME_MES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Ponto = { ano: number; mes: number; patrimonio: number };

export function GraficoEvolucaoPatrimonial({ historico }: { historico: Ponto[] }) {
  if (historico.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={16} aria-hidden="true" /> Evolução patrimonial
          </span>
          <InfoTooltip texto={TEXTO_INFO} />
        </h2>
        <p className="texto-secundario" style={{ margin: 0 }}>
          Ainda não há dados suficientes. O FinClara passa a registrar um retrato do seu
          patrimônio (metas acumuladas menos dívidas) a cada mês que você acessa o app.
        </p>
      </div>
    );
  }

  if (historico.length === 1) {
    return (
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={16} aria-hidden="true" /> Evolução patrimonial
          </span>
          <InfoTooltip texto={TEXTO_INFO} />
        </h2>
        <div style={{ fontSize: 22, fontWeight: 700, color: historico[0].patrimonio >= 0 ? "var(--verde)" : "var(--vermelho)" }}>
          {formatarMoeda(historico[0].patrimonio)}
        </div>
        <p className="texto-secundario" style={{ marginBottom: 0 }}>
          Esse é o primeiro mês registrado. Volte no próximo mês para começar a ver o gráfico de
          evolução.
        </p>
      </div>
    );
  }

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
          <TrendingUp size={16} aria-hidden="true" /> Evolução patrimonial
        </span>
        <InfoTooltip texto={TEXTO_INFO} />
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 14 }}>
        Metas acumuladas menos dívidas, mês a mês.
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
        <span className="texto-secundario" style={{ fontSize: 12 }}>Patrimônio atual: </span>
        <strong style={{ color: corLinha }}>{formatarMoeda(ultimo)}</strong>
      </div>
    </div>
  );
}
