import { BarChart3, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { formatarMoeda } from "@/lib/formatos";

type Props = {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldo: number;
  parcelasCartaoMes: number;
  parcelasDividaMes: number;
};

function situacaoFinanceira(percentualGasto: number) {
  if (percentualGasto >= 100) {
    return { classe: "critico", Icone: AlertOctagon, texto: "Gastos acima da renda", cor: "var(--vermelho)" };
  }
  if (percentualGasto >= 70) {
    return { classe: "atencao", Icone: AlertTriangle, texto: "Renda comprometida", cor: "var(--amarelo)" };
  }
  return { classe: "confortavel", Icone: CheckCircle2, texto: "Situação confortável", cor: "var(--verde)" };
}

// Card principal do dashboard: uma ideia só — o fluxo do mês (sobrou/faltou, entrou, saiu,
// guardado e quanto da renda já tem dono). Cartões, dívidas e metas têm seus próprios cards.
export function Resumo({
  totalReceitas,
  totalDespesas,
  totalInvestimentos,
  saldo,
  parcelasCartaoMes,
  parcelasDividaMes,
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
  const faltou = saldo < 0;

  // Indicador de dívidas > 30% da renda (regra padrão do produto — ver skill consultor-financeiro):
  // destaca dentro da mesma barra em vez de repetir o aviso em outro lugar do dashboard.
  const totalDividasECartao = parcelasCartaoMes + parcelasDividaMes;
  const percentualDividas = totalReceitas > 0 ? (totalDividasECartao / totalReceitas) * 100 : 0;
  const dividasPesadas = percentualDividas > 30;

  return (
    <div className="card" data-tour="resumo">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart3 size={16} aria-hidden="true" /> Como está seu mês
        </h2>
        <span className={`badge-saude ${situacao.classe}`}>
          <IconeSituacao size={14} aria-hidden="true" /> {situacao.texto}
        </span>
      </div>

      <div>
        <div className="texto-secundario" style={{ marginBottom: 4 }}>
          {faltou ? "Faltou" : "Sobrou até agora"}
        </div>
        <div className={`saldo ${faltou ? "negativo" : "positivo"}`}>
          {formatarMoeda(Math.abs(saldo))}
        </div>
        <div className="texto-secundario" style={{ fontSize: 12.5, marginTop: 2 }}>
          {faltou
            ? "Este mês saiu mais do que entrou. Vamos ver juntos onde dá pra ajustar?"
            : "O que entrou, menos o que saiu e o que você já guardou."}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Entrou</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--verde)" }}>
            {formatarMoeda(totalReceitas)}
          </div>
        </div>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Saiu</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--vermelho)" }}>
            {formatarMoeda(totalDespesas)}
          </div>
        </div>
        <div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Guardado</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--investimento)" }}>
            {formatarMoeda(totalInvestimentos)}
          </div>
        </div>
      </div>

      {/* Barra de comprometimento da renda */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
        <div className="texto-secundario" style={{ marginBottom: 6 }}>
          Quanto da renda já tem dono: <strong style={{ color: situacao.cor }}>{percentualGasto}%</strong>
        </div>
        <div className="barra-fundo" role="progressbar" aria-valuenow={percentualGasto} aria-valuemin={0} aria-valuemax={100} style={{ position: "relative" }}>
          <div
            className="barra-preenchimento"
            style={{
              width: `${Math.min(percentualGasto, 100)}%`,
              background: situacao.cor,
            }}
          />
          {dividasPesadas && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: `${Math.min((totalDividasECartao / totalComprometido) * Math.min(percentualGasto, 100), 100)}%`,
                background: "var(--vermelho)",
                borderRadius: "0 999px 999px 0",
              }}
            />
          )}
        </div>
        {temOutrosCompromissos && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12.5, marginTop: 6 }}>
            <span className="texto-secundario">Gastos: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(totalDespesas)}</strong></span>
            <span className="texto-secundario">Cartões: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(parcelasCartaoMes)}</strong></span>
            <span className="texto-secundario">Dívidas: <strong style={{ color: "var(--texto)" }}>{formatarMoeda(parcelasDividaMes)}</strong></span>
          </div>
        )}
        {dividasPesadas && (
          <p style={{ fontSize: 12.5, color: "var(--vermelho)", marginTop: 6, display: "flex", alignItems: "flex-start", gap: 5 }}>
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            Suas dívidas estão pesando no orçamento ({Math.round(percentualDividas)}% da renda). Priorizar
            quitá-las pode liberar sua renda mais rápido.
          </p>
        )}
      </div>
    </div>
  );
}
