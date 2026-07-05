import { Inter } from "next/font/google";
import "./globals.css";

const TEMA_INIT_SCRIPT = `
(function () {
  try {
    var salvo = localStorage.getItem("finclara-theme");
    var tema = salvo || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = tema;
  } catch (e) {}
})();
`;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "FinClara",
  description: "Finanças simples, decisões claras.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinClara",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b8def",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Script inline puro (não next/script) de propósito: precisa rodar de forma síncrona
            antes da 1ª pintura pra evitar flash do tema errado, e o next/script com
            beforeInteractive tem um conflito conhecido com ferramentas que carregam a página via
            iframe (Cypress), gerando um falso positivo de erro de hidratação em toda página. */}
        <script dangerouslySetInnerHTML={{ __html: TEMA_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
