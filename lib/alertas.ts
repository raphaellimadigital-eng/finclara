import type { CartaoCredito, Divida, Meta } from "@prisma/client";
import { calcularProjecao } from "./metas";
import type { ProgressoLimite } from "./limites";

// Antecedência (em dias) para avisar sobre fechamento/vencimento de fatura e vencimento de dívida
const DIAS_ANTECEDENCIA = 5;

type Severidade = "estouro" | "urgente" | "aviso";

export type Alerta = {
  id: string;
  severidade: Severidade;
  titulo: string;
  descricao: string;
  href: string;
};

const ORDEM_SEVERIDADE: Record<Severidade, number> = { estouro: 0, urgente: 1, aviso: 2 };

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Quantos dias faltam (a partir de "referencia") até o próximo dia-do-mês informado
// (fechamento/vencimento de cartão), rolando para o mês seguinte se já tiver passado.
function diasAteProximoDiaDoMes(dia: number, referencia: Date): number {
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();
  let alvo = new Date(ano, mes, dia);
  if (alvo < referencia) {
    alvo = new Date(ano, mes + 1, dia);
  }
  return Math.ceil((alvo.getTime() - referencia.getTime()) / (1000 * 60 * 60 * 24));
}

export function alertasLimites(progresso: ProgressoLimite[], labelCategoria: Record<string, string>): Alerta[] {
  return progresso
    .filter((p) => p.situacao !== "ok")
    .map((p) => ({
      id: `limite-${p.categoria}`,
      severidade: p.situacao === "estouro" ? "estouro" : "aviso",
      titulo:
        p.situacao === "estouro"
          ? `Limite de ${labelCategoria[p.categoria] ?? p.categoria} estourado`
          : `Perto do limite de ${labelCategoria[p.categoria] ?? p.categoria}`,
      descricao: `${formatarMoeda(p.gastoAtual)} de ${formatarMoeda(p.valorLimite)} (${Math.round(p.percentual)}%)`,
      href: "/dashboard/limites",
    }));
}

export function alertasCartoes(cartoes: CartaoCredito[], referencia: Date = new Date()): Alerta[] {
  const alertas: Alerta[] = [];

  for (const cartao of cartoes) {
    const diasFechamento = diasAteProximoDiaDoMes(cartao.diaFechamento, referencia);
    if (diasFechamento <= DIAS_ANTECEDENCIA) {
      alertas.push({
        id: `cartao-fechamento-${cartao.id}`,
        severidade: "aviso",
        titulo: `Fatura do ${cartao.nome} fecha em breve`,
        descricao: diasFechamento <= 0 ? "Fecha hoje" : `Fecha em ${diasFechamento} dia(s)`,
        href: "/dashboard/cartoes",
      });
    }

    const diasVencimento = diasAteProximoDiaDoMes(cartao.diaVencimento, referencia);
    if (diasVencimento <= DIAS_ANTECEDENCIA) {
      alertas.push({
        id: `cartao-vencimento-${cartao.id}`,
        severidade: "urgente",
        titulo: `Fatura do ${cartao.nome} vence em breve`,
        descricao: diasVencimento <= 0 ? "Vence hoje" : `Vence em ${diasVencimento} dia(s)`,
        href: "/dashboard/cartoes",
      });
    }
  }

  return alertas;
}

export function alertasDividas(dividas: Divida[], referencia: Date = new Date()): Alerta[] {
  const alertas: Alerta[] = [];

  for (const divida of dividas) {
    const dias = Math.ceil((new Date(divida.vencimento).getTime() - referencia.getTime()) / (1000 * 60 * 60 * 24));
    if (dias > DIAS_ANTECEDENCIA) continue;

    alertas.push({
      id: `divida-${divida.id}`,
      severidade: dias < 0 ? "urgente" : "aviso",
      titulo: dias < 0 ? `Parcela de "${divida.descricao}" venceu` : `Parcela de "${divida.descricao}" vence em breve`,
      descricao:
        dias < 0
          ? `Venceu há ${Math.abs(dias)} dia(s)`
          : dias === 0
          ? "Vence hoje"
          : `Vence em ${dias} dia(s)`,
      href: "/dashboard/dividas",
    });
  }

  return alertas;
}

export function alertasMetas(metas: Meta[]): Alerta[] {
  return metas
    .filter((m) => calcularProjecao(m).atrasada)
    .map((m) => ({
      id: `meta-${m.id}`,
      severidade: "aviso",
      titulo: `Meta "${m.descricao}" atrasada`,
      descricao: "No ritmo atual de aportes, a meta não será concluída dentro do prazo.",
      href: "/dashboard/metas",
    }));
}

export function ordenarPorSeveridade(alertas: Alerta[]): Alerta[] {
  return [...alertas].sort((a, b) => ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade]);
}
