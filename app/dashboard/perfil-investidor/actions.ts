"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { calcularPerfil } from "@/lib/perfilInvestidor";

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

  await garantirUsuario(user);
  await prisma.usuario.update({
    where: { id: user.id },
    data: { perfilInvestidor: perfil },
  });

  revalidatePath("/dashboard/perfil-investidor");
  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard/orientacao");
  revalidatePath("/dashboard");
}
