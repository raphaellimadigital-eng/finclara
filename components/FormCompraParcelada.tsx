"use client";

import { useRef, useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { criarCompraParcelada } from "@/app/dashboard/cartoes/actions";
import { CampoValor } from "@/components/CampoValor";
import { CATEGORIAS_DESPESA } from "@/lib/categorias";
import { useValidadeFormulario } from "@/components/useValidadeFormulario";
import { DESCRICAO_MAX, NOME_MIN, validarTextoNoInput } from "@/lib/textos";
import type { CartaoCredito } from "@prisma/client";

type Props = {
  // Lista para escolher o cartão (uso avulso) OU um cartão fixo (uso dentro do card do
  // próprio cartão, em ListaCartoes — sem select, o cartão já está decidido).
  cartoes?: CartaoCredito[];
  cartaoFixo?: CartaoCredito;
  // Sem o card em volta, para uso dentro de outro card
  semCard?: boolean;
};

export function FormCompraParcelada({ cartoes = [], cartaoFixo, semCard = false }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef);

  const hoje = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const data = new FormData(e.currentTarget);
      await criarCompraParcelada(data);
      formRef.current?.reset();
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const formulario = (
    <form ref={formRef} onSubmit={handleSubmit}>
      <fieldset disabled={carregando} style={{ border: "none", padding: 0, margin: 0 }}>
        {cartaoFixo ? (
          <input type="hidden" name="cartaoId" value={cartaoFixo.id} />
        ) : (
          <div className="campo">
            <label className="rotulo" htmlFor="cartaoId">Cartão</label>
            <select id="cartaoId" name="cartaoId" required defaultValue="">
              <option value="" disabled>Selecione o cartão</option>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        )}

        <div className="campo">
          <label className="rotulo" htmlFor={`descricaoCompra-${cartaoFixo?.id ?? "geral"}`}>O que comprou?</label>
          <input
            id={`descricaoCompra-${cartaoFixo?.id ?? "geral"}`}
            name="descricao"
            type="text"
            placeholder="Ex: Notebook, Passagem aérea..."
            required
            minLength={NOME_MIN}
            maxLength={DESCRICAO_MAX}
            onChange={(e) => validarTextoNoInput(e, NOME_MIN, DESCRICAO_MAX, "A descrição")}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div className="campo" style={{ flex: 1 }}>
            <label className="rotulo" htmlFor={`valorTotalCompra-${cartaoFixo?.id ?? "geral"}`}>Preço total</label>
            <CampoValor id={`valorTotalCompra-${cartaoFixo?.id ?? "geral"}`} name="valorTotal" />
          </div>
          <div className="campo" style={{ flex: 1 }}>
            <label className="rotulo" htmlFor={`numParcelas-${cartaoFixo?.id ?? "geral"}`}>Em quantas vezes</label>
            <input id={`numParcelas-${cartaoFixo?.id ?? "geral"}`} name="numParcelas" type="number" placeholder="Ex: 10" min="1" max="60" required />
          </div>
        </div>

        <div className="campo">
          <label className="rotulo" htmlFor={`dataCompra-${cartaoFixo?.id ?? "geral"}`}>Data da compra</label>
          <input id={`dataCompra-${cartaoFixo?.id ?? "geral"}`} name="dataCompra" type="date" defaultValue={hoje} max={hoje} required />
        </div>

        <div className="campo">
          <label className="rotulo" htmlFor={`categoria-${cartaoFixo?.id ?? "geral"}`}>Categoria</label>
          <select id={`categoria-${cartaoFixo?.id ?? "geral"}`} name="categoria" required defaultValue="">
            <option value="" disabled>Selecione a categoria</option>
            {CATEGORIAS_DESPESA.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

        <button type="submit" disabled={carregando || !valido} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {carregando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
          {carregando ? "Salvando..." : "Salvar compra"}
        </button>
      </fieldset>
    </form>
  );

  if (semCard) return formulario;

  return (
    <div className="card">
      <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ShoppingCart size={16} aria-hidden="true" /> Nova compra parcelada
      </h2>
      {formulario}
    </div>
  );
}
