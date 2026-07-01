"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcone, Lightbulb, Sparkles } from "lucide-react";
import { pedirRecomendacaoIA } from "@/app/dashboard/ai-actions";
import type { Alocacao } from "@/lib/financas";

// Cores da marca FinClara + um acento de apoio (investimento) que não conflita
// com os significados de receita (verde) e despesa (vermelho)
const CORES = {
  essenciais: "#1f3f75",
  desejos: "#f4b000",
  reserva: "#21873b",
  investimento: "#6d5dd3",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function GraficoAlocacao({ alocacao }: { alocacao: Alocacao }) {
  const { totalReceitas, atual, ideal, dicas } = alocacao;
  const [recomendacaoIA, setRecomendacaoIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");

  async function handlePedirIA() {
    setCarregandoIA(true);
    setErroIA("");
    try {
      const texto = await pedirRecomendacaoIA(alocacao);
      setRecomendacaoIA(texto);
    } catch (err: any) {
      setErroIA(err.message || "Não foi possível gerar a recomendação agora.");
    } finally {
      setCarregandoIA(false);
    }
  }

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
    { label: "Essenciais", atual: atual.essenciais, ideal: ideal.essenciais, cor: CORES.essenciais },
    { label: "Desejos", atual: atual.desejos, ideal: ideal.desejos, cor: CORES.desejos },
  ];

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PieChartIcone size={16} aria-hidden="true" /> Sugestão de alocação da renda
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 16 }}>
        Baseado na regra 50/30/20 aplicada à sua receita do mês.
      </p>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={dadosIdeal} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {dadosIdeal.map((d) => (
                <Cell key={d.nome} fill={d.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 8 }}>
        {comparativos.map((c) => {
          const percentual = c.ideal > 0 ? (c.atual / c.ideal) * 100 : 0;
          const estourou = c.atual > c.ideal;
          return (
            <div key={c.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{c.label}</span>
                <span style={{ color: estourou ? "var(--vermelho)" : "var(--verde)" }}>
                  {formatarMoeda(c.atual)} de {formatarMoeda(c.ideal)}
                </span>
              </div>
              <div className="barra-fundo">
                <div
                  className="barra-preenchimento"
                  style={{
                    width: `${Math.min(percentual, 100)}%`,
                    background: estourou ? "var(--vermelho)" : c.cor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dicas">
        {dicas.map((dica, i) => (
          <p key={i} className="dica-item">
            <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {dica}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        {!recomendacaoIA && (
          <button
            type="button"
            onClick={handlePedirIA}
            disabled={carregandoIA}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Sparkles size={16} aria-hidden="true" />
            {carregandoIA ? "Gerando recomendação..." : "Pedir recomendação personalizada (IA)"}
          </button>
        )}

        {erroIA && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginTop: 8 }}>{erroIA}</p>}

        {recomendacaoIA && (
          <div>
            <div className="texto-secundario" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Sparkles size={14} aria-hidden="true" /> Recomendação da IA
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{recomendacaoIA}</p>
          </div>
        )}
      </div>
    </div>
  );
}
