type Props = { size?: number };

// Marca da FinClara: "C" (de FinClara) + linha de gráfico ascendente + brilho de clareza,
// em gradiente azul -> ciano. Usa as variáveis de tema (--azul, --marca-ciano) para o gradiente
// acompanhar o resto do app; a linha do gráfico usa um verde bandeira fixo (mais escuro/saturado
// que o --verde padrão), que se destaca melhor contra o gradiente do que o verde claro.
export function Logo({ size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 4 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="0" y="4" width="40" height="40" rx="12" fill="url(#finclara-logo-gradient)" />
      <path
        d="M25.5 15.5C23.9 14.5 22.1 14 20 14C14.5 14 10.5 18 10.5 24C10.5 30 14.5 34 20 34C22.1 34 23.9 33.5 25.5 32.5"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M17 27L21 23L24 26L30 19"
        stroke="#009c3b"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="18" r="2.2" fill="#DFFBFF" />
      <defs>
        <linearGradient id="finclara-logo-gradient" x1="0" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: "var(--azul)" }} />
          <stop offset="1" style={{ stopColor: "var(--marca-ciano)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
