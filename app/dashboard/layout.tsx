import { BotaoPerguntaFlutuante } from "@/components/BotaoPerguntaFlutuante";
import { FaixaTrial } from "@/components/FaixaTrial";
import { getStatusAssinatura } from "@/lib/auth";
import { diasRestantesTrial, trialAtivo } from "@/lib/assinatura";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getStatusAssinatura();

  return (
    <>
      {trialAtivo(usuario) && <FaixaTrial diasRestantes={diasRestantesTrial(usuario)} />}
      {children}
      <BotaoPerguntaFlutuante />
    </>
  );
}
