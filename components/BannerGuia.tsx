"use client";

import { useEffect, useState } from "react";
import { Compass, ChevronRight, X } from "lucide-react";
import { EVENTO_INICIAR_TOUR, EVENTO_TOUR_ENCERRADO } from "@/components/TourPrimeirosPassos";

const CHAVE_BANNER_DISPENSADO = "finclara-banner-guia-dispensado";

// Banner de entrada para o tour guiado (inspirado no card "Que tal um guia rápido?" do Mobills).
// Fica no topo do dashboard como um convite visível; "Começar" abre o tour na hora. O usuário
// pode dispensar no X — depois disso o tour segue acessível em Configurações → Refazer tour.
export function BannerGuia() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    setVisivel(localStorage.getItem(CHAVE_BANNER_DISPENSADO) !== "1");

    // Some junto quando o tour é concluído ou pulado (o usuário pediu: o guia some depois de
    // completar ou dispensar, mas segue acessível em Configurações → Refazer tour).
    function aoEncerrarTour() {
      localStorage.setItem(CHAVE_BANNER_DISPENSADO, "1");
      setVisivel(false);
    }
    window.addEventListener(EVENTO_TOUR_ENCERRADO, aoEncerrarTour);
    return () => window.removeEventListener(EVENTO_TOUR_ENCERRADO, aoEncerrarTour);
  }, []);

  function comecar() {
    window.dispatchEvent(new Event(EVENTO_INICIAR_TOUR));
  }

  function dispensar() {
    localStorage.setItem(CHAVE_BANNER_DISPENSADO, "1");
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="banner-guia">
      <Compass size={20} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14.5 }}>
          Que tal um guia rápido sobre as principais funcionalidades?
        </p>
        <button type="button" className="banner-guia-comecar" onClick={comecar}>
          Começar <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="botao-icone" onClick={dispensar} aria-label="Dispensar guia">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
