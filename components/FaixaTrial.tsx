import Link from "next/link";
import { Sparkles } from "lucide-react";

// Banner mostrado no topo do dashboard só durante o período de trial (ver
// app/dashboard/layout.tsx). Some sozinho quando o usuário assina o Pro ou quando o trial vence
// — depois disso quem avisa é o PromptUpgrade no momento em que uma feature é bloqueada, não um
// banner permanente incomodando quem já decidiu ficar no Free.
export function FaixaTrial({ diasRestantes }: { diasRestantes: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 13,
        padding: "8px 16px",
        background: "var(--amarelo-clara)",
        color: "var(--amarelo-texto)",
        borderBottom: "1px solid var(--amarelo)",
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <Sparkles size={14} aria-hidden="true" />
      Seu período de teste termina em {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"} — depois
      disso algumas funcionalidades ficam restritas ao plano Pro.
      <Link href="/dashboard/assinatura" style={{ fontWeight: 600, textDecoration: "underline" }}>
        Assinar agora
      </Link>
    </div>
  );
}
