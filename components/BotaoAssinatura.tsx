"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cancelarAssinatura, criarAssinatura, verificarPagamento } from "@/app/dashboard/assinatura/actions";

export function BotaoAssinar() {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleAssinar() {
    setErro("");
    setProcessando(true);
    try {
      await criarAssinatura();
      // criarAssinatura() redireciona em caso de sucesso (lança NEXT_REDIRECT) — se chegou
      // aqui sem lançar, algo inesperado aconteceu, mas não há o que fazer além de destravar.
    } catch (err) {
      // O redirect() do Next lança um erro especial para funcionar — não é uma falha real.
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setErro("Não foi possível iniciar a assinatura. Tente novamente em instantes.");
      setProcessando(false);
    }
  }

  return (
    <div>
      {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
      <button
        type="button"
        onClick={handleAssinar}
        disabled={processando}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {processando && <Loader2 size={16} className="icone-carregando" aria-hidden="true" />}
        {processando ? "Abrindo checkout..." : "Assinar o Pro — R$ 19,90/mês"}
      </button>
    </div>
  );
}

// Mostrado quando statusAssinatura fica em PENDENTE: o checkout usa o link hospedado do Mercado
// Pago, então só sabemos que o pagamento foi confirmado quando o webhook avisa — se ele não
// chegar (aba fechada antes do redirect, atraso do MP), o usuário fica preso em PENDENTE sem
// nenhuma ação disponível. Este botão dispara a mesma reconciliação manualmente.
export function BotaoVerificarPagamento() {
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleVerificar() {
    setMensagem("");
    setProcessando(true);
    try {
      const resultado = await verificarPagamento();
      setMensagem(resultado.mensagem);
    } catch {
      setMensagem("Não foi possível verificar agora. Tente novamente em instantes.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>
      {mensagem && <p role="status" className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>{mensagem}</p>}
      <button
        type="button"
        onClick={handleVerificar}
        disabled={processando}
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        {processando ? <Loader2 size={14} className="icone-carregando" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
        {processando ? "Verificando..." : "Já paguei, verificar agora"}
      </button>
    </div>
  );
}

export function BotaoCancelarAssinatura() {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCancelar() {
    if (!confirm("Cancelar sua assinatura Pro? Você continua com acesso completo até o fim do período já pago.")) {
      return;
    }
    setErro("");
    setProcessando(true);
    try {
      await cancelarAssinatura();
    } catch {
      setErro("Não foi possível cancelar agora. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>
      {erro && <p role="alert" style={{ color: "var(--vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
      <button type="button" onClick={handleCancelar} disabled={processando} className="botao-secundario">
        {processando ? "Cancelando..." : "Cancelar assinatura"}
      </button>
    </div>
  );
}
