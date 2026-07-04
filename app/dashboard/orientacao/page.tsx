import Link from "next/link";
import { ChevronLeft, Compass, AlertTriangle, PiggyBank, TrendingUp } from "lucide-react";
import { getLancamentos } from "../actions";
import { getDividas } from "../dividas/actions";
import { getMetas } from "../metas/actions";
import { getUsuarioAtual } from "../perfil/actions";
import { CATEGORIAS_ESSENCIAIS } from "@/lib/financas";
import { temDividaCara } from "@/lib/dividas";
import { calcularOrientacao, MESES_MINIMOS_RESERVA, MESES_IDEAL_RESERVA } from "@/lib/orientacao";
import { DisclaimerFinanceiro } from "@/components/DisclaimerFinanceiro";
import { AvisoMesVisualizado } from "@/components/AvisoMesVisualizado";
import { formatarMoeda } from "@/lib/formatos";

const ICONE_PRIORIDADE = {
  QUITAR_DIVIDA: AlertTriangle,
  FORMAR_RESERVA: PiggyBank,
  INVESTIR: TrendingUp,
} as const;

const COR_PRIORIDADE = {
  QUITAR_DIVIDA: "var(--vermelho)",
  FORMAR_RESERVA: "var(--amarelo)",
  INVESTIR: "var(--verde)",
} as const;

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function OrientacaoPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const [lancamentos, dividas, metas, usuario] = await Promise.all([
    getLancamentos(ano, mes),
    getDividas(),
    getMetas(),
    getUsuarioAtual(),
  ]);

  const essenciaisMensal = lancamentos
    .filter((l) => l.tipo === "DESPESA" && CATEGORIAS_ESSENCIAIS.includes(l.categoria))
    .reduce((s, l) => s + Number(l.valor), 0);

  const reservaAtual = metas
    .filter((m) => m.tipo === "RESERVA")
    .reduce((s, m) => s + Number(m.valorAtual), 0);

  const orientacao = calcularOrientacao({
    temDividaCara: temDividaCara(dividas),
    reservaAtual,
    essenciaisMensal,
    perfilInvestidor: usuario.perfilInvestidor,
  });

  const Icone = ICONE_PRIORIDADE[orientacao.prioridade];
  const cor = COR_PRIORIDADE[orientacao.prioridade];
  const percentualAteIdeal =
    orientacao.reservaAlvoIdeal > 0 ? Math.min((orientacao.reservaAtual / orientacao.reservaAlvoIdeal) * 100, 100) : 0;
  const marcaPrimeiroObjetivo =
    orientacao.reservaAlvoIdeal > 0 ? (orientacao.reservaAlvo / orientacao.reservaAlvoIdeal) * 100 : 0;
  const primeiroObjetivoAtingido = orientacao.reservaAtual >= orientacao.reservaAlvo;

  return (
    <div className="container">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <Compass size={20} aria-hidden="true" /> Sua prioridade agora
      </h1>

      <AvisoMesVisualizado ano={ano} mes={mes} baseHref="/dashboard/orientacao" />

      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <span
            style={{
              width: 36, height: 36, minWidth: 36, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center", background: "var(--fundo)",
            }}
          >
            <Icone size={18} style={{ color: cor }} aria-hidden="true" />
          </span>
          <div>
            <h2 className="card-title" style={{ margin: 0, color: cor }}>{orientacao.titulo}</h2>
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{orientacao.explicacao}</p>

        <div style={{ marginTop: 16 }}>
          <div className="texto-secundario" style={{ marginBottom: 4 }}>
            Reserva de emergência: {formatarMoeda(orientacao.reservaAtual)} de {formatarMoeda(orientacao.reservaAlvo)}
            {" "}(primeiro objetivo, {MESES_MINIMOS_RESERVA} meses) · ideal {formatarMoeda(orientacao.reservaAlvoIdeal)}
            {" "}({MESES_IDEAL_RESERVA} meses)
          </div>
          <div className="barra-fundo" style={{ position: "relative" }}>
            <div
              className="barra-preenchimento"
              style={{ width: `${percentualAteIdeal}%`, background: primeiroObjetivoAtingido ? "var(--verde)" : "var(--amarelo)" }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${marcaPrimeiroObjetivo}%`,
                width: 2,
                background: "var(--texto)",
                opacity: 0.4,
              }}
            />
          </div>
          {orientacao.reservaAlvo === 0 && (
            <p className="texto-secundario" style={{ fontSize: 11.5, marginTop: 4 }}>
              Registre despesas essenciais neste mês para calcular sua meta de reserva.
            </p>
          )}
        </div>

        <DisclaimerFinanceiro />
      </div>

      <p className="texto-secundario" style={{ fontSize: 12.5 }}>
        Essa orientação segue a prioridade: quitar dívidas caras → formar reserva de emergência
        (de {MESES_MINIMOS_RESERVA} a {MESES_IDEAL_RESERVA} meses de gastos essenciais) → investir
        conforme seu perfil. Vincule uma meta do tipo &quot;Reserva de emergência&quot; e registre
        aportes nela para essa tela ficar mais precisa.
      </p>
    </div>
  );
}
