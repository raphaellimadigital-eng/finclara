import { BarChart3, CheckCircle2, AlertTriangle, AlertOctagon, PiggyBank, CreditCard, Landmark, Target } from "lucide-react";

export type MetaResumo = {
  descricao: string;
  percentual: number;
  situacao: "concluida" | "atrasada" | "em_dia";
};

type Props = {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  parcelasCartaoMes: number;
  parcelasDividaMes: number;
  poupancaRecomendada: number;
  qtdCartoes: number;
  disponivelCartoes: number;
  qtdDividas: number;
  totalDevedor: number;
  metaPrincipal: MetaResumo | null;
};

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
  saldo,
  parcelasCartaoMes,
  parcelasDividaMes,
  poupancaRecomendada,
  qtdCartoes,
  disponivelCartoes,
  qtdDividas,
  totalDevedor,
  metaPrincipal,
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

      <div style={{ marginBottom: 16 }}>
        <div className="texto-secundario" style={{ marginBottom: 4 }}>Saldo disponível</div>
        <div className={`saldo ${saldo >= 0 ? "positivo" : "negativo"}`}>
          {formatarMoeda(saldo)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="texto-secundario">Receitas</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--verde)" }}>
            {formatarMoeda(totalReceitas)}
          </div>
        </div>
        <div>
          <div className="texto-secundario">Despesas</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--vermelho)" }}>
            {formatarMoeda(totalDespesas)}
          </div>
        </div>
      </div>

      {/* Barra de comprometimento da renda */}
      <div>
        <div className="texto-secundario" style={{ marginBottom: 4 }}>
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
          <div className="texto-secundario" style={{ fontSize: 11.5, marginTop: 4 }}>
            Despesas {formatarMoeda(totalDespesas)} + faturas de cartão {formatarMoeda(parcelasCartaoMes)} + parcelas de dívida {formatarMoeda(parcelasDividaMes)}
          </div>
        )}
      </div>

      {/* Visão geral: cartões, dívidas e meta principal, integrados ao resumo do mês */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid var(--borda)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 12,
        }}
      >
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

      {poupancaRecomendada > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--borda)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "var(--texto-secundario)",
          }}
        >
          <PiggyBank size={15} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
          Você pode guardar com segurança até <strong style={{ color: "var(--texto)" }}>{formatarMoeda(poupancaRecomendada)}</strong> este mês (renda menos despesas essenciais).
        </div>
      )}
    </div>
  );
}
