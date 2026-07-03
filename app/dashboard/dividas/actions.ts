"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { parseDataLocal } from "@/lib/data";
import { calcularPagamento, desfazerPagamento } from "@/lib/dividas";

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

  const descricao = formData.get("descricao") as string;
  const valorTotal = parseFloat(formData.get("valorTotal") as string);
  const valorParcela = parseFloat(formData.get("valorParcela") as string);
  const taxaJuros = parseFloat(formData.get("taxaJuros") as string);
  const vencimento = parseDataLocal(formData.get("vencimento") as string);

  if (
    !descricao ||
    isNaN(valorTotal) || valorTotal <= 0 ||
    isNaN(valorParcela) || valorParcela <= 0 ||
    isNaN(taxaJuros) || taxaJuros < 0
  ) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  await prisma.divida.create({
    data: {
      usuarioId: user.id,
      descricao,
      valorOriginal: valorTotal,
      valorTotal,
      valorParcela,
      taxaJuros,
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
