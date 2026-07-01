"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { Categoria } from "@prisma/client";

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

// Busca todos os limites de categoria do usuário logado
export async function getLimites() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  return prisma.limiteCategoria.findMany({
    where: { usuarioId: user.id },
    orderBy: { categoria: "asc" },
  });
}

// Cria ou atualiza o limite de uma categoria (uma categoria só tem um limite por usuário)
export async function salvarLimite(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user.id, user.email!);

  const categoria = formData.get("categoria") as Categoria;
  const valorLimite = parseFloat(formData.get("valorLimite") as string);

  if (!categoria || isNaN(valorLimite) || valorLimite <= 0) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  await prisma.limiteCategoria.upsert({
    where: { usuarioId_categoria: { usuarioId: user.id, categoria } },
    update: { valorLimite },
    create: { usuarioId: user.id, categoria, valorLimite },
  });

  revalidatePath("/dashboard/limites");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}

// Remove o limite de uma categoria por id (garante que pertence ao usuário logado)
export async function deletarLimite(id: string) {
  const user = await getUsuarioLogado();

  await prisma.limiteCategoria.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard/limites");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}
