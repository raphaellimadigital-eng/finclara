"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { TipoMeta } from "@prisma/client";

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

// Busca todas as metas do usuário logado, ordenadas por prazo (mais próximo primeiro)
export async function getMetas() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  return prisma.meta.findMany({
    where: { usuarioId: user.id },
    orderBy: { prazo: "asc" },
  });
}

// Cria uma nova meta
export async function criarMeta(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const tipo = formData.get("tipo") as TipoMeta;
  const descricao = formData.get("descricao") as string;
  const valorAlvo = parseFloat(formData.get("valorAlvo") as string);
  const prazo = new Date(formData.get("prazo") as string);

  if (!descricao || isNaN(valorAlvo) || valorAlvo <= 0) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  await prisma.meta.create({
    data: {
      usuarioId: user.id,
      tipo,
      descricao,
      valorAlvo,
      prazo,
    },
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}

// Registra um aporte em uma meta, aumentando o valor já juntado
export async function aportarMeta(formData: FormData) {
  const user = await getUsuarioLogado();

  const id = formData.get("metaId") as string;
  const valor = parseFloat(formData.get("valor") as string);

  if (!id || isNaN(valor) || valor <= 0) {
    throw new Error("Informe um valor válido para o aporte.");
  }

  const meta = await prisma.meta.findFirst({ where: { id, usuarioId: user.id } });
  if (!meta) throw new Error("Meta inválida.");

  await prisma.meta.update({
    where: { id },
    data: { valorAtual: Number(meta.valorAtual) + valor },
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}

// Remove uma meta por id (garante que pertence ao usuário logado)
export async function deletarMeta(id: string) {
  const user = await getUsuarioLogado();

  await prisma.meta.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}
