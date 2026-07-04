"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import type { PrioridadeOrientacao } from "@/lib/orientacao";
import { formatarMoeda } from "@/lib/formatos";
import { FolhaFormulario } from "@/components/FolhaFormulario";
import { FormLancamento, type MetaParaVincular } from "@/components/FormLancamento";

export type MetaResumo = {
  descricao: string;
  percentual: number;
  situacao: "concluida" | "atrasada" | "em_dia";
};

// Para onde direcionar a sobra do mês, alinhado com o card "Sua prioridade agora" — nunca
// sugerir dois destinos diferentes para o mesmo dinheiro. Linguagem sempre sugestiva.
function destinoSobra(prioridade: PrioridadeOrientacao, metaPrincipal: MetaResumo | null): string {
  if (prioridade === "QUITAR_DIVIDA") {
    return "Priorize usar esse valor para quitar dívidas caras: nenhum investimento supera esse retorno com segurança.";
  }
  if (prioridade === "FORMAR_RESERVA") {
    return "Priorize completar sua reserva de emergência antes de investir a longo prazo.";
  }
  if (metaPrincipal && metaPrincipal.situacao !== "concluida") {
    return `Considere guardar na meta "${metaPrincipal.descricao}" ou investir de acordo com seu perfil.`;
  }
  return "Considere investir de acordo com o seu perfil de investidor.";
}

type Props = {
  valor: number;
  prioridade: PrioridadeOrientacao;
  metaPrincipal: MetaResumo | null;
  metas?: MetaParaVincular[];
  ano: number;
  mes: number;
};

// Quanto dá para guardar com segurança neste mês (sobra já descontando cartão e dívida) e o
// botão que fecha o ciclo: ver a sobra → dar um destino a ela em dois toques.
export function CardSobra({ valor, prioridade, metaPrincipal, metas = [], ano, mes }: Props) {
  const [guardando, setGuardando] = useState(false);

  if (valor <= 0) return null;

  return (
    <div className="card">
      <div className="texto-secundario" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PiggyBank size={14} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
        Pode guardar este mês
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--verde)", marginTop: 2 }}>
        {formatarMoeda(valor)}
      </div>
      <p className="texto-secundario" style={{ fontSize: 12.5, margin: "4px 0 12px" }}>
        {destinoSobra(prioridade, metaPrincipal)}
      </p>

      <button
        type="button"
        onClick={() => setGuardando(true)}
        aria-haspopup="dialog"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <PiggyBank size={16} aria-hidden="true" /> Guardar agora
      </button>

      <FolhaFormulario titulo="Guardar dinheiro" aberta={guardando} aoFechar={() => setGuardando(false)}>
        <FormLancamento
          key={`sobra-${ano}-${mes}-${guardando}`}
          ano={ano}
          mes={mes}
          tipoInicial="INVESTIMENTO"
          valorInicial={valor}
          metas={metas}
          semCard
          aoSalvar={() => setGuardando(false)}
        />
      </FolhaFormulario>
    </div>
  );
}
