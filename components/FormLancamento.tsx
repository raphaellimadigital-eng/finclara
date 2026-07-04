"use client";

import { useRef, useState } from "react";
import { TrendingUp, TrendingDown, PiggyBank, Loader2, Sparkles } from "lucide-react";
import { criarLancamento } from "@/app/dashboard/actions";
import { sugerirCategoria } from "@/lib/categorizacao";
import { CATEGORIAS_RECEITA, CATEGORIAS_DESPESA, CATEGORIAS_INVESTIMENTO } from "@/lib/categorias";
import { CampoValor } from "@/components/CampoValor";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import { DESCRICAO_MAX, NOME_MIN, validarTextoNoInput } from "@/lib/textos";

export type MetaParaVincular = { id: string; descricao: string };

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

// Linguagem simples no lugar do jargão contábil: o dinheiro "entrou", "saiu" ou foi "guardado".
const LABEL_TIPO: Record<Tipo, string> = {
  RECEITA: "Entrou",
  DESPESA: "Saiu",
  INVESTIMENTO: "Guardei",
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

type Props = {
  ano: number;
  mes: number;
  // Pré-preenchimento (ex: "Guardar agora" a partir da sobra do mês)
  tipoInicial?: Tipo;
  valorInicial?: number;
  // Metas do usuário: um registro "Guardei" pode ser vinculado a uma delas (opcional)
  metas?: MetaParaVincular[];
  // Chamado após salvar com sucesso (ex: fechar a folha em que o formulário está)
  aoSalvar?: () => void;
  // Sem o card em volta, para uso dentro de uma folha/modal que já tem título próprio
  semCard?: boolean;
};

export function FormLancamento({ ano, mes, tipoInicial = "DESPESA", valorInicial, metas = [], aoSalvar, semCard = false }: Props) {
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [categoria, setCategoria] = useState("");
  const [categoriaSugerida, setCategoriaSugerida] = useState(false);
  const [categoriaEscolhidaManualmente, setCategoriaEscolhidaManualmente] = useState(false);
  const [metaVinculada, setMetaVinculada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  const categorias =
    tipo === "RECEITA" ? CATEGORIAS_RECEITA : tipo === "DESPESA" ? CATEGORIAS_DESPESA : CATEGORIAS_INVESTIMENTO;

  const dataPadrao = calcularDataPadrao(ano, mes);

  function handleTipoChange(t: Tipo) {
    setTipo(t);
    setCategoria("");
    setCategoriaSugerida(false);
    setCategoriaEscolhidaManualmente(false);
    setMetaVinculada("");
  }

  function handleDescricaoChange(e: React.ChangeEvent<HTMLInputElement>) {
    validarTextoNoInput(e, NOME_MIN, DESCRICAO_MAX, "A descrição");
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
      setTipo(tipoInicial);
      setCategoria("");
      setCategoriaSugerida(false);
      setCategoriaEscolhidaManualmente(false);
      setMetaVinculada("");
      aoSalvar?.();
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const formulario = (
    <form ref={formRef} onSubmit={handleSubmit}>
      <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
        {/* Tipo */}
        <div className="toggle-tipo" role="radiogroup" aria-label="Tipo de registro">
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

        {/* Descrição vem ANTES da categoria: é ela que dispara a sugestão automática de
            categoria — na ordem antiga o usuário escolhia a categoria manualmente primeiro
            e a sugestão nunca tinha chance de agir. */}
        <div className="campo">
          <label className="rotulo" htmlFor="descricao">O que foi?</label>
          <input
            id="descricao"
            name="descricao"
            type="text"
            placeholder="Ex: Mercado, Salário de junho..."
            required
            minLength={NOME_MIN}
            maxLength={DESCRICAO_MAX}
            onChange={handleDescricaoChange}
          />
        </div>

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

        {/* Ao guardar dinheiro, dá para vincular a uma meta: o valor soma no progresso dela
            automaticamente, sem precisar registrar duas vezes. */}
        {tipo === "INVESTIMENTO" && metas.length > 0 && (
          <div className="campo">
            <label className="rotulo" htmlFor="metaId">Para qual meta? (opcional)</label>
            <select id="metaId" name="metaId" value={metaVinculada} onChange={(e) => setMetaVinculada(e.target.value)}>
              <option value="">Nenhuma meta</option>
              {metas.map((m) => (
                <option key={m.id} value={m.id}>{m.descricao}</option>
              ))}
            </select>
          </div>
        )}

        {/* Valor e Data lado a lado — evita o campo de data ficar esticado sozinho numa linha */}
        <div className="campo campo-linha-dupla">
          <div>
            <label className="rotulo" htmlFor="valor">Valor</label>
            <CampoValor id="valor" name="valor" valorInicial={valorInicial} />
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

        {/* Recorrente — escondido quando há meta vinculada: as ocorrências futuras somariam
            na meta hoje, antes de o dinheiro existir */}
        {!metaVinculada && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--texto-secundario)" }}>
              <input name="recorrente" type="checkbox" />
              Repetir todo mês
            </label>
            <InfoTooltip texto="Lançamos os próximos 12 meses automaticamente." />
          </div>
        )}

        {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

        <button
          type="submit"
          disabled={carregando || !valido}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
          {carregando ? "Salvando..." : "Salvar"}
        </button>
      </fieldset>
    </form>
  );

  if (semCard) return formulario;

  return (
    <div className="card">
      <h2 className="card-title">Registrar</h2>
      {formulario}
    </div>
  );
}
