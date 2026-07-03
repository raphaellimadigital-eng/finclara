"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, AlertTriangle, AlertOctagon, PiggyBank, CreditCard, Landmark, Target, Sparkles, Loader2 } from "lucide-react";
import type { PrioridadeOrientacao } from "@/lib/orientacao";
import type { Alocacao } from "@/lib/financas";
import { pedirRecomendacaoIA } from "@/app/dashboard/ai-actions";
import { DisclaimerFinanceiro } from "@/components/DisclaimerFinanceiro";

function MarcaFinClara() {
  return (
    <span style={{ textShadow: "0 1px 4px rgba(0, 0, 0, 0.35)" }}>
      Fin<span style={{ color: "var(--verde)" }}>Clara</span>
    </span>
  );
}

export type MetaResumo = {
  descricao: string;
  percentual: number;
  situacao: "concluida" | "atrasada" | "em_dia";
};

type Props = {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldo: number;
  parcelasCartaoMes: number;
  parcelasDividaMes: number;
  poupancaRecomendada: number;
  qtdCartoes: number;
  disponivelCartoes: number;
  qtdDividas: number;
  totalDevedor: number;
  metaPrincipal: MetaResumo | null;
  orientacaoPrioridade: PrioridadeOrientacao;
  alocacao: Alocacao;
};

// Para onde direcionar a sobra do mês, alinhado com o card de Orientação financeira logo
// abaixo, para não sugerir dois destinos diferentes para o mesmo dinheiro.
function destinoSobra(prioridade: PrioridadeOrientacao, metaPrincipal: MetaResumo | null): string {
  if (prioridade === "QUITAR_DIVIDA") {
    return "priorize usar esse valor para quitar dívidas caras: nenhum investimento supera esse retorno com segurança";
  }
  if (prioridade === "FORMAR_RESERVA") {
    return "priorize completar sua reserva de emergência antes de investir a longo prazo";
  }
  if (metaPrincipal && metaPrincipal.situacao !== "concluida") {
    return `considere aportar na meta "${metaPrincipal.descricao}" ou investir de acordo com seu perfil`;
  }
  return "considere investir de acordo com o seu perfil de investidor";
}

const COR_SITUACAO_META: Record<MetaResumo["situacao"], string> = {
  concluida: "var(--verde)",
  atrasada: "var(--vermelho)",
  em_dia: "var(--texto)",
};

const TEXTO_SITUACAO_META: Record<MetaResumo["situacao"], string> = {
  concluida: "concluída",
  atrasada: "atrasada",
  em_dia: "no prazo",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function situacaoFinanceira(percentualGasto: number) {
  if (percentualGasto >= 100) {
    return { classe: "critico", Icone: AlertOctagon, texto: "Gastos acima da renda", cor: "var(--vermelho)" };
  }
  if (percentualGasto >= 70) {
    return { classe: "atencao", Icone: AlertTriangle, texto: "Renda comprometida", cor: "var(--amarelo)" };
  }
  return { classe: "confortavel", Icone: CheckCircle2, texto: "Situação confortável", cor: "var(--verde)" };
}

export function Resumo({
  totalReceitas,
  totalDespesas,
  totalInvestimentos,
  saldo,
  parcelasCartaoMes,
  parcelasDividaMes,
  poupancaRecomendada,
  qtdCartoes,
  disponivelCartoes,
  qtdDividas,
  totalDevedor,
  metaPrincipal,
  orientacaoPrioridade,
  alocacao,
}: Props) {
  // Comprometimento da renda considera despesas do mês + faturas de cartão + parcelas de
  // dívidas (regra 9.1) — cartões e dívidas continuam sendo cadastrados à parte, mas entram
  // aqui para o indicador de risco refletir o compromisso financeiro real do mês.
  const totalComprometido = totalDespesas + parcelasCartaoMes + parcelasDividaMes;
  const percentualGasto =
    totalReceitas > 0 ? Math.round((totalComprometido / totalReceitas) * 100) : 0;

  const situacao = situacaoFinanceira(percentualGasto);
  const IconeSituacao = situacao.Icone;
  const temOutrosCompromissos = parcelasCartaoMes > 0 || parcelasDividaMes > 0;

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
      setErroIA(err.message || "Não foi possível gerar a sugestão agora.");
    } finally {
      setCarregandoIA(false);
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart3 size={16} aria-hidden="true" /> Resumo do mês
        </h2>
        <span className={`badge-saude ${situacao.classe}`}>
          <IconeSituacao size={14} aria-hidden="true" /> {situacao.texto}
        </span>
      </div>

      <div>
        <div className="texto-secundario" style={{ marginBottom: 4 }}>Saldo disponível</div>
        <div className={`saldo ${saldo >= 0 ? "positivo" : "negativo"}`}>
          {formatarMoeda(saldo)}
        </div>
        <div className="texto-secundario" style={{ fontSize: 11.5, marginTop: 2 }}>
          Receitas menos despesas e o que você já investiu. Ainda sem destino.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Receitas</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--verde)" }}>
            {formatarMoeda(totalReceitas)}
          </div>
        </div>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Despesas</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--vermelho)" }}>
            {formatarMoeda(totalDespesas)}
          </div>
        </div>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Investido</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--investimento)" }}>
            {formatarMoeda(totalInvestimentos)}
          </div>
        </div>
      </div>

      {/* Barra de comprometimento da renda */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        <div className="texto-secundario" style={{ marginBottom: 6 }}>
          Renda comprometida: <strong style={{ color: situacao.cor }}>{percentualGasto}%</strong>
        </div>
        <div className="barra-fundo" role="progressbar" aria-valuenow={percentualGasto} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="barra-preenchimento"
            style={{
              width: `${Math.min(percentualGasto, 100)}%`,
              background: situacao.cor,
            }}
          />
        </div>
        {temOutrosCompromissos && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11.5, marginTop: 6 }}>
            <span className="texto-secundario">Despesas: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(totalDespesas)}</strong></span>
            <span className="texto-secundario">Cartões: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(parcelasCartaoMes)}</strong></span>
            <span className="texto-secundario">Dívidas: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(parcelasDividaMes)}</strong></span>
          </div>
        )}
      </div>

      {/* Visão geral: cartões, dívidas e meta principal, integrados ao resumo do mês */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div>
            <div className="texto-secundario" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
              <CreditCard size={12} aria-hidden="true" /> Cartões
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {qtdCartoes === 0 ? "Nenhum" : `${formatarMoeda(disponivelCartoes)} disp.`}
            </div>
          </div>

          <div>
            <div className="texto-secundario" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
              <Landmark size={12} aria-hidden="true" /> Dívidas
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {qtdDividas === 0 ? "Nenhuma" : formatarMoeda(totalDevedor)}
            </div>
          </div>

          <div>
            <div className="texto-secundario" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
              <Target size={12} aria-hidden="true" /> Meta
            </div>
            {metaPrincipal ? (
              <div style={{ fontWeight: 700, fontSize: 14, color: COR_SITUACAO_META[metaPrincipal.situacao] }}>
                {Math.round(metaPrincipal.percentual)}% · {TEXTO_SITUACAO_META[metaPrincipal.situacao]}
              </div>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 14 }}>Nenhuma</div>
            )}
          </div>
        </div>

        <p className="texto-secundario" style={{ fontSize: 11, margin: "8px 0 0" }}>
          Cartões e dívidas não são descontados do saldo disponível acima; cada um tem sua própria tela.
        </p>
      </div>

      {poupancaRecomendada > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
          <div className="texto-secundario" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PiggyBank size={14} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
            Pode guardar com segurança
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--verde)", marginTop: 2 }}>
            {formatarMoeda(poupancaRecomendada)}
          </div>
          <div className="texto-secundario" style={{ fontSize: 11.5, marginTop: 2 }}>
            {destinoSobra(orientacaoPrioridade, metaPrincipal).replace(/^./, (c) => c.toUpperCase())}.
          </div>
        </div>
      )}

      {alocacao.totalReceitas > 0 && (
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
                  Pedir sugestão personalizada da <MarcaFinClara />
                </>
              )}
            </button>
          )}

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
      )}
    </div>
  );
}
