"use client";

import { useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";

const CHAVE_ATIVO = "finclara-lembrete-ativo";
const CHAVE_HORARIO = "finclara-lembrete-horario";
const HORARIO_PADRAO = "20:00";

// Preferência de lembrete diário para registrar os lançamentos (inspirado no "Lembrete diário"
// do Mobills). Por ora só guarda a escolha no navegador — o envio real (e-mail/push) depende de
// definir o canal e uma tarefa agendada; quando isso existir, a preferência migra para o banco.
export function LembreteDiario() {
  const [ativo, setAtivo] = useState(false);
  const [horario, setHorario] = useState(HORARIO_PADRAO);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setAtivo(localStorage.getItem(CHAVE_ATIVO) === "1");
    setHorario(localStorage.getItem(CHAVE_HORARIO) || HORARIO_PADRAO);
  }, []);

  function persistir(novoAtivo: boolean, novoHorario: string) {
    localStorage.setItem(CHAVE_ATIVO, novoAtivo ? "1" : "0");
    localStorage.setItem(CHAVE_HORARIO, novoHorario);
    setSalvo(true);
    window.clearTimeout((persistir as unknown as { _t?: number })._t);
    (persistir as unknown as { _t?: number })._t = window.setTimeout(() => setSalvo(false), 2500);
  }

  function alternarAtivo() {
    const novo = !ativo;
    setAtivo(novo);
    persistir(novo, horario);
  }

  function mudarHorario(valor: string) {
    setHorario(valor);
    persistir(ativo, valor);
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BellRing size={18} style={{ color: "var(--verde)", flexShrink: 0 }} aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14.5 }}>Lembrete diário</div>
            <div className="texto-secundario">Um empurrãozinho para registrar seus gastos todo dia</div>
          </div>
        </div>

        <label className="switch" aria-label="Ativar lembrete diário">
          <input type="checkbox" checked={ativo} onChange={alternarAtivo} />
          <span className="switch-trilho" aria-hidden="true" />
        </label>
      </div>

      {ativo && (
        <div className="campo" style={{ marginTop: 14, marginBottom: 0, maxWidth: 200 }}>
          <label className="rotulo" htmlFor="horario-lembrete">Horário do lembrete</label>
          <input
            id="horario-lembrete"
            type="time"
            value={horario}
            onChange={(e) => mudarHorario(e.target.value)}
          />
        </div>
      )}

      {salvo && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--verde)", fontSize: 13, margin: "12px 0 0" }}>
          <Check size={15} aria-hidden="true" /> Preferência salva
        </p>
      )}
    </div>
  );
}
