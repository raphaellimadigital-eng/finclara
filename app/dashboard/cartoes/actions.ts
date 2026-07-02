"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";

// Busca todos os cartões do usuário logado, com as compras parceladas de cada um
export async function getCartoes() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  return prisma.cartaoCredito.findMany({
    where: { usuarioId: user.id },
    include: { compras: true },
    orderBy: { criadoEm: "asc" },
  });
}

// Cria um novo cartão de crédito
export async function criarCartao(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const nome = formData.get("nome") as string;
  const limite = parseFloat(formData.get("limite") as string);
  const diaFechamento = parseInt(formData.get("diaFechamento") as string, 10);
  const diaVencimento = parseInt(formData.get("diaVencimento") as string, 10);

  if (
    !nome ||
    isNaN(limite) || limite <= 0 ||
    isNaN(diaFechamento) || diaFechamento < 1 || diaFechamento > 31 ||
    isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31
  ) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  await prisma.cartaoCredito.create({
    data: {
      usuarioId: user.id,
      nome,
      limite,
      diaFechamento,
      diaVencimento,
    },
  });

  revalidatePath("/dashboard/cartoes");
  revalidatePath("/dashboard");
}

// Remove um cartão (e suas compras parceladas, via cascade) por id
export async function deletarCartao(id: string) {
  const user = await getUsuarioLogado();

  await prisma.cartaoCredito.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard/cartoes");
  revalidatePath("/dashboard");
}

// Cria uma compra parcelada em um cartão do usuário logado
export async function criarCompraParcelada(formData: FormData) {
  const user = await getUsuarioLogado();

  const cartaoId = formData.get("cartaoId") as string;
  const descricao = formData.get("descricao") as string;
  const valorTotal = parseFloat(formData.get("valorTotal") as string);
  const numParcelas = parseInt(formData.get("numParcelas") as string, 10);
  const dataCompra = new Date(formData.get("dataCompra") as string);

  if (
    !descricao ||
    !cartaoId ||
    isNaN(valorTotal) || valorTotal <= 0 ||
    isNaN(numParcelas) || numParcelas < 1 || numParcelas > 60
  ) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  // Garante que o cartão pertence ao usuário logado antes de vincular a compra
  const cartao = await prisma.cartaoCredito.findFirst({
    where: { id: cartaoId, usuarioId: user.id },
  });
  if (!cartao) throw new Error("Cartão inválido.");

  await prisma.compraParcelada.create({
    data: {
      cartaoId,
      descricao,
      valorTotal,
      numParcelas,
      dataCompra,
    },
  });

  revalidatePath("/dashboard/cartoes");
  revalidatePath("/dashboard");
}

// Remove uma compra parcelada (garante que o cartão pertence ao usuário logado)
export async function deletarCompraParcelada(id: string) {
  const user = await getUsuarioLogado();

  await prisma.compraParcelada.deleteMany({
    where: { id, cartao: { usuarioId: user.id } },
  });

  revalidatePath("/dashboard/cartoes");
  revalidatePath("/dashboard");
}
