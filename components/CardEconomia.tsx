import { PartyPopper, PiggyBank } from "lucide-react";
import { formatarMoeda } from "@/lib/formatos";

type Props = {
  totalReceitas: number;
  totalInvestimentos: number;
};

// Quanto da renda o usuário JÁ guardou/investiu este mês (retrospectivo), celebrando o esforço
// e ancorando na meta saudável de 20% da regra 50/30/20. Tom sempre sugestivo, nunca de culpa
// (ver skill consultor-financeiro). Complementa o CardSobra, que fala do que ainda dá pra guardar.
export function CardEconomia({ totalReceitas, totalInvestimentos }: Props) {
  // Só aparece quando houve renda e algo foi de fato guardado no mês — senão vira ruído.
  if (totalReceitas <= 0 || totalInvestimentos <= 0) return null;

  const percentual = Math.round((totalInvestimentos / totalReceitas) * 100);
  const grau = Math.min(percentual, 100) * 3.6;

  const celebrar = percentual >= 20;
  const mensagem = celebrar
    ? `Excelente! Você guardou ${percentual}% do que entrou — dentro da meta saudável de 20%.`
    : percentual >= 10
      ? `Muito bom! Você já guardou ${percentual}% dos seus ganhos. Chegar perto de 20% deixa sua reserva mais forte.`
      : `Bom começo! Você guardou ${percentual}% do que entrou. Aumentar aos poucos já faz diferença.`;

  return (
    <div className="card">
      <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {celebrar ? (
          <PartyPopper size={16} style={{ color: "var(--verde)" }} aria-hidden="true" />
        ) : (
          <PiggyBank size={16} style={{ color: "var(--verde)" }} aria-hidden="true" />
        )}
        Economia do mês
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            flexShrink: 0,
            background: `conic-gradient(var(--verde) ${grau}deg, var(--borda) 0)`,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "var(--card-bg)",
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--verde)",
            }}
          >
            {percentual}%
          </div>
        </div>

        <div>
          <div className="valor-sensivel" style={{ fontSize: 18, fontWeight: 700, color: "var(--verde)" }}>
            {formatarMoeda(totalInvestimentos)}
          </div>
          <p className="texto-secundario" style={{ fontSize: 12.5, margin: "4px 0 0", lineHeight: 1.45 }}>
            {mensagem}
          </p>
        </div>
      </div>
    </div>
  );
}
