"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

type Props = { ano: number; mes: number };

export function SeletorMes({ ano, mes }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function navegar(novoAno: number, novoMes: number) {
    const p = new URLSearchParams(params.toString());
    p.set("ano", String(novoAno));
    p.set("mes", String(novoMes));
    router.push(`/dashboard?${p.toString()}`);
  }

  function anterior() {
    if (mes === 1) navegar(ano - 1, 12);
    else navegar(ano, mes - 1);
  }

  function proximo() {
    if (mes === 12) navegar(ano + 1, 1);
    else navegar(ano, mes + 1);
  }

  const botaoEstilo = {
    width: "auto",
    padding: "6px 10px",
    background: "var(--card-bg)",
    color: "var(--azul)",
    border: "1px solid var(--borda)",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <button onClick={anterior} aria-label="Mês anterior" style={botaoEstilo}>
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <strong style={{ fontSize: 16 }}>{MESES[mes - 1]} de {ano}</strong>
      <button onClick={proximo} aria-label="Próximo mês" style={botaoEstilo}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
