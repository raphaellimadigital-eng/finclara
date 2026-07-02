import type { User } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { createClient } from "./supabase-server";
import { prisma } from "./prisma";

// Retorna o usuário logado ou lança erro — usado em toda Server Action que exige sessão.
export async function getUsuarioLogado() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

// Garante que o registro do usuário existe na tabela "usuarios". Na primeira vez, usa
// nome/telefone/endereço que o usuário informou no cadastro (enviados como metadados do
// supabase.auth.signUp, já que nesse momento ainda não há uma Server Action autenticada
// disponível de forma confiável — ver app/login/page.tsx).
export async function garantirUsuario(user: Pick<User, "id" | "email" | "user_metadata">) {
  const metadata = user.user_metadata ?? {};

  try {
    await prisma.usuario.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        nome: metadata.nome || user.email!.split("@")[0],
        telefone: metadata.telefone || null,
        endereco: metadata.endereco || null,
      },
    });
  } catch (err) {
    // A home dispara várias buscas em paralelo (lançamentos, dívidas, cartões, metas, limites),
    // cada uma chamando garantirUsuario — na primeira visita após o cadastro, duas chamadas
    // concorrentes podem tentar criar a mesma linha ao mesmo tempo. Se outra já venceu a
    // corrida, o usuário já existe e não há nada a fazer.
    const jaExiste = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
    if (!jaExiste) throw err;
  }
}
