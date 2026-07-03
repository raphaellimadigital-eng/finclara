"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcone, Lightbulb, AlertTriangle } from "lucide-react";
import { DisclaimerFinanceiro } from "@/components/DisclaimerFinanceiro";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Alocacao } from "@/lib/financas";

const TEXTO_INFO = [
  "Essenciais: gastos fixos necessários, como moradia, alimentação, transporte, saúde e educação.",
  "Desejos: gastos não essenciais, como lazer, assinaturas e outras despesas.",
  "Reserva: dinheiro guardado para imprevistos (reserva de emergência).",
  "Investimentos: aportes visando crescimento no longo prazo (tesouro direto, renda variável, outros).",
];

// Cores do próprio tema do app (se adaptam a claro/escuro automaticamente, ao contrário de um
// hex fixo). Reserva usa o verde do tema e investimento a cor de investimento já usada no Resumo.
const CORES = {
  essenciais: "var(--azul)",
  desejos: "var(--amarelo)",
  reserva: "var(--verde)",
  investimento: "var(--investimento)",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function GraficoAlocacao({ alocacao }: { alocacao: Alocacao }) {
  const { totalReceitas, atual, ideal, dicas, temDividaCara } = alocacao;

  if (totalReceitas <= 0) {
    return (
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PieChartIcone size={16} aria-hidden="true" /> Sugestão de alocação da renda
        </h2>
        <p className="texto-secundario">
          Registre receitas neste mês para ver uma sugestão personalizada de quanto direcionar
          para gastos essenciais, desejos, reserva de emergência e investimentos.
        </p>
      </div>
    );
  }

  const dadosIdeal = [
    { nome: "Essenciais (50%)", valor: ideal.essenciais, cor: CORES.essenciais },
    { nome: "Desejos (30%)", valor: ideal.desejos, cor: CORES.desejos },
    { nome: "Reserva (10%)", valor: ideal.reserva, cor: CORES.reserva },
    { nome: "Investimentos (10%)", valor: ideal.investimento, cor: CORES.investimento },
  ];

  const comparativos = [
    { label: "Essenciais", atual: atual.essenciais, ideal: ideal.essenciais, cor: CORES.essenciais, tipo: "gasto" as const },
    { label: "Desejos", atual: atual.desejos, ideal: ideal.desejos, cor: CORES.desejos, tipo: "gasto" as const },
    { label: "Reserva de emergência", atual: atual.reserva, ideal: ideal.reserva, cor: CORES.reserva, tipo: "aporte" as const },
    { label: "Investimentos", atual: atual.investimento, ideal: ideal.investimento, cor: CORES.investimento, tipo: "aporte" as const },
  ];

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PieChartIcone size={16} aria-hidden="true" /> Sugestão de alocação da renda
        </span>
        <InfoTooltip texto={TEXTO_INFO} />
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 16 }}>
        Baseado na regra 50/30/20 aplicada à sua receita do mês. As barras comparam o ideal com o
        que você já lançou (gastos e aportes).
      </p>

      {temDividaCara && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            background: "var(--vermelho-clara)",
            color: "var(--vermelho)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          Você tem dívida com juros altos. Priorize quitá-la antes de investir.
        </div>
      )}

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={dadosIdeal} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {dadosIdeal.map((d) => (
                <Cell key={d.nome} fill={d.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
            <Legend verticalAlign="bottom" height={32} iconSize={9} wrapperStyle={{ fontSize: 11.5 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {(["gasto", "aporte"] as const).map((tipoGrupo, i) => (
        <div
          key={tipoGrupo}
          style={{
            marginTop: i === 0 ? 8 : 16,
            paddingTop: i === 0 ? 0 : 16,
            borderTop: i === 0 ? "none" : "1px solid var(--borda)",
          }}
        >
          <div className="texto-secundario" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
            {tipoGrupo === "gasto" ? "Gastos" : "Aportes"}
          </div>

          {comparativos
            .filter((c) => c.tipo === tipoGrupo)
            .map((c) => {
              const percentual = c.ideal > 0 ? (c.atual / c.ideal) * 100 : 0;
              const excedeu = c.atual > c.ideal;
              const atingiuMeta = c.atual >= c.ideal;

              // Para gastos (essenciais/desejos), passar do ideal é ruim (vermelho).
              // Para aportes (reserva/investimento), atingir ou passar do ideal é bom (verde).
              const corTexto =
                c.tipo === "gasto"
                  ? excedeu
                    ? "var(--vermelho)"
                    : "var(--verde)"
                  : atingiuMeta
                  ? "var(--verde)"
                  : "var(--texto-secundario)";
              const corBarra = c.tipo === "gasto" && excedeu ? "var(--vermelho)" : c.cor;

              return (
                <div key={c.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>{c.label}</span>
                    <span style={{ color: corTexto }}>
                      {formatarMoeda(c.atual)} de {formatarMoeda(c.ideal)}
                    </span>
                  </div>
                  <div className="barra-fundo">
                    <div
                      className="barra-preenchimento"
                      style={{
                        width: `${Math.min(percentual, 100)}%`,
                        background: corBarra,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      ))}

      <div className="dicas">
        {dicas.map((dica, i) => (
          <p key={i} className="dica-item" style={{ color: "var(--texto)" }}>
            <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {dica}
          </p>
        ))}
        <DisclaimerFinanceiro />
      </div>
    </div>
  );
}
