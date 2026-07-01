import { Wallet } from "lucide-react";

type Props = { size?: number };

// Marca da FinClara.
// Quando o arquivo public/logo.svg estiver disponível, troque o conteúdo do
// <span> abaixo por: <img src="/logo.svg" alt="FinClara" width={size} height={size} />
export function Logo({ size = 32 }: Props) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size * 0.28,
        background: "var(--azul)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Wallet size={size * 0.58} color="#fff" strokeWidth={2} />
    </span>
  );
}
