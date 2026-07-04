"use client";

import { useState } from "react";
import { PieChart as PieChartIcone, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { pedirRecomendacaoIA } from "@/app/dashboard/ai-actions";
import { DisclaimerFinanceiro } from "@/components/DisclaimerFinanceiro";
import { PromptUpgrade } from "@/components/PromptUpgrade";
import { InfoTooltip } from "@/components/InfoTooltip";
import { mensagemPaywall } from "@/lib/assinatura";
import { formatarMoeda } from "@/lib/formatos";
import type { Alocacao } from "@/lib/financas";

const TEXTO_INFO = [
  "Essenciais: gastos fixos necessários, como moradia, alimentação, transporte, saúde e educação.",
  "Gastos livres: gastos não essenciais, como lazer, assinaturas e outras despesas.",
  "Reserva: dinheiro guardado para imprevistos (reserva de emergência).",
  "Investimentos: aportes visando crescimento no longo prazo (tesouro direto, renda variável, outros).",
];

// Sobre fundo azul (botão), "Clara" em --verde não tem contraste suficiente no tema claro (fica
// quase ilegível) — nesse contexto usa branco puro, sem sombra, herdando a cor do botão.
function MarcaFinClara({ branco = false }: { branco?: boolean }) {
  if (branco) return <>FinClara</>;
  return (
    <span style={{ textShadow: "0 1px 4px rgba(0, 0, 0, 0.35)" }}>
      Fin<span style={{ color: "var(--verde)" }}>Clara</span>
    </span>
  );
}

// Cores do próprio tema do app (se adaptam a claro/escuro automaticamente, ao contrário de um
// hex fixo). Reserva usa o verde do tema e investimento a cor de investimento já usada no Resumo.
const CORES = {
  essenciais: "var(--azul)",
  desejos: "var(--amarelo)",
  reserva: "var(--verde)",
  investimento: "var(--investimento)",
};

export function GraficoAlocacao({ alocacao }: { alocacao: Alocacao }) {
  const { totalReceitas, atual, ideal, dicas } = alocacao;

  const [recomendacaoIA, setRecomendacaoIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");
  const [erroPaywallIA, setErroPaywallIA] = useState<string | null>(null);

  async function handlePedirIA() {
    setCarregandoIA(true);
    setErroIA("");
    setErroPaywallIA(null);
    try {
      const texto = await pedirRecomendacaoIA(alocacao);
      setRecomendacaoIA(texto);
    } catch (err: any) {
      const paywall = mensagemPaywall(err);
      if (paywall) setErroPaywallIA(paywall);
      else setErroIA(err.message || "Não foi possível gerar a sugestão agora.");
    } finally {
      setCarregandoIA(false);
    }
  }

  if (totalReceitas <= 0) {
    return (
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PieChartIcone size={16} aria-hidden="true" /> Para onde foi sua renda
        </h2>
        <p className="texto-secundario">
          Registre o que entrou neste mês para ver uma sugestão personalizada de quanto direcionar
          para gastos essenciais, gastos livres, reserva de emergência e investimentos.
        </p>
      </div>
    );
  }

  // Percentual sugerido para o rótulo de cada barra — mostra o alvo adaptado a esta renda, não
  // um 50/30/20 fixo (§5.1 da proposta).
  function pctSugerido(valorIdeal: number) {
    return totalReceitas > 0 ? Math.round((valorIdeal / totalReceitas) * 100) : 0;
  }

  const comparativos = [
    { label: `Essenciais (sugerido ${pctSugerido(ideal.essenciais)}%)`, atual: atual.essenciais, ideal: ideal.essenciais, cor: CORES.essenciais, tipo: "gasto" as const },
    { label: `Gastos livres (sugerido ${pctSugerido(ideal.desejos)}%)`, atual: atual.desejos, ideal: ideal.desejos, cor: CORES.desejos, tipo: "gasto" as const },
    { label: `Reserva de emergência (sugerido ${pctSugerido(ideal.reserva)}%)`, atual: atual.reserva, ideal: ideal.reserva, cor: CORES.reserva, tipo: "aporte" as const },
    { label: `Investimentos (sugerido ${pctSugerido(ideal.investimento)}%)`, atual: atual.investimento, ideal: ideal.investimento, cor: CORES.investimento, tipo: "aporte" as const },
  ];

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PieChartIcone size={16} aria-hidden="true" /> Para onde foi sua renda
        </span>
        <InfoTooltip texto={TEXTO_INFO} />
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 16 }}>
        As barras comparam o que você já gastou e guardou com uma sugestão para a sua renda
        do mês.
      </p>

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
            {tipoGrupo === "gasto" ? "Gastos" : "Guardado"}
          </div>

          {comparativos
            .filter((c) => c.tipo === tipoGrupo)
            .map((c) => {
              const percentual = c.ideal > 0 ? (c.atual / c.ideal) * 100 : 0;
              const excedeu = c.atual > c.ideal;
              const atingiuMeta = c.atual >= c.ideal;

              // Para gastos (essenciais/livres), passar do sugerido é sinal de atenção (vermelho).
              // Para o que é guardado (reserva/investimento), atingir ou passar é bom (verde).
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

      {/* Sugestão personalizada por IA — mora aqui porque analisa exatamente esta alocação */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        {!recomendacaoIA && (
          <button
            type="button"
            onClick={handlePedirIA}
            disabled={carregandoIA}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {carregandoIA ? (
              <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
            ) : (
              <Sparkles size={16} aria-hidden="true" />
            )}
            {carregandoIA ? (
              "Gerando sugestão..."
            ) : (
              <>
                Pedir sugestão personalizada da <MarcaFinClara branco />
              </>
            )}
          </button>
        )}

        {erroPaywallIA && <PromptUpgrade mensagem={erroPaywallIA} />}
        {erroIA && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginTop: 8 }}>{erroIA}</p>}

        {recomendacaoIA && (
          <div>
            <div className="texto-secundario" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Sparkles size={14} aria-hidden="true" /> Sugestão da <MarcaFinClara />
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{recomendacaoIA}</p>
            <DisclaimerFinanceiro />
          </div>
        )}
      </div>
    </div>
  );
}
