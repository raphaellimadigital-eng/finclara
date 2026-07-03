import Link from "next/link";
import { Crown } from "lucide-react";

// Mostrado no lugar da mensagem de erro genérica quando uma Server Action bloqueia a ação por
// causa do plano (ver lib/assinatura.ts:mensagemPaywall). `mensagem` já vem sem o prefixo
// PAYWALL:.
export function PromptUpgrade({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        fontSize: 13,
        background: "var(--amarelo-clara)",
        border: "1px solid var(--amarelo)",
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 10,
        color: "var(--amarelo-texto)",
      }}
    >
      <Crown size={16} style={{ color: "var(--amarelo-texto)", flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <span>
        {mensagem}{" "}
        <Link href="/dashboard/assinatura" style={{ fontWeight: 600, textDecoration: "underline" }}>
          Assine o Pro
        </Link>
      </span>
    </div>
  );
}
