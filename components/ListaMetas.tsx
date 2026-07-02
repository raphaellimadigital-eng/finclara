"use client";

import { useState } from "react";
import { Inbox, Trash2, Loader2, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { deletarMeta, aportarMeta } from "@/app/dashboard/metas/actions";
import { calcularProjecao, estrategiaSugerida, LABEL_TIPO_META } from "@/lib/metas";
import type { Meta } from "@prisma/client";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ItemMeta({ meta }: { meta: Meta }) {
  const [excluindo, setExcluindo] = useState(false);
  const [aportando, setAportando] = useState(false);
  const [valorAporte, setValorAporte] = useState("");
  const [erro, setErro] = useState("");

  const projecao = calcularProjecao(meta);
  const corStatus = projecao.concluida ? "var(--verde)" : projecao.atrasada ? "var(--vermelho)" : "var(--texto-secundario)";

  async function handleExcluir() {
    if (!confirm(`Remover a meta "${meta.descricao}"?`)) return;
    setErro("");
    setExcluindo(true);
    try {
      await deletarMeta(meta.id);
    } catch {
      setErro("Não foi possível remover a meta.");
      setExcluindo(false);
    }
  }

  async function handleAportar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAportando(true);
    try {
      const fd = new FormData();
      fd.set("metaId", meta.id);
      fd.set("valor", valorAporte);
      await aportarMeta(fd);
      setValorAporte("");
    } catch (err: any) {
      setErro(err.message || "Não foi possível registrar o aporte.");
    } finally {
      setAportando(false);
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{meta.descricao}</div>
          <div className="texto-secundario">
            {LABEL_TIPO_META[meta.tipo]} · prazo {formatarData(meta.prazo)}
          </div>
        </div>
        <button
          onClick={handleExcluir}
          disabled={excluindo}
          className="botao-icone"
          aria-label={`Remover meta ${meta.descricao}`}
        >
          {excluindo ? <Loader2 size={16} className="icone-carregando" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
        </button>
      </div>

      <div className="texto-secundario" style={{ marginBottom: 4 }}>
        {formatarMoeda(Number(meta.valorAtual))} de {formatarMoeda(Number(meta.valorAlvo))} ({Math.round(projecao.percentual)}%)
      </div>
      <div className="barra-fundo" style={{ marginBottom: 8 }}>
        <div
          className="barra-preenchimento"
          style={{ width: `${projecao.percentual}%`, background: projecao.concluida ? "var(--verde)" : "var(--azul)" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12.5, color: corStatus, marginBottom: 8 }}>
        {projecao.concluida ? (
          <>
            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" /> Meta concluída!
          </>
        ) : projecao.atrasada ? (
          <>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            No ritmo atual, você está atrasado
            {projecao.dataProjetada ? ` (previsão: ${formatarData(projecao.dataProjetada)})` : ""}
          </>
        ) : projecao.dataProjetada ? (
          <>
            <Target size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            No ritmo atual, você chega lá em {formatarData(projecao.dataProjetada)}
          </>
        ) : (
          <>
            <Target size={14} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            Registre um aporte para ver uma projeção de prazo
          </>
        )}
      </div>

      <p className="texto-secundario" style={{ fontSize: 11.5, marginBottom: 12 }}>{estrategiaSugerida(meta.prazo)}</p>

      {!projecao.concluida && (
        <form onSubmit={handleAportar} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div className="campo" style={{ marginBottom: 0, flex: 1 }}>
            <label className="rotulo" htmlFor={`aporte-${meta.id}`}>Registrar aporte</label>
            <input
              id={`aporte-${meta.id}`}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={valorAporte}
              onChange={(e) => setValorAporte(e.target.value)}
              disabled={aportando}
              required
            />
          </div>
          <button
            type="submit"
            disabled={aportando}
            style={{ width: "auto", padding: "11px 16px", display: "flex", alignItems: "center", gap: 6 }}
          >
            {aportando && <Loader2 size={14} className="icone-carregando" aria-hidden="true" />}
            Aportar
          </button>
        </form>
      )}

      {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginTop: 8 }}>{erro}</p>}
    </div>
  );
}

export function ListaMetas({ metas }: { metas: Meta[] }) {
  if (metas.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhuma meta cadastrada ainda.
            <br />
            Cadastre a primeira no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {metas.map((meta) => (
        <ItemMeta key={meta.id} meta={meta} />
      ))}
    </>
  );
}
