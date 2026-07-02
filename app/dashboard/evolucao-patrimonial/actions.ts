"use server";

import { prisma } from "@/lib/prisma";
import { getUsuarioLogado } from "@/lib/auth";
import { calcularPatrimonioAtual } from "@/lib/patrimonio";

// Registra uma "foto" do patrimônio atual no mês corrente (idempotente — chamado toda vez que
// o dashboard carrega). É assim que o histórico de evolução patrimonial vai se formando: só a
// partir de quando essa função passa a rodar, um ponto por mês em que o usuário usa o app.
export async function registrarSnapshotPatrimonio() {
  const user = await getUsuarioLogado();

  const [metas, dividas] = await Promise.all([
    prisma.meta.findMany({ where: { usuarioId: user.id } }),
    prisma.divida.findMany({ where: { usuarioId: user.id } }),
  ]);

  const patrimonio = calcularPatrimonioAtual(metas, dividas);
  const agora = new Date();

  await prisma.patrimonioSnapshot.upsert({
    where: {
      usuarioId_ano_mes: { usuarioId: user.id, ano: agora.getFullYear(), mes: agora.getMonth() + 1 },
    },
    update: { patrimonio },
    create: { usuarioId: user.id, ano: agora.getFullYear(), mes: agora.getMonth() + 1, patrimonio },
  });
}

// Busca o histórico de patrimônio registrado, do mais antigo para o mais recente
export async function getHistoricoPatrimonio() {
  const user = await getUsuarioLogado();

  return prisma.patrimonioSnapshot.findMany({
    where: { usuarioId: user.id },
    orderBy: [{ ano: "asc" }, { mes: "asc" }],
  });
}
