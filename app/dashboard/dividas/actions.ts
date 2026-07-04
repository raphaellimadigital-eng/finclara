"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { parseDataLocal, inicioDoDia } from "@/lib/data";
import { calcularPagamento, desfazerPagamento } from "@/lib/dividas";
import { erroPaywall, podeUsarFeature } from "@/lib/assinatura";
import { MSG_VALOR_MAXIMO, TAXA_JUROS_MAXIMA, valorMonetarioValido } from "@/lib/valores";
import { PARCELAS_RESTANTES_MAX, schemaDescricao, validar } from "@/lib/textos";

// Busca todas as dívidas do usuário logado (ativas primeiro, ordenadas por prioridade de
// quitação; quitadas por último)
export async function getDividas() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  return prisma.divida.findMany({
    where: { usuarioId: user.id },
    orderBy: [{ quitada: "asc" }, { taxaJuros: "desc" }],
  });
}

// Cria uma nova dívida
export async function criarDivida(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  const descricao = validar(schemaDescricao, formData.get("descricao"));
  const valorTotal = parseFloat(formData.get("valorTotal") as string);
  const valorParcela = parseFloat(formData.get("valorParcela") as string);
  const jurosDesconhecidos = formData.get("jurosDesconhecidos") === "on";
  const taxaJuros = jurosDesconhecidos ? 0 : parseFloat(formData.get("taxaJuros") as string);
  const vencimento = parseDataLocal(formData.get("vencimento") as string);
  const parcelasRestantesTexto = formData.get("parcelasRestantes") as string;
  const parcelasRestantes = parcelasRestantesTexto ? parseInt(parcelasRestantesTexto, 10) : null;

  if (
    isNaN(valorTotal) || valorTotal <= 0 ||
    isNaN(valorParcela) || valorParcela <= 0 ||
    (!jurosDesconhecidos && (isNaN(taxaJuros) || taxaJuros < 0))
  ) {
    throw new Error("Preencha todos os campos corretamente.");
  }
  if (!valorMonetarioValido(valorTotal) || !valorMonetarioValido(valorParcela)) {
    throw new Error(MSG_VALOR_MAXIMO);
  }
  if (!jurosDesconhecidos && taxaJuros > TAXA_JUROS_MAXIMA) {
    throw new Error(`A taxa de juros máxima permitida é ${TAXA_JUROS_MAXIMA}% ao mês.`);
  }
  if (parcelasRestantes !== null && (isNaN(parcelasRestantes) || parcelasRestantes < 0 || parcelasRestantes > PARCELAS_RESTANTES_MAX)) {
    throw new Error(`Informe um número de parcelas restantes entre 0 e ${PARCELAS_RESTANTES_MAX}.`);
  }
  if (inicioDoDia(vencimento) < inicioDoDia(new Date())) {
    throw new Error("O vencimento não pode ser uma data passada.");
  }

  await prisma.divida.create({
    data: {
      usuarioId: user.id,
      descricao,
      valorOriginal: valorTotal,
      valorTotal,
      valorParcela,
      taxaJuros,
      jurosDesconhecidos,
      parcelasRestantes,
      vencimento,
    },
  });

  revalidatePath("/dashboard/dividas");
  revalidatePath("/dashboard");
}

// Marca a parcela do ciclo atual como paga: abate o valor da parcela do saldo devedor e avança
// o vencimento um mês. Quando o saldo chega a zero, a dívida fica quitada.
export async function marcarDividaPaga(id: string) {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);
  if (!podeUsarFeature(usuario, "dividas_quitacao")) {
    throw erroPaywall("Marcar parcelas como pagas é um recurso do plano Pro.");
  }

  const divida = await prisma.divida.findFirst({ where: { id, usuarioId: user.id } });
  if (!divida) throw new Error("Dívida não encontrada.");
  if (divida.quitada) return;

  const resultado = calcularPagamento(divida);

  await prisma.divida.update({
    where: { id },
    data: {
      valorTotal: resultado.valorTotal,
      vencimento: resultado.vencimento,
      quitada: resultado.quitada,
      quitadaEm: resultado.quitada ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/dividas");
  revalidatePath("/dashboard");
}

// Desfaz o último pagamento registrado: devolve a parcela ao saldo devedor e recua o vencimento,
// reabrindo a dívida se ela tinha sido marcada como quitada por engano.
export async function desfazerPagamentoDivida(id: string) {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);
  if (!podeUsarFeature(usuario, "dividas_quitacao")) {
    throw erroPaywall("Desfazer pagamento de parcelas é um recurso do plano Pro.");
  }

  const divida = await prisma.divida.findFirst({ where: { id, usuarioId: user.id } });
  if (!divida) throw new Error("Dívida não encontrada.");

  const resultado = desfazerPagamento(divida);

  await prisma.divida.update({
    where: { id },
    data: {
      valorTotal: resultado.valorTotal,
      vencimento: resultado.vencimento,
      quitada: false,
      quitadaEm: null,
    },
  });

  revalidatePath("/dashboard/dividas");
  revalidatePath("/dashboard");
}

// Remove uma dívida por id (garante que pertence ao usuário logado)
export async function deletarDivida(id: string) {
  const user = await getUsuarioLogado();

  await prisma.divida.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard/dividas");
  revalidatePath("/dashboard");
}
