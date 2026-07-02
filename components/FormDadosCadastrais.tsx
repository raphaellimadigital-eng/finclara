"use client";

import { useState } from "react";
import { Pencil, X, Loader2 } from "lucide-react";
import { atualizarDadosCadastrais } from "@/app/dashboard/perfil/actions";
import { formatarCep, buscarEnderecoPorCep } from "@/lib/cep";

type Props = {
  email: string;
  criadoEm: string;
  nome: string;
  telefone: string;
  endereco: string;
  perfilInvestidor: string;
};

export function FormDadosCadastrais({
  email,
  criadoEm,
  nome: nomeInicial,
  telefone: telefoneInicial,
  endereco: enderecoInicial,
  perfilInvestidor,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(nomeInicial);
  const [telefone, setTelefone] = useState(telefoneInicial);
  const [endereco, setEndereco] = useState(enderecoInicial);
  const [cep, setCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = formatarCep(e.target.value);
    setCep(formatado);
    setErroCep("");

    const digitos = formatado.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setBuscandoCep(true);
    try {
      setEndereco(await buscarEnderecoPorCep(digitos));
    } catch (err: any) {
      setErroCep(err.message || "Não foi possível buscar o CEP agora.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function cancelar() {
    setNome(nomeInicial);
    setTelefone(telefoneInicial);
    setEndereco(enderecoInicial);
    setCep("");
    setErroCep("");
    setErro("");
    setEditando(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const dados = new FormData();
      dados.set("nome", nome);
      dados.set("telefone", telefone);
      dados.set("endereco", endereco);
      await atualizarDadosCadastrais(dados);
      setEditando(false);
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (!editando) {
    return (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 className="card-title" style={{ margin: 0 }}>Dados cadastrais</h2>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => setEditando(true)}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <Pencil size={14} aria-hidden="true" /> Editar
          </button>
        </div>

        <div className="campo">
          <div className="rotulo">Nome</div>
          <div>{nomeInicial || "-"}</div>
        </div>
        <div className="campo">
          <div className="rotulo">E-mail</div>
          <div>{email}</div>
        </div>
        <div className="campo">
          <div className="rotulo">Telefone</div>
          <div>{telefoneInicial || "-"}</div>
        </div>
        <div className="campo">
          <div className="rotulo">Endereço</div>
          <div>{enderecoInicial || "-"}</div>
        </div>
        <div className="campo">
          <div className="rotulo">Perfil de investidor</div>
          <div>{perfilInvestidor}</div>
        </div>
        <div className="campo" style={{ marginBottom: 0 }}>
          <div className="rotulo">Conta criada em</div>
          <div>{criadoEm}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Editar dados cadastrais</h2>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={salvando} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="campo">
            <label className="rotulo" htmlFor="nomeEdit">Nome</label>
            <input
              id="nomeEdit"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <div className="rotulo">E-mail</div>
            <div className="texto-secundario">{email} (não pode ser alterado por aqui)</div>
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="telefoneEdit">Telefone</label>
            <input
              id="telefoneEdit"
              type="tel"
              placeholder="(11) 91234-5678"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="cepEdit">CEP</label>
            <input
              id="cepEdit"
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              maxLength={9}
            />
            {buscandoCep && (
              <span
                className="texto-secundario"
                style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}
              >
                <Loader2 size={12} className="icone-carregando" aria-hidden="true" /> Buscando endereço...
              </span>
            )}
            {erroCep && (
              <span style={{ color: "var(--vermelho)", fontSize: 11.5, marginTop: 4, display: "block" }}>
                {erroCep}
              </span>
            )}
          </div>

          <div className="campo">
            <label className="rotulo" htmlFor="enderecoEdit">Endereço</label>
            <input
              id="enderecoEdit"
              type="text"
              placeholder="Preenchido pelo CEP, complete com número e complemento"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {salvando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="botao-secundario"
              onClick={cancelar}
              disabled={salvando}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <X size={14} aria-hidden="true" /> Cancelar
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
