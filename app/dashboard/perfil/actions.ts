"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { calcularPerfil } from "@/lib/perfilInvestidor";

// Retorna o usuário logado ou lança erro
async function getUsuarioLogado() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

// Busca o registro do usuário (incluindo o perfil de investidor já salvo, se houver)
export async function getUsuarioAtual() {
  const user = await getUsuarioLogado();

  return prisma.usuario.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email!, nome: user.email!.split("@")[0] },
  });
}

// Calcula o perfil a partir das respostas do questionário e salva no usuário
export async function salvarPerfilInvestidor(formData: FormData) {
  const user = await getUsuarioLogado();

  const respostas = [
    parseInt(formData.get("pergunta0") as string, 10),
    parseInt(formData.get("pergunta1") as string, 10),
    parseInt(formData.get("pergunta2") as string, 10),
  ];

  if (respostas.some((r) => isNaN(r))) {
    throw new Error("Responda todas as perguntas.");
  }

  const perfil = calcularPerfil(respostas);

  await prisma.usuario.upsert({
    where: { id: user.id },
    update: { perfilInvestidor: perfil },
    create: { id: user.id, email: user.email!, nome: user.email!.split("@")[0], perfilInvestidor: perfil },
  });

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard/orientacao");
  revalidatePath("/dashboard");
}
