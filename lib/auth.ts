import { createClient } from "./supabase-server";
import { prisma } from "./prisma";

// Retorna o usuário logado ou lança erro — usado em toda Server Action que exige sessão.
export async function getUsuarioLogado() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

// Garante que o registro do usuário existe na tabela "usuarios"
export async function garantirUsuario(id: string, email: string) {
  await prisma.usuario.upsert({
    where: { id },
    update: {},
    create: { id, email, nome: email.split("@")[0] },
  });
}
