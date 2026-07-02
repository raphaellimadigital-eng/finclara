"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";

// Busca todas as dívidas do usuário logado, já ordenadas por prioridade (juros mais altos primeiro)
export async function getDividas() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  return prisma.divida.findMany({
    where: { usuarioId: user.id },
    orderBy: { taxaJuros: "desc" },
  });
}

// Cria uma nova dívida
export async function criarDivida(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const descricao = formData.get("descricao") as string;
  const valorTotal = parseFloat(formData.get("valorTotal") as string);
  const valorParcela = parseFloat(formData.get("valorParcela") as string);
  const taxaJuros = parseFloat(formData.get("taxaJuros") as string);
  const vencimento = new Date(formData.get("vencimento") as string);

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
      valorTotal,
      valorParcela,
      taxaJuros,
      vencimento,
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
