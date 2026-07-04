"use client";

import { useState } from "react";
import {
  List,
  Inbox,
  Repeat,
  Trash2,
  Banknote,
  Laptop,
  PlusCircle,
  Home,
  UtensilsCrossed,
  Car,
  Pill,
  GraduationCap,
  Film,
  Receipt,
  PiggyBank,
  Landmark,
  LineChart,
  Wallet,
  Loader2,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { deletarLancamento, deletarLancamentoEFuturos } from "@/app/dashboard/actions";
import { LABEL_CATEGORIA } from "@/lib/categorias";
import { formatarMoeda, formatarData } from "@/lib/formatos";
import { useConfirmacao } from "@/components/useConfirmacao";
import type { Lancamento } from "@prisma/client";

const ICONE_CATEGORIA: Record<string, LucideIcon> = {
  SALARIO: Banknote,
  FREELANCE: Laptop,
  OUTRAS_RECEITAS: PlusCircle,
  MORADIA: Home,
  ALIMENTACAO: UtensilsCrossed,
  TRANSPORTE: Car,
  SAUDE: Pill,
  EDUCACAO: GraduationCap,
  LAZER: Film,
  ASSINATURAS: Repeat,
  OUTRAS_DESPESAS: Receipt,
  RESERVA_EMERGENCIA: PiggyBank,
  TESOURO_DIRETO: Landmark,
  RENDA_VARIAVEL: LineChart,
  OUTROS_INVESTIMENTOS: Wallet,
};

// Quantos registros mostrar de cara quando o card está recolhido — o resto só aparece ao expandir
const QTD_PREVIA = 5;

export function ListaLancamentos({
  lancamentos,
  categoriasEstouradas = new Set(),
}: {
  lancamentos: Lancamento[];
  categoriasEstouradas?: Set<string>;
}) {
  const [deletando, setDeletando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(false);
  const { confirmar, modal } = useConfirmacao();

  if (lancamentos.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhum registro neste mês ainda.
            <br />
            Toque no botão <strong>+</strong> abaixo para registrar o primeiro.
          </p>
        </div>
      </div>
    );
  }

  async function handleDeletar(id: string, descricao: string, recorrente: boolean) {
    let excluirFuturos = false;

    if (recorrente) {
      const excluirTambemFuturos = await confirmar(
        `"${descricao}" é recorrente. Excluir este mês e também os meses futuros?`,
        "Excluir também os futuros"
      );
      if (excluirTambemFuturos) {
        excluirFuturos = true;
      } else if (!(await confirmar(`Excluir apenas esta ocorrência de "${descricao}" (este mês)?`, "Excluir só este mês"))) {
        return;
      }
    } else if (!(await confirmar(`Remover "${descricao}"?`, "Remover"))) {
      return;
    }

    setErro("");
    setDeletando(id);
    try {
      if (excluirFuturos) {
        await deletarLancamentoEFuturos(id);
      } else {
        await deletarLancamento(id);
      }
    } catch {
      setErro("Não foi possível remover o lançamento. Tente novamente.");
    } finally {
      setDeletando(null);
    }
  }

  const visiveis = expandido ? lancamentos : lancamentos.slice(0, QTD_PREVIA);
  const temMais = lancamentos.length > QTD_PREVIA;

  return (
    <div className="card">
      {modal}
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          marginBottom: 12,
          color: "inherit",
          cursor: "pointer",
        }}
      >
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
          <List size={16} aria-hidden="true" />
          {expandido ? "Registros do mês" : "Últimos registros"}
          <span className="texto-secundario" style={{ fontWeight: 400 }}>({lancamentos.length})</span>
        </h2>
        {expandido ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>

      {erro && (
        <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>
          {erro}
        </p>
      )}

      {visiveis.map((l) => {
        const IconeCategoria = ICONE_CATEGORIA[l.categoria];
        return (
          <div key={l.id} className="lista-item">
            <div className="lista-item-info">
              <span className="lista-item-icone" aria-hidden="true">
                <IconeCategoria size={16} />
              </span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{l.descricao}</div>
                <div className="texto-secundario" style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span>{formatarData(l.data)}</span>
                  <span
                    className="categoria-tag"
                    style={
                      categoriasEstouradas.has(l.categoria)
                        ? { background: "var(--vermelho-clara)", color: "var(--vermelho)" }
                        : undefined
                    }
                  >
                    {LABEL_CATEGORIA[l.categoria]}
                  </span>
                  {l.recorrente && <Repeat size={12} aria-label="Recorrente" />}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className={
                  l.tipo === "RECEITA" ? "valor-receita" : l.tipo === "DESPESA" ? "valor-despesa" : "valor-investimento"
                }
              >
                {l.tipo === "RECEITA" ? "+" : "-"}{formatarMoeda(Number(l.valor))}
              </span>

              <button
                onClick={() => handleDeletar(l.id, l.descricao, l.recorrente)}
                disabled={deletando !== null}
                className="botao-icone"
                aria-label={`Remover lançamento ${l.descricao}`}
              >
                {deletando === l.id ? (
                  <Loader2 size={16} className="icone-carregando" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        );
      })}

      {!expandido && temMais && (
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="botao-secundario"
          style={{ width: "100%", marginTop: 4 }}
        >
          Ver todos os {lancamentos.length} registros
        </button>
      )}
    </div>
  );
}
