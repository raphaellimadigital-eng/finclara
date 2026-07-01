"use client";

import { useRef, useState } from "react";
import { PlusCircle, TrendingUp, TrendingDown } from "lucide-react";
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

export function FormLancamento() {
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const categorias = tipo === "RECEITA" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

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
        {/* Tipo */}
        <div className="toggle-tipo" role="radiogroup" aria-label="Tipo de lançamento">
          {(["RECEITA", "DESPESA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tipo === t}
              onClick={() => setTipo(t)}
              className={tipo === t ? (t === "RECEITA" ? "ativo-receita" : "ativo-despesa") : ""}
            >
              {t === "RECEITA" ? <TrendingUp size={16} aria-hidden="true" /> : <TrendingDown size={16} aria-hidden="true" />}
              {t === "RECEITA" ? "Receita" : "Despesa"}
            </button>
          ))}
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

        <button type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : "Salvar lançamento"}
        </button>
      </form>
    </div>
  );
}
