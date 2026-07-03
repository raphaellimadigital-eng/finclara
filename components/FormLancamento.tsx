"use client";

import { useRef, useState } from "react";
import { PlusCircle, TrendingUp, TrendingDown, PiggyBank, Loader2, Sparkles } from "lucide-react";
import { criarLancamento } from "@/app/dashboard/actions";
import { sugerirCategoria } from "@/lib/categorizacao";
import { CATEGORIAS_RECEITA, CATEGORIAS_DESPESA, CATEGORIAS_INVESTIMENTO } from "@/lib/categorias";
import { InfoTooltip } from "@/components/InfoTooltip";

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

// Data padrão do formulário: mesmo dia de hoje, mas dentro do mês/ano que está sendo visto na
// Home (ajustado para o último dia do mês-alvo quando ele for mais curto). Assim, se o usuário
// navegar para um mês passado ou futuro antes de lançar algo, o campo de data já acompanha.
function calcularDataPadrao(ano: number, mes: number): string {
  const hoje = new Date();
  const ultimoDiaDoMesAlvo = new Date(ano, mes, 0).getDate();
  const dia = Math.min(hoje.getDate(), ultimoDiaDoMesAlvo);
  const mesStr = String(mes).padStart(2, "0");
  const diaStr = String(dia).padStart(2, "0");
  return `${ano}-${mesStr}-${diaStr}`;
}

export function FormLancamento({ ano, mes }: { ano: number; mes: number }) {
  const [tipo, setTipo] = useState<Tipo>("DESPESA");
  const [categoria, setCategoria] = useState("");
  const [categoriaSugerida, setCategoriaSugerida] = useState(false);
  const [categoriaEscolhidaManualmente, setCategoriaEscolhidaManualmente] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const categorias =
    tipo === "RECEITA" ? CATEGORIAS_RECEITA : tipo === "DESPESA" ? CATEGORIAS_DESPESA : CATEGORIAS_INVESTIMENTO;

  const dataPadrao = calcularDataPadrao(ano, mes);

  function handleTipoChange(t: Tipo) {
    setTipo(t);
    setCategoria("");
    setCategoriaSugerida(false);
    setCategoriaEscolhidaManualmente(false);
  }

  function handleDescricaoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (categoriaEscolhidaManualmente) return;
    const sugestao = sugerirCategoria(e.target.value);
    if (sugestao && categorias.some((c) => c.value === sugestao)) {
      setCategoria(sugestao);
      setCategoriaSugerida(true);
    }
  }

  function handleCategoriaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoria(e.target.value);
    setCategoriaSugerida(false);
    setCategoriaEscolhidaManualmente(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarLancamento(data);
      formRef.current?.reset();
      setTipo("DESPESA");
      setCategoria("");
      setCategoriaSugerida(false);
      setCategoriaEscolhidaManualmente(false);
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
                  onClick={() => handleTipoChange(t)}
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
            <select id="categoria" name="categoria" required value={categoria} onChange={handleCategoriaChange}>
              <option value="" disabled>Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {categoriaSugerida && (
              <span
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--texto-secundario)", marginTop: 4 }}
              >
                <Sparkles size={12} aria-hidden="true" /> Categoria sugerida com base na descrição
              </span>
            )}
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
              onChange={handleDescricaoChange}
            />
          </div>

          {/* Valor e Data lado a lado — evita o campo de data ficar esticado sozinho numa linha */}
          <div className="campo campo-linha-dupla">
            <div>
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
            <div>
              <label className="rotulo" htmlFor="data">Data</label>
              <input
                id="data"
                name="data"
                type="date"
                defaultValue={dataPadrao}
                required
              />
            </div>
          </div>

          {/* Recorrente */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--texto-secundario)" }}>
              <input name="recorrente" type="checkbox" />
              Repetir todo mês
            </label>
            <InfoTooltip texto="Lançamos os próximos 12 meses automaticamente." />
          </div>

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
