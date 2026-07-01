"use client";

import { useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { salvarPerfilInvestidor } from "@/app/dashboard/perfil/actions";
import { PERGUNTAS_PERFIL } from "@/lib/perfilInvestidor";

export function QuestionarioPerfil() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await salvarPerfilInvestidor(data);
      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardList size={16} aria-hidden="true" /> Questionário de perfil de investidor
      </h2>
      <p className="texto-secundario" style={{ marginTop: -8, marginBottom: 16 }}>
        3 perguntas rápidas para ajustar a orientação financeira ao seu jeito de lidar com risco.
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          {PERGUNTAS_PERFIL.map((p, i) => (
            <div className="campo" key={i}>
              <label className="rotulo" htmlFor={`pergunta${i}`}>{p.pergunta}</label>
              <select id={`pergunta${i}`} name={`pergunta${i}`} required defaultValue="">
                <option value="" disabled>Selecione uma opção</option>
                {p.opcoes.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.texto}</option>
                ))}
              </select>
            </div>
          ))}

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
          {sucesso && (
            <p style={{ color: "var(--verde)", fontSize: 13, marginBottom: 10 }}>
              Perfil atualizado com sucesso.
            </p>
          )}

          <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar perfil"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
