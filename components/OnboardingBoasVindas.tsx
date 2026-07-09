"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PERGUNTAS_PERFIL } from "@/lib/perfilInvestidor";
import { salvarPerfilInvestidor } from "@/app/dashboard/perfil-investidor/actions";
import { EVENTO_INICIAR_TOUR, CHAVE_ONBOARDING_PERFIL_VISTO } from "@/components/TourPrimeirosPassos";

// Onboarding de boas-vindas em tela cheia (inspirado no fluxo do Mobills): uma tela de abertura
// + as perguntas de perfil de investidor, com barra "X de N" e a opção de pular. As respostas
// definem o perfil, que alimenta a orientação financeira do app. Ao concluir ou pular, entrega o
// bastão para o tour guiado do dashboard (EVENTO_INICIAR_TOUR), para os dois não brigarem.
export function OnboardingBoasVindas({ mostrar }: { mostrar: boolean }) {
  const router = useRouter();
  const total = PERGUNTAS_PERFIL.length;

  // etapa 0 = abertura; 1..total = perguntas
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [visivel, setVisivel] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!mostrar) return;
    setVisivel(localStorage.getItem(CHAVE_ONBOARDING_PERFIL_VISTO) !== "1");
  }, [mostrar]);

  function encerrar() {
    localStorage.setItem(CHAVE_ONBOARDING_PERFIL_VISTO, "1");
    setVisivel(false);
    // Passa a vez para o tour guiado do dashboard.
    window.dispatchEvent(new Event(EVENTO_INICIAR_TOUR));
  }

  function pular() {
    encerrar();
  }

  async function responder(valor: number) {
    const novas = [...respostas];
    novas[etapa - 1] = valor;
    setRespostas(novas);
    setErro("");

    if (etapa < total) {
      setEtapa(etapa + 1);
      return;
    }

    // Última pergunta respondida: calcula e salva o perfil, depois entrega para o tour.
    setSalvando(true);
    try {
      const dados = new FormData();
      novas.forEach((r, i) => dados.set(`pergunta${i}`, String(r)));
      await salvarPerfilInvestidor(dados);
      localStorage.setItem(CHAVE_ONBOARDING_PERFIL_VISTO, "1");
      setVisivel(false);
      router.refresh();
      window.dispatchEvent(new Event(EVENTO_INICIAR_TOUR));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar. Tente novamente.");
      setSalvando(false);
    }
  }

  if (!visivel) return null;

  const naAbertura = etapa === 0;
  const pergunta = naAbertura ? null : PERGUNTAS_PERFIL[etapa - 1];

  return (
    <div className="onboarding-tela" role="dialog" aria-modal="true" aria-label="Boas-vindas ao FinClara">
      <div className="onboarding-conteudo">
        {/* Cabeçalho: progresso + pular */}
        <div className="onboarding-topo">
          {naAbertura ? (
            <Logo />
          ) : (
            <div className="onboarding-progresso" aria-hidden="true">
              <div className="barra-fundo" style={{ width: 140 }}>
                <div className="barra-preenchimento" style={{ width: `${(etapa / total) * 100}%`, background: "var(--verde)" }} />
              </div>
              <span className="texto-secundario" style={{ fontSize: 13, fontWeight: 600 }}>{etapa} de {total}</span>
            </div>
          )}
          <button type="button" className="onboarding-pular" onClick={pular} disabled={salvando}>
            Pular
          </button>
        </div>

        {naAbertura ? (
          <div className="onboarding-abertura">
            <div className="onboarding-selo" aria-hidden="true">
              <Sparkles size={26} />
            </div>
            <h1 style={{ fontSize: 24, lineHeight: 1.2, margin: "0 0 10px" }}>
              Boas-vindas ao <span style={{ color: "var(--verde)" }}>FinClara</span>! 👋
            </h1>
            <p className="texto-secundario" style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 28px", maxWidth: 420 }}>
              Antes de começar, 3 perguntas rápidas para ajustar as sugestões ao seu jeito de lidar
              com o dinheiro. Leva menos de um minuto — e você pode pular se preferir.
            </p>
            <button type="button" onClick={() => setEtapa(1)} className="onboarding-comecar">
              Começar <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="onboarding-pergunta">
            <h2 style={{ fontSize: 20, lineHeight: 1.3, margin: "24px 0 20px" }}>{pergunta!.pergunta}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pergunta!.opcoes.map((o) => {
                const selecionada = respostas[etapa - 1] === o.valor;
                return (
                  <button
                    key={o.valor}
                    type="button"
                    onClick={() => responder(o.valor)}
                    disabled={salvando}
                    className={`onboarding-opcao ${selecionada ? "selecionada" : ""}`}
                  >
                    <span>{o.texto}</span>
                    {salvando && selecionada ? (
                      <Loader2 size={18} className="icone-carregando" aria-hidden="true" />
                    ) : (
                      <ChevronRight size={18} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
            {erro && (
              <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginTop: 16 }}>{erro}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
