"use client";

import { useRef, useState } from "react";
import { PlusCircle, TrendingUp, TrendingDown, PiggyBank, Loader2 } from "lucide-react";
import { criarLancamento } from "@/app/dashboard/actions";

const CATEGORIAS_RECEITA = [
  { value: "SALARIO", label: "Salário" },
  { value: "FREELANCE", label: "Freelance / Bico" },
  { value: "OUTRAS_RECEITAS", label: "Outras receitas" },
];

const CATEGORIAS_DESPESA = [
  { value: "MORADIA", label: "Moradia (aluguel, luz, água)" },
  { value: "ALIMENTACAO", label: "Alimentação" },
  { value: "TRANSPORTE", label: "Transporte / Combustível" },
  { value: "SAUDE", label: "Saúde / Farmácia" },
  { value: "EDUCACAO", label: "Educação / Colégio" },
  { value: "LAZER", label: "Lazer" },
  { value: "ASSINATURAS", label: "Assinaturas" },
  { value: "OUTRAS_DESPESAS", label: "Outras despesas" },
];

const CATEGORIAS_INVESTIMENTO = [
  { value: "RESERVA_EMERGENCIA", label: "Reserva de emergência" },
  { value: "TESOURO_DIRETO", label: "Tesouro Direto" },
  { value: "RENDA_VARIAVEL", label: "Renda variável (ações, FIIs...)" },
  { value: "OUTROS_INVESTIMENTOS", label: "Outros investimentos" },
];

const TIPOS = ["RECEITA", "DESPESA", "INVESTIMENTO"] as const;
type Tipo = (typeof TIPOS)[number];

const CLASSE_ATIVA: Record<Tipo, string> = {
  RECEITA: "ativo-receita",
  DESPESA: "ativo-despesa",
  INVESTIMENTO: "ativo-investimento",
};

const ICONE_TIPO: Record<Tipo, typeof TrendingUp> = {
  RECEITA: TrendingUp,
  DESPESA: TrendingDown,
  INVESTIMENTO: PiggyBank,
};

const LABEL_TIPO: Record<Tipo, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
  INVESTIMENTO: "Investimento",
};

export function FormLancamento() {
  const [tipo, setTipo] = useState<Tipo>("DESPESA");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const categorias =
    tipo === "RECEITA" ? CATEGORIAS_RECEITA : tipo === "DESPESA" ? CATEGORIAS_DESPESA : CATEGORIAS_INVESTIMENTO;

  // Data padrão = hoje
  const hoje = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarLancamento(data);
      formRef.current?.reset();
      setTipo("DESPESA");
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PlusCircle size={16} aria-hidden="true" /> Novo lançamento
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          {/* Tipo */}
          <div className="toggle-tipo" role="radiogroup" aria-label="Tipo de lançamento">
            {TIPOS.map((t) => {
              const Icone = ICONE_TIPO[t];
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tipo === t}
                  onClick={() => setTipo(t)}
                  className={tipo === t ? CLASSE_ATIVA[t] : ""}
                >
                  <Icone size={16} aria-hidden="true" />
                  {LABEL_TIPO[t]}
                </button>
              );
            })}
          </div>

          <input type="hidden" name="tipo" value={tipo} />

          {/* Categoria */}
          <div className="campo">
            <label className="rotulo" htmlFor="categoria">Categoria</label>
            <select id="categoria" name="categoria" required defaultValue="">
              <option value="" disabled>Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="campo">
            <label className="rotulo" htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Ex: Mercado, Salário de junho..."
              required
              maxLength={100}
            />
          </div>

          {/* Valor */}
          <div className="campo">
            <label className="rotulo" htmlFor="valor">Valor</label>
            <input
              id="valor"
              name="valor"
              type="number"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          {/* Data */}
          <div className="campo">
            <label className="rotulo" htmlFor="data">Data</label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={hoje}
              required
            />
          </div>

          {/* Recorrente */}
          <label style={{ fontSize: 13.5, display: "flex", gap: 8, alignItems: "center", marginBottom: 14, color: "var(--texto-secundario)" }}>
            <input name="recorrente" type="checkbox" style={{ width: "auto" }} />
            Esse lançamento se repete todo mês
          </label>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button
            type="submit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar lançamento"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
