import { Suspense } from "react";
import { BotaoPerguntaFlutuante } from "@/components/BotaoPerguntaFlutuante";
import { FaixaTrial } from "@/components/FaixaTrial";
import { FaixaPlanoLimitado } from "@/components/FaixaPlanoLimitado";
import { NavPrincipal } from "@/components/NavPrincipal";
import { TourPrimeirosPassos } from "@/components/TourPrimeirosPassos";
import { OnboardingBoasVindas } from "@/components/OnboardingBoasVindas";
import { getStatusAssinatura } from "@/lib/auth";
import { diasRestantesTrial, temAcessoCompleto, trialAtivo } from "@/lib/assinatura";
import { getMetas } from "./metas/actions";
import { getStatusPrimeirosPassos } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [usuario, metas, statusPrimeirosPassos] = await Promise.all([
    getStatusAssinatura(),
    getMetas(),
    getStatusPrimeirosPassos(),
  ]);
  const emTrial = trialAtivo(usuario);
  const onboardingCompleto =
    statusPrimeirosPassos.temReceita && statusPrimeirosPassos.temDespesa && statusPrimeirosPassos.temMeta;
  // Onboarding de perfil (tela cheia) só para quem ainda não definiu o perfil de investidor.
  const onboardingPerfilPendente = usuario.perfilInvestidor === null;

  return (
    <>
      {emTrial && <FaixaTrial diasRestantes={diasRestantesTrial(usuario)} />}
      {!emTrial && !temAcessoCompleto(usuario) && (
        <FaixaPlanoLimitado pendente={usuario.statusAssinatura === "PENDENTE"} />
      )}
      {/* Suspense: NavPrincipal usa useSearchParams para levar o mês em visualização consigo */}
      <Suspense>
        <NavPrincipal
          metas={metas.map((m) => ({ id: m.id, descricao: m.descricao }))}
          restringirMenu={!onboardingCompleto}
        />
      </Suspense>
      <div className="conteudo-com-nav">{children}</div>
      <BotaoPerguntaFlutuante />
      <OnboardingBoasVindas mostrar={onboardingPerfilPendente} />
      <TourPrimeirosPassos ativo={!onboardingCompleto} onboardingPerfilPendente={onboardingPerfilPendente} />
    </>
  );
}
