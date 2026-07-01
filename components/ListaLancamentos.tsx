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
  type LucideIcon,
} from "lucide-react";
import { deletarLancamento } from "@/app/dashboard/actions";
import type { Lancamento } from "@prisma/client";

const LABEL_CATEGORIA: Record<string, string> = {
  SALARIO: "Salário",
  FREELANCE: "Freelance",
  OUTRAS_RECEITAS: "Outras receitas",
  MORADIA: "Moradia",
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  SAUDE: "Saúde",
  EDUCACAO: "Educação",
  LAZER: "Lazer",
  ASSINATURAS: "Assinaturas",
  OUTRAS_DESPESAS: "Outras despesas",
  RESERVA_EMERGENCIA: "Reserva de emergência",
  TESOURO_DIRETO: "Tesouro Direto",
  RENDA_VARIAVEL: "Renda variável",
  OUTROS_INVESTIMENTOS: "Outros investimentos",
};

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

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ListaLancamentos({ lancamentos }: { lancamentos: Lancamento[] }) {
  const [deletando, setDeletando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (lancamentos.length === 0) {
    return (
      <div className="card">
        <div className="estado-vazio">
          <Inbox size={28} className="estado-vazio-icone" aria-hidden="true" />
          <p className="texto-secundario" style={{ margin: 0 }}>
            Nenhum lançamento neste mês ainda.
            <br />
            Adicione o primeiro no formulário acima.
          </p>
        </div>
      </div>
    );
  }

  async function handleDeletar(id: string, descricao: string) {
    if (!confirm(`Remover "${descricao}"?`)) return;
    setErro("");
    setDeletando(id);
    try {
      await deletarLancamento(id);
    } catch {
      setErro("Não foi possível remover o lançamento. Tente novamente.");
    } finally {
      setDeletando(null);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <List size={16} aria-hidden="true" /> Lançamentos do mês
      </h2>

      {erro && (
        <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>
          {erro}
        </p>
      )}

      {lancamentos.map((l) => {
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
                  <span className="categoria-tag">{LABEL_CATEGORIA[l.categoria]}</span>
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
                onClick={() => handleDeletar(l.id, l.descricao)}
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
    </div>
  );
}
