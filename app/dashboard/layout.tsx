import { Suspense } from "react";
import { BotaoPerguntaFlutuante } from "@/components/BotaoPerguntaFlutuante";
import { FaixaTrial } from "@/components/FaixaTrial";
import { NavPrincipal } from "@/components/NavPrincipal";
import { getStatusAssinatura } from "@/lib/auth";
import { diasRestantesTrial, trialAtivo } from "@/lib/assinatura";
import { getMetas } from "./metas/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [usuario, metas] = await Promise.all([getStatusAssinatura(), getMetas()]);

  return (
    <>
      {trialAtivo(usuario) && <FaixaTrial diasRestantes={diasRestantesTrial(usuario)} />}
      {/* Suspense: NavPrincipal usa useSearchParams para levar o mês em visualização consigo */}
      <Suspense>
        <NavPrincipal metas={metas.map((m) => ({ id: m.id, descricao: m.descricao }))} />
      </Suspense>
      <div className="conteudo-com-nav">{children}</div>
      <BotaoPerguntaFlutuante />
    </>
  );
}
