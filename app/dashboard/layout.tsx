import { BotaoPerguntaFlutuante } from "@/components/BotaoPerguntaFlutuante";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BotaoPerguntaFlutuante />
    </>
  );
}
