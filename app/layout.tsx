import { Inter } from "next/font/google";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
