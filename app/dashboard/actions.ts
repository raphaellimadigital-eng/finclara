"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { Categoria, TipoLancamento } from "@prisma/client";

// Retorna o usuário logado ou lança erro
async function getUsuarioLogado() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

// Garante que o registro do usuário existe na tabela "usuarios"
async function garantirUsuario(id: string, email: string) {
  await prisma.usuario.upsert({
    where: { id },
    update: {},
    create: { id, email, nome: email.split("@")[0] },
  });
}

// Busca todos os lançamentos do mês/ano informado para o usuário logado
export async function getLancamentos(ano: number, mes: number) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  return prisma.lancamento.findMany({
    where: {
      usuarioId: user.id,
      data: { gte: inicio, lte: fim },
    },
    orderBy: { data: "desc" },
  });
}

// Cria um novo lançamento
export async function criarLancamento(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const tipo = formData.get("tipo") as TipoLancamento;
  const categoria = formData.get("categoria") as Categoria;
  const descricao = formData.get("descricao") as string;
  const valor = parseFloat(formData.get("valor") as string);
  const data = new Date(formData.get("data") as string);
  const recorrente = formData.get("recorrente") === "on";

  if (!descricao || isNaN(valor) || valor <= 0) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  await prisma.lancamento.create({
    data: {
      usuarioId: user.id,
      tipo,
      categoria,
      descricao,
      valor,
      data,
      recorrente,
    },
  });

  revalidatePath("/dashboard");
}

// Remove um lançamento por id (garante que pertence ao usuário logado)
export async function deletarLancamento(id: string) {
  const user = await getUsuarioLogado();

  await prisma.lancamento.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard");
}
