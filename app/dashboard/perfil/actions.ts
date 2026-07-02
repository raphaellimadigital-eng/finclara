"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";

// Busca o registro do usuário (incluindo o perfil de investidor já salvo, se houver)
export async function getUsuarioAtual() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  return prisma.usuario.findUniqueOrThrow({ where: { id: user.id } });
}

// Atualiza nome, telefone e endereço dos dados cadastrais. O e-mail não é editável por aqui —
// está atrelado ao login no Supabase Auth e exigiria um fluxo próprio de confirmação.
export async function atualizarDadosCadastrais(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  const nome = formData.get("nome") as string;
  const telefone = (formData.get("telefone") as string) || null;
  const endereco = (formData.get("endereco") as string) || null;

  if (!nome) {
    throw new Error("Informe seu nome.");
  }

  await prisma.usuario.update({
    where: { id: user.id },
    data: { nome, telefone, endereco },
  });

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard");
}
