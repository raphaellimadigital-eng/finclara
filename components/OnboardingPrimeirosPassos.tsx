"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, TrendingUp, TrendingDown, Target, Sparkles } from "lucide-react";
import { FolhaFormulario } from "@/components/FolhaFormulario";
import { FormLancamento } from "@/components/FormLancamento";

type Props = {
  temReceita: boolean;
  temDespesa: boolean;
  temMeta: boolean;
  ano: number;
  mes: number;
};

// Onboarding de primeiro uso: some sozinho assim que os três passos estiverem completos —
// não é uma etapa de configuração separada, é só um convite para o primeiro registro.
export function OnboardingPrimeirosPassos({ temReceita, temDespesa, temMeta, ano, mes }: Props) {
  const [abrindoReceita, setAbrindoReceita] = useState(false);
  const [abrindoDespesa, setAbrindoDespesa] = useState(false);

  if (temReceita && temDespesa && temMeta) return null;

  const concluidos = [temReceita, temDespesa, temMeta].filter(Boolean).length;
  const percentual = Math.round((concluidos / 3) * 100);

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={16} aria-hidden="true" /> Primeiros passos no FinClara
      </h2>
      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 12 }}>
        Três registros simples e seu dashboard já mostra um retrato real das suas finanças.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          className="barra-fundo"
          role="progressbar"
          aria-valuenow={percentual}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso dos primeiros passos"
          style={{ flex: 1 }}
        >
          <div className="barra-preenchimento" style={{ width: `${percentual}%`, background: "var(--verde)" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--verde)", minWidth: 34, textAlign: "right" }}>
          {percentual}%
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          onClick={() => !temReceita && setAbrindoReceita(true)}
          disabled={temReceita}
          className="botao-secundario"
          style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", textAlign: "left" }}
        >
          {temReceita ? (
            <CheckCircle2 size={18} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
          ) : (
            <Circle size={18} style={{ color: "var(--texto-secundario)", flexShrink: 0 }} aria-hidden="true" />
          )}
          <TrendingUp size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          Registre quanto entrou este mês
        </button>

        <button
          type="button"
          onClick={() => !temDespesa && setAbrindoDespesa(true)}
          disabled={temDespesa}
          className="botao-secundario"
          style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", textAlign: "left" }}
        >
          {temDespesa ? (
            <CheckCircle2 size={18} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
          ) : (
            <Circle size={18} style={{ color: "var(--texto-secundario)", flexShrink: 0 }} aria-hidden="true" />
          )}
          <TrendingDown size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          Registre um gasto de hoje
        </button>

        <Link
          href="/dashboard/metas"
          className="botao-secundario"
          style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", textDecoration: "none" }}
        >
          {temMeta ? (
            <CheckCircle2 size={18} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
          ) : (
            <Circle size={18} style={{ color: "var(--texto-secundario)", flexShrink: 0 }} aria-hidden="true" />
          )}
          <Target size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
          Crie sua primeira meta
        </Link>
      </div>

      <FolhaFormulario titulo="Registrar" aberta={abrindoReceita} aoFechar={() => setAbrindoReceita(false)}>
        <FormLancamento
          key={`onboarding-receita-${ano}-${mes}-${abrindoReceita}`}
          ano={ano}
          mes={mes}
          tipoInicial="RECEITA"
          semCard
          aoSalvar={() => setAbrindoReceita(false)}
        />
      </FolhaFormulario>

      <FolhaFormulario titulo="Registrar" aberta={abrindoDespesa} aoFechar={() => setAbrindoDespesa(false)}>
        <FormLancamento
          key={`onboarding-despesa-${ano}-${mes}-${abrindoDespesa}`}
          ano={ano}
          mes={mes}
          tipoInicial="DESPESA"
          semCard
          aoSalvar={() => setAbrindoDespesa(false)}
        />
      </FolhaFormulario>
    </div>
  );
}
