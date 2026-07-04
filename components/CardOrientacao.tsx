import Link from "next/link";
import { Compass, ChevronRight, AlertTriangle, PiggyBank, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/lib/formatos";
import type { Orientacao } from "@/lib/orientacao";

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

// A única voz do dashboard que fala de prioridade (quitar dívida cara → formar reserva →
// investir) — os demais cards apontam para cá em vez de repetir o mesmo aviso.
export function CardOrientacao({ orientacao }: { orientacao: Orientacao }) {
  const Icone = ICONE_PRIORIDADE[orientacao.prioridade];
  const cor = COR_PRIORIDADE[orientacao.prioridade];
  // A barra representa o objetivo ideal (6 meses) na largura toda, com uma marca no primeiro
  // objetivo (3 meses) — assim dá pra comemorar ao bater o primeiro alvo sem perder de vista
  // que o ideal é maior.
  const percentualAteIdeal =
    orientacao.reservaAlvoIdeal > 0 ? Math.min((orientacao.reservaAtual / orientacao.reservaAlvoIdeal) * 100, 100) : 0;
  const marcaPrimeiroObjetivo =
    orientacao.reservaAlvoIdeal > 0 ? (orientacao.reservaAlvo / orientacao.reservaAlvoIdeal) * 100 : 0;
  const primeiroObjetivoAtingido = orientacao.reservaAtual >= orientacao.reservaAlvo;

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Compass size={16} aria-hidden="true" /> Sua prioridade agora
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: cor, marginBottom: 6 }}>
        <Icone size={16} aria-hidden="true" /> {orientacao.titulo}
      </div>

      <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 12px" }}>{orientacao.explicacao}</p>

      {orientacao.reservaAlvoIdeal > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="texto-secundario" style={{ fontSize: 12.5, marginBottom: 4 }}>
            Reserva de emergência: {formatarMoeda(orientacao.reservaAtual)} de {formatarMoeda(orientacao.reservaAlvo)}{" "}
            (primeiro objetivo) · ideal {formatarMoeda(orientacao.reservaAlvoIdeal)}
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
        </div>
      )}

      <Link
        href="/dashboard/orientacao"
        className="texto-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
      >
        Ver detalhes <ChevronRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
