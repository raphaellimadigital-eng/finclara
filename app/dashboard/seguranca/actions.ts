"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";

// Apaga todos os dados financeiros do usuário (lançamentos, dívidas, cartões, metas, limites e
// perfil), mantendo o login ativo — direito de exclusão previsto na LGPD (seção 15.2 da proposta).
// A remoção da linha "usuarios" arrasta em cascata todas as tabelas relacionadas.
export async function excluirMeusDados() {
  const user = await getUsuarioLogado();

  await prisma.usuario.deleteMany({ where: { id: user.id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/seguranca");
}
