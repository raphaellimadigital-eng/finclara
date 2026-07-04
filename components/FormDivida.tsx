"use client";

import { useRef, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { criarDivida } from "@/app/dashboard/dividas/actions";
import { TAXA_JUROS_CARA_AO_MES } from "@/lib/dividas";
import { TAXA_JUROS_MAXIMA } from "@/lib/valores";
import { CampoValor } from "@/components/CampoValor";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import { DESCRICAO_MAX, NOME_MIN, PARCELAS_RESTANTES_MAX, validarTextoNoInput } from "@/lib/textos";

const HOJE = new Date().toISOString().split("T")[0];

export function FormDivida() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [jurosDesconhecidos, setJurosDesconhecidos] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarDivida(data);
      formRef.current?.reset();
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PlusCircle size={16} aria-hidden="true" /> Nova dívida
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Ex: Empréstimo pessoal, Financiamento do carro..."
              required
              minLength={NOME_MIN}
              maxLength={DESCRICAO_MAX}
              onChange={(e) => validarTextoNoInput(e, NOME_MIN, DESCRICAO_MAX, "A descrição")}
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorTotal">Quanto você ainda deve</label>
            <CampoValor id="valorTotal" name="valorTotal" />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="valorParcela">Quanto paga por mês</label>
            <CampoValor id="valorParcela" name="valorParcela" />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="taxaJuros">Juros por mês (%)</label>
            <CampoValor
              id="taxaJuros"
              name="taxaJuros"
              placeholder="Ex: 2,5"
              obrigatorio={!jurosDesconhecidos}
              max={TAXA_JUROS_MAXIMA}
              mensagemMax={`A taxa máxima aceita é ${TAXA_JUROS_MAXIMA}% ao mês.`}
            />
            {/* A regra do que é "dívida cara" fica em texto fixo, não no placeholder (que some
                ao digitar). Onde achar: no contrato, no app do banco ou na fatura. */}
            <span className="texto-secundario" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
              Acima de {TAXA_JUROS_CARA_AO_MES}% ao mês é considerada cara. Você encontra a taxa no
              contrato ou no app do banco.
            </span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                name="jurosDesconhecidos"
                checked={jurosDesconhecidos}
                onChange={(e) => setJurosDesconhecidos(e.target.checked)}
                style={{ width: "auto", minHeight: "auto" }}
              />
              Não sei os juros
            </label>
            {jurosDesconhecidos && (
              <span className="texto-secundario" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                Sem problema — vamos tratar essa dívida com cautela por enquanto. Descobriu os
                juros depois? Você pode atualizar aqui.
              </span>
            )}
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="parcelasRestantes">Quantas parcelas ainda faltam (opcional)</label>
            <input
              id="parcelasRestantes"
              name="parcelasRestantes"
              type="number"
              inputMode="numeric"
              min={0}
              max={PARCELAS_RESTANTES_MAX}
              step={1}
              placeholder="Ex: 12"
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="vencimento">Próximo vencimento</label>
            <input
              id="vencimento"
              name="vencimento"
              type="date"
              min={HOJE}
              required
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <button
            type="submit"
            disabled={carregando || !valido}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
            {carregando ? "Salvando..." : "Salvar dívida"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
