"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type PassoTour = { alvo: string; titulo: string; texto: string };

// Guarda no navegador que o usuário já viu (ou pulou) o tour, pra não repetir a cada login —
// diferente do progresso dos primeiros passos (esse é por conta, salvo no banco).
const CHAVE_TOUR_VISTO = "finclara-tour-primeiros-passos-visto";

// Evento para reabrir o tour sob demanda (banner "Começar" ou Configurações → "Refazer tour"),
// mesmo depois de já ter sido visto. Ver components/BannerGuia.tsx e a página de Configurações.
export const EVENTO_INICIAR_TOUR = "finclara:iniciar-tour";
// Emitido quando o tour é concluído ou pulado — o banner de guia escuta para sumir junto.
export const EVENTO_TOUR_ENCERRADO = "finclara:tour-encerrado";
// Marca no navegador que o onboarding de perfil (tela cheia) já foi visto/pulado. Compartilhada
// com OnboardingBoasVindas para o tour não começar por cima do onboarding no primeiro acesso.
export const CHAVE_ONBOARDING_PERFIL_VISTO = "finclara-onboarding-perfil-visto";

const PASSOS: PassoTour[] = [
  { alvo: "resumo", titulo: "Seu resumo do mês", texto: "Aqui você vê, em um só lugar, quanto entrou, quanto saiu e quanto sobrou." },
  { alvo: "registrar", titulo: "Registre por aqui", texto: "Toque em Registrar sempre que quiser lançar uma receita ou uma despesa." },
  { alvo: "prioridade", titulo: "Sua prioridade agora", texto: "O FinClara aponta o que faz mais sentido você fazer com o seu dinheiro primeiro." },
  { alvo: "metas", titulo: "Suas metas", texto: "Crie um objetivo (uma viagem, uma reserva) e acompanhe o progresso por aqui." },
];

// Tour guiado do primeiro acesso: destaca, em sequência, os elementos-chave do dashboard (ver
// atributos data-tour em Resumo, NavPrincipal, CardOrientacao e CardMetas). Só roda na home do
// dashboard, só enquanto os primeiros passos não foram concluídos, e só uma vez por navegador.
export function TourPrimeirosPassos({ ativo, onboardingPerfilPendente = false }: { ativo: boolean; onboardingPerfilPendente?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [passoAtual, setPassoAtual] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const [retangulo, setRetangulo] = useState<DOMRect | null>(null);
  const balaoRef = useRef<HTMLDivElement>(null);
  const [alturaBalao, setAlturaBalao] = useState(220);

  // Início automático no primeiro acesso: só na home, só enquanto o onboarding não terminou e
  // só uma vez por navegador.
  useEffect(() => {
    if (!ativo || pathname !== "/dashboard") return;
    if (typeof window === "undefined" || localStorage.getItem(CHAVE_TOUR_VISTO)) return;
    // Não começa por cima do onboarding de perfil (tela cheia): quando ele ainda vai aparecer,
    // é o próprio onboarding que dispara o tour ao ser concluído/pulado (EVENTO_INICIAR_TOUR).
    if (onboardingPerfilPendente && localStorage.getItem(CHAVE_ONBOARDING_PERFIL_VISTO) !== "1") return;
    setVisivel(true);
  }, [ativo, pathname, onboardingPerfilPendente]);

  // Início sob demanda: banner "Começar" (mesma página, via evento) ou link de Configurações
  // (outra rota, via ?tour=1). Ignora o "já visto" de propósito — o usuário pediu para rever.
  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (params.get("tour") === "1") {
      setPassoAtual(0);
      setVisivel(true);
    }
  }, [pathname, params]);

  useEffect(() => {
    function iniciar() {
      setPassoAtual(0);
      setVisivel(true);
    }
    window.addEventListener(EVENTO_INICIAR_TOUR, iniciar);
    return () => window.removeEventListener(EVENTO_INICIAR_TOUR, iniciar);
  }, []);

  // Ao trocar de passo, rola a página até deixar o elemento destacado no centro da tela — assim o
  // usuário não precisa procurar/rolar atrás do card. Fica separado do handler de scroll de
  // propósito (chamar scrollIntoView dentro dele criaria um laço). O balão acompanha o movimento
  // pelo listener de scroll abaixo. Elementos fixos (barra de navegação) já estão sempre à vista.
  useEffect(() => {
    if (!visivel) return;
    const elemento = document.querySelector(`[data-tour="${PASSOS[passoAtual].alvo}"]`);
    elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [visivel, passoAtual]);

  useEffect(() => {
    if (!visivel) return;

    function atualizarPosicao() {
      const passo = PASSOS[passoAtual];
      const elemento = document.querySelector(`[data-tour="${passo.alvo}"]`);
      setRetangulo(elemento ? elemento.getBoundingClientRect() : null);
    }

    atualizarPosicao();
    window.addEventListener("resize", atualizarPosicao);
    window.addEventListener("scroll", atualizarPosicao, true);
    return () => {
      window.removeEventListener("resize", atualizarPosicao);
      window.removeEventListener("scroll", atualizarPosicao, true);
    };
  }, [visivel, passoAtual]);

  // Mede a altura real do balão para posicioná-lo sem estourar a viewport (a estimativa fixa
  // errava no passo ancorado na navegação, jogando o balão para fora da tela). Só atualiza quando
  // muda de verdade, para não entrar em laço de re-render.
  useEffect(() => {
    if (!visivel || !balaoRef.current) return;
    const altura = balaoRef.current.getBoundingClientRect().height;
    setAlturaBalao((atual) => (Math.abs(atual - altura) > 1 ? altura : atual));
  }, [visivel, passoAtual, retangulo]);

  function encerrar() {
    localStorage.setItem(CHAVE_TOUR_VISTO, "1");
    setVisivel(false);
    window.dispatchEvent(new Event(EVENTO_TOUR_ENCERRADO));
  }

  function avancar() {
    if (passoAtual === PASSOS.length - 1) {
      encerrar();
      return;
    }
    setPassoAtual((p) => p + 1);
  }

  if (!visivel) return null;

  const passo = PASSOS[passoAtual];
  const posicao = calcularPosicaoBalao(retangulo, alturaBalao);

  return (
    <div className="tour-overlay">
      {retangulo && (
        <div
          className="tour-recorte"
          style={{
            top: retangulo.top - 6,
            left: retangulo.left - 6,
            width: retangulo.width + 12,
            height: retangulo.height + 12,
          }}
        />
      )}
      <div ref={balaoRef} className={`tour-balao ${posicao.seta ? `seta-${posicao.seta}` : ""}`} style={posicao.estilo}>
        {posicao.seta && <span className="tour-seta" style={{ left: posicao.setaLeft }} aria-hidden="true" />}

        <button type="button" className="botao-icone tour-fechar" onClick={encerrar} aria-label="Pular tour">
          <X size={16} aria-hidden="true" />
        </button>

        <div className="tour-dots" aria-hidden="true">
          {PASSOS.map((_, i) => (
            <span key={i} className={`tour-dot ${i === passoAtual ? "ativo" : ""}`} />
          ))}
        </div>

        <p className="tour-passo-contador">Passo {passoAtual + 1} de {PASSOS.length}</p>
        <h3 style={{ margin: "2px 0 6px", fontSize: 15.5 }}>{passo.titulo}</h3>
        <p className="texto-secundario" style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5 }}>{passo.texto}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <button type="button" className="botao-secundario" onClick={encerrar} style={{ width: "auto", padding: "8px 14px" }}>Pular</button>
          <button type="button" onClick={avancar} style={{ width: "auto", padding: "8px 18px" }}>
            {passoAtual === PASSOS.length - 1 ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}

type PosicaoBalao = {
  estilo: CSSProperties;
  seta: "cima" | "baixo" | null;
  setaLeft: number;
};

// Ancora o balão junto do elemento destacado (abaixo dele se couber, senão acima), alinhando a
// seta ao centro do elemento e prendendo o balão inteiro dentro da viewport (usa a altura real
// medida). Sem elemento, centraliza na tela.
function calcularPosicaoBalao(rect: DOMRect | null, altura: number): PosicaoBalao {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const largura = Math.min(320, vw - 24);
  const gap = 14;
  const margem = 12;

  if (!rect) {
    return {
      estilo: { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: largura },
      seta: null,
      setaLeft: 0,
    };
  }

  // Abaixo do elemento se a altura real couber; senão acima. A seta aponta para o elemento.
  const cabeAbaixo = rect.bottom + gap + altura + margem <= vh;
  const seta: "cima" | "baixo" = cabeAbaixo ? "cima" : "baixo";
  const topDesejado = cabeAbaixo ? rect.bottom + gap : rect.top - gap - altura;
  // Trava vertical: nunca deixa o balão sair da tela, mesmo que ele encoste no elemento.
  const top = Math.min(Math.max(topDesejado, margem), vh - altura - margem);

  const centroElemento = rect.left + rect.width / 2;
  const left = Math.min(Math.max(centroElemento - largura / 2, margem), vw - largura - margem);
  const setaLeft = Math.min(Math.max(centroElemento - left, 22), largura - 22);

  return { estilo: { top, left, width: largura }, seta, setaLeft };
}
