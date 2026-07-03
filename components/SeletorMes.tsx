"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { avancarMeses, compararMesAno, type MesAno } from "@/lib/data";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

type Props = {
  ano: number;
  mes: number;
  baseHref?: string;
  // Ano a partir do qual o usuário pode navegar (sempre janeiro desse ano) — normalmente o ano
  // de criação da conta: quem contratou este ano só vê desde janeiro deste ano; quem contratou
  // em anos anteriores enxerga desde janeiro do ano em que contratou.
  anoMinimo?: number;
  // Até onde o usuário pode navegar no futuro (ver getLimiteFuturoCalendario em
  // app/dashboard/actions.ts): pelo menos o próximo mês, e mais além se já tiver lançamento
  // recorrente, parcela de dívida ou de cartão programada mais na frente. Sem isso informado,
  // o padrão é só o próximo mês a partir de hoje.
  limiteFuturo?: MesAno;
};

export function SeletorMes({ ano, mes, baseHref = "/dashboard", anoMinimo, limiteFuturo }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [carregando, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hoje = new Date();
  const teto = limiteFuturo ?? avancarMeses({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }, 1);

  // Sem anoMinimo informado, não há piso — sobretudo pro seletor de ano ainda mostrar um
  // intervalo razoável (10 anos pra trás). Nunca usar `ano` como piso: em janeiro isso bateria
  // ano === anoMin trivialmente e desabilitaria "anterior" mesmo sem restrição nenhuma.
  const anoMin = anoMinimo ?? hoje.getFullYear() - 10;
  // ano < anoMin cobre o caso (só possível editando a URL manualmente) de já estar abaixo do
  // piso permitido — sem isso, o botão "anterior" continuaria clicável nesse cenário.
  const noPiso = anoMinimo !== undefined && (ano < anoMin || (ano === anoMin && mes === 1));
  const noTeto = compararMesAno({ ano, mes }, teto) >= 0;

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, []);

  function navegar(novoAno: number, novoMes: number) {
    setAberto(false);
    const p = new URLSearchParams(params.toString());
    p.set("ano", String(novoAno));
    p.set("mes", String(novoMes));
    startTransition(() => {
      router.push(`${baseHref}?${p.toString()}`);
    });
  }

  function anterior() {
    if (noPiso) return;
    if (mes === 1) navegar(ano - 1, 12);
    else navegar(ano, mes - 1);
  }

  function proximo() {
    if (noTeto) return;
    if (mes === 12) navegar(ano + 1, 1);
    else navegar(ano, mes + 1);
  }

  function handleAnoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoAno = Number(e.target.value);
    // Trocar pro ano-teto com um mês além do permitido nele (ex: estava em novembro, o teto do
    // ano seguinte é março) precisa ajustar o mês, senão cairia numa combinação inválida.
    const novoMes = novoAno === teto.ano ? Math.min(mes, teto.mes) : mes;
    navegar(novoAno, novoMes);
  }

  function handleMesChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navegar(ano, Number(e.target.value));
  }

  const anos = Array.from({ length: teto.ano - anoMin + 1 }, (_, i) => anoMin + i);
  // No ano-teto, só os meses até o mês-teto ficam disponíveis; em qualquer outro ano do
  // intervalo (o piso é sempre janeiro, não restringe nada), os 12 meses são válidos.
  const ultimoMesDoAno = ano === teto.ano ? teto.mes : 12;
  const mesesDisponiveis = MESES.slice(0, ultimoMesDoAno);

  const botaoEstilo = {
    width: "auto",
    padding: "6px 10px",
    background: "var(--card-bg)",
    color: "var(--azul)",
    border: "1px solid var(--borda)",
    display: "flex",
    alignItems: "center",
  };

  // justify-content: center (não space-between) de propósito: um seletor de mês fica estranho
  // esticado por uma tela larga, com as setas nas pontas e um vão enorme no meio. Compacto e
  // centralizado, o widget fica bem em qualquer largura de contêiner, sem precisar de nenhum
  // wrapper especial pra limitar largura.
  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
      <button onClick={anterior} disabled={carregando || noPiso} aria-label="Mês anterior" style={botaoEstilo}>
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        style={{
          width: "auto",
          minHeight: "auto",
          background: "none",
          border: "none",
          padding: "4px 8px",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--texto)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 140,
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {MESES[mes - 1]} de {ano}
        {carregando && <Loader2 size={14} className="icone-carregando" style={{ color: "var(--texto-secundario)" }} aria-hidden="true" />}
      </button>

      <button onClick={proximo} disabled={carregando || noTeto} aria-label="Próximo mês" style={botaoEstilo}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>

      {aberto && (
        <div role="dialog" aria-label="Escolher mês e ano" className="seletor-mes-popover">
          <div className="campo" style={{ marginBottom: 0 }}>
            <label className="rotulo" htmlFor="seletorMesMes">Mês</label>
            <select id="seletorMesMes" value={mes} onChange={handleMesChange}>
              {mesesDisponiveis.map((nomeMes, i) => (
                <option key={nomeMes} value={i + 1}>{nomeMes}</option>
              ))}
            </select>
          </div>
          <div className="campo" style={{ marginBottom: 0 }}>
            <label className="rotulo" htmlFor="seletorMesAno">Ano</label>
            <select id="seletorMesAno" value={ano} onChange={handleAnoChange}>
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
