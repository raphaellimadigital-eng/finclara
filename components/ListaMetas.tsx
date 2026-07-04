"use client";

import { useRef, useState } from "react";
import { Inbox, Trash2, Loader2, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { deletarMeta, aportarMeta } from "@/app/dashboard/metas/actions";
import { calcularProjecao, estrategiaSugerida, LABEL_TIPO_META } from "@/lib/metas";
import { formatarMoeda, formatarData } from "@/lib/formatos";
import { CampoValor } from "@/components/CampoValor";
import { useConfirmacao } from "@/components/useConfirmacao";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import type { Meta } from "@prisma/client";

function ItemMeta({ meta }: { meta: Meta }) {
  const [excluindo, setExcluindo] = useState(false);
  const [aportando, setAportando] = useState(false);
  const [erro, setErro] = useState("");
  const { confirmar, modal } = useConfirmacao();
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  const projecao = calcularProjecao(meta);
  const corStatus = projecao.concluida ? "var(--verde)" : projecao.atrasada ? "var(--vermelho)" : "var(--texto-secundario)";

  async function handleExcluir() {
    if (!(await confirmar(`Remover a meta "${meta.descricao}"?`, "Remover"))) return;
    setErro("");
    setExcluindo(true);
    try {
      await deletarMeta(meta.id);
    } catch {
      setErro("Não foi possível remover a meta.");
      setExcluindo(false);
    }
  }

  async function handleAportar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setAportando(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("metaId", meta.id);
      await aportarMeta(fd);
      formRef.current?.reset();
    } catch (err: any) {
      setErro(err.message || "Não foi possível registrar o aporte.");
    } finally {
      setAportando(false);
    }
  }

  return (
    <div className="card">
      {modal}
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
        <form ref={formRef} onSubmit={handleAportar} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <fieldset disabled={aportando} style={{ display: "flex", gap: 8, alignItems: "flex-end", flex: 1, border: "none", padding: 0, margin: 0 }}>
            <div className="campo" style={{ marginBottom: 0, flex: 1 }}>
              <label className="rotulo" htmlFor={`aporte-${meta.id}`}>Guardar nesta meta</label>
              <CampoValor id={`aporte-${meta.id}`} name="valor" />
            </div>
            <button
              type="submit"
              disabled={aportando || !valido}
              style={{ width: "auto", padding: "11px 16px", display: "flex", alignItems: "center", gap: 6 }}
            >
              {aportando && <Loader2 size={14} className="icone-carregando" aria-hidden="true" />}
              Guardar
            </button>
          </fieldset>
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
            Que tal criar sua primeira meta?
            <br />
            Toque em <strong>+ Nova meta</strong> logo abaixo.
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
