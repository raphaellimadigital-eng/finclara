import Link from "next/link";
import { Info } from "lucide-react";

// Banner mostrado no topo do dashboard sempre que o usuário não tem acesso completo e não está
// mais em trial (ver app/dashboard/layout.tsx) — cobre tanto o plano Free quanto uma assinatura
// PENDENTE presa (checkout iniciado mas o webhook do Mercado Pago ainda não confirmou). Sem isso,
// quem sai do trial só descobre que está limitado ao esbarrar num PromptUpgrade pontual, o que
// parece "perdi o acesso" em vez de "estou no plano Free".
export function FaixaPlanoLimitado({ pendente }: { pendente: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 13,
        padding: "8px 16px",
        background: "var(--azul-clara)",
        color: "var(--azul-escura)",
        borderBottom: "1px solid var(--azul)",
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <Info size={14} aria-hidden="true" />
      {pendente
        ? "Seu pagamento ainda está sendo confirmado — enquanto isso, seu acesso segue no plano Free."
        : "Você está no plano Free, com acesso limitado a algumas funcionalidades."}
      <Link href="/dashboard/assinatura" style={{ fontWeight: 600, textDecoration: "underline", color: "inherit" }}>
        {pendente ? "Ver detalhes" : "Conhecer o Pro"}
      </Link>
    </div>
  );
}
