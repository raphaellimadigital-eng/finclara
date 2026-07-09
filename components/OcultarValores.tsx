"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const CHAVE = "finclara-valores-ocultos";

// Botão de privacidade (o "olho"): borra todos os valores marcados com a classe
// `valor-sensivel` na tela, para o usuário conferir o app em público sem expor quanto tem.
// A preferência fica no localStorage e vale para o app inteiro (atributo no <html>).
export function OcultarValores() {
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE) === "1";
    setOculto(salvo);
    document.documentElement.toggleAttribute("data-valores-ocultos", salvo);
  }, []);

  function alternar() {
    const novo = !oculto;
    setOculto(novo);
    document.documentElement.toggleAttribute("data-valores-ocultos", novo);
    localStorage.setItem(CHAVE, novo ? "1" : "0");
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="botao-icone"
      aria-pressed={oculto}
      aria-label={oculto ? "Mostrar valores" : "Ocultar valores"}
      title={oculto ? "Mostrar valores" : "Ocultar valores"}
    >
      {oculto ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </button>
  );
}
