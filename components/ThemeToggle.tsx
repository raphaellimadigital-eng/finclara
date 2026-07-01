"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Tema = "light" | "dark";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    const atual = (document.documentElement.dataset.theme as Tema) || "light";
    setTema(atual);
  }, []);

  function alternar() {
    const novo: Tema = tema === "light" ? "dark" : "light";
    setTema(novo);
    document.documentElement.dataset.theme = novo;
    localStorage.setItem("finclara-theme", novo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="botao-icone"
      aria-label={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      title={tema === "light" ? "Modo escuro" : "Modo claro"}
    >
      {tema === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
