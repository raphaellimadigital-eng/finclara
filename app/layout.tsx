import { Inter } from "next/font/google";
import Script from "next/script";
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
  themeColor: "#1f3f75",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <Script id="tema-init" strategy="beforeInteractive">
          {TEMA_INIT_SCRIPT}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
