"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

type PassoTour = { alvo: string; titulo: string; texto: string };

// Guarda no navegador que o usuário já viu (ou pulou) o tour, pra não repetir a cada login —
// diferente do progresso dos primeiros passos (esse é por conta, salvo no banco).
const CHAVE_TOUR_VISTO = "finclara-tour-primeiros-passos-visto";

const PASSOS: PassoTour[] = [
  { alvo: "resumo", titulo: "Seu resumo do mês", texto: "Aqui você vê, em um só lugar, quanto entrou, quanto saiu e quanto sobrou." },
  { alvo: "registrar", titulo: "Registre por aqui", texto: "Toque em Registrar sempre que quiser lançar uma receita ou uma despesa." },
  { alvo: "prioridade", titulo: "Sua prioridade agora", texto: "O FinClara aponta o que faz mais sentido você fazer com o seu dinheiro primeiro." },
  { alvo: "metas", titulo: "Suas metas", texto: "Crie um objetivo (uma viagem, uma reserva) e acompanhe o progresso por aqui." },
];

// Tour guiado do primeiro acesso: destaca, em sequência, os elementos-chave do dashboard (ver
// atributos data-tour em Resumo, NavPrincipal, CardOrientacao e CardMetas). Só roda na home do
// dashboard, só enquanto os primeiros passos não foram concluídos, e só uma vez por navegador.
export function TourPrimeirosPassos({ ativo }: { ativo: boolean }) {
  const pathname = usePathname();
  const [passoAtual, setPassoAtual] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const [retangulo, setRetangulo] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!ativo || pathname !== "/dashboard") return;
    if (typeof window === "undefined" || localStorage.getItem(CHAVE_TOUR_VISTO)) return;
    setVisivel(true);
  }, [ativo, pathname]);

  useEffect(() => {
    if (!visivel) return;

    function atualizarPosicao() {
      const passo = PASSOS[passoAtual];
      const elemento = document.querySelector(`[data-tour="${passo.alvo}"]`);
      setRetangulo(elemento ? elemento.getBoundingClientRect() : null);
    }

    atualizarPosicao();
    window.addEventListener("resize", atualizarPosicao);
    return () => window.removeEventListener("resize", atualizarPosicao);
  }, [visivel, passoAtual]);

  function encerrar() {
    localStorage.setItem(CHAVE_TOUR_VISTO, "1");
    setVisivel(false);
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
  const alturaBalaoEstimativa = 200;
  const topoBalao = retangulo
    ? Math.min(retangulo.bottom + 12, (typeof window !== "undefined" ? window.innerHeight : 800) - alturaBalaoEstimativa)
    : undefined;

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
      <div className="tour-balao" style={topoBalao !== undefined ? { top: Math.max(topoBalao, 12) } : { top: "50%", transform: "translate(-50%, -50%)" }}>
        <button type="button" className="botao-icone tour-fechar" onClick={encerrar} aria-label="Pular tour">
          <X size={16} aria-hidden="true" />
        </button>
        <p className="tour-passo-contador">{passoAtual + 1} de {PASSOS.length}</p>
        <h3 style={{ margin: "4px 0 6px", fontSize: 15 }}>{passo.titulo}</h3>
        <p className="texto-secundario" style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5 }}>{passo.texto}</p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button type="button" className="botao-secundario" onClick={encerrar}>Pular</button>
          <button type="button" onClick={avancar} style={{ width: "auto", padding: "8px 16px" }}>
            {passoAtual === PASSOS.length - 1 ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
