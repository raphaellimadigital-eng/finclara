import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { createClient } from "./supabase-server";
import { prisma } from "./prisma";
import { calcularFimTrial } from "./assinatura";
import { parseDataLocal } from "./data";

// Retorna o usuário logado ou lança erro — usado em toda Server Action que exige sessão.
export async function getUsuarioLogado() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

// Garante que o registro do usuário existe na tabela "usuarios" e retorna a linha. Na primeira
// vez, usa nome/telefone/endereço/CPF/data de nascimento que o usuário informou no cadastro
// (enviados como metadados do supabase.auth.signUp, já que nesse momento ainda não há uma Server
// Action autenticada disponível de forma confiável — ver app/login/page.tsx) e grava o fim do
// trial de 7 dias.
export async function garantirUsuario(user: Pick<User, "id" | "email" | "user_metadata">) {
  const metadata = user.user_metadata ?? {};

  try {
    return await prisma.usuario.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        nome: metadata.nome || user.email!.split("@")[0],
        telefone: metadata.telefone || null,
        endereco: metadata.endereco || null,
        cpf: metadata.cpf || null,
        dataNascimento: metadata.dataNascimento ? parseDataLocal(metadata.dataNascimento) : null,
        trialEndsAt: calcularFimTrial(new Date()),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // O CPF já é checado antes do cadastro (app/login/actions.ts:cpfDisponivel), mas se ainda
      // assim colidir aqui (ex: duas abas cadastrando o mesmo CPF ao mesmo tempo), a mensagem
      // precisa deixar claro que não é a corrida normal de criação da própria linha.
      const alvo = String(err.meta?.target ?? "");
      if (alvo.includes("cpf")) {
        throw new Error("Este CPF já está cadastrado em outra conta.");
      }
      // A home dispara várias buscas em paralelo (lançamentos, dívidas, cartões, metas, limites),
      // cada uma chamando garantirUsuario — na primeira visita após o cadastro, duas chamadas
      // concorrentes podem tentar criar a mesma linha ao mesmo tempo. Se outra já venceu a
      // corrida, o usuário já existe e não há nada a fazer.
      return prisma.usuario.findUniqueOrThrow({ where: { id: user.id } });
    }
    throw err;
  }
}

// Estado de plano/trial/assinatura do usuário logado, cacheado por request (React cache()) já
// que Server Actions, route handlers e o layout do dashboard chamam isso de forma independente
// dentro do mesmo request.
export const getStatusAssinatura = cache(async () => {
  const user = await getUsuarioLogado();
  return garantirUsuario(user);
});
