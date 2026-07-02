"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { Categoria, TipoLancamento } from "@prisma/client";

// Quantidade de meses futuros gerados automaticamente ao marcar um lançamento como
// recorrente (12 meses no total, contando o mês do cadastro).
const MESES_RECORRENCIA_FUTURA = 11;

// Soma "meses" à data mantendo o dia, ajustado para o último dia do mês de destino
// quando ele for mais curto (ex.: dia 31 de janeiro + 1 mês = 28/29 de fevereiro).
function adicionarMeses(data: Date, meses: number): Date {
  const dia = data.getDate();
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimoDiaDoMesAlvo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  alvo.setDate(Math.min(dia, ultimoDiaDoMesAlvo));
  return alvo;
}

// Busca todos os lançamentos do mês/ano informado para o usuário logado
export async function getLancamentos(ano: number, mes: number) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  return prisma.lancamento.findMany({
    where: {
      usuarioId: user.id,
      data: { gte: inicio, lte: fim },
    },
    orderBy: { data: "desc" },
  });
}

// Cria um novo lançamento
export async function criarLancamento(formData: FormData) {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  const tipo = formData.get("tipo") as TipoLancamento;
  const categoria = formData.get("categoria") as Categoria;
  const descricao = formData.get("descricao") as string;
  const valor = parseFloat(formData.get("valor") as string);
  const data = new Date(formData.get("data") as string);
  const recorrente = formData.get("recorrente") === "on";

  if (!descricao || isNaN(valor) || valor <= 0) {
    throw new Error("Preencha todos os campos corretamente.");
  }

  // Lançamentos recorrentes já nascem com as ocorrências dos próximos meses criadas,
  // para que o usuário não precise recadastrá-los todo mês.
  const serieRecorrenciaId = recorrente ? randomUUID() : null;

  await prisma.lancamento.create({
    data: {
      usuarioId: user.id,
      tipo,
      categoria,
      descricao,
      valor,
      data,
      recorrente,
      serieRecorrenciaId,
    },
  });

  if (recorrente && serieRecorrenciaId) {
    await prisma.lancamento.createMany({
      data: Array.from({ length: MESES_RECORRENCIA_FUTURA }, (_, i) => ({
        usuarioId: user.id,
        tipo,
        categoria,
        descricao,
        valor,
        data: adicionarMeses(data, i + 1),
        recorrente: true,
        serieRecorrenciaId,
      })),
    });
  }

  revalidatePath("/dashboard");
}

// Remove um único lançamento por id (garante que pertence ao usuário logado)
export async function deletarLancamento(id: string) {
  const user = await getUsuarioLogado();

  await prisma.lancamento.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard");
}

// Remove este lançamento e as ocorrências futuras da mesma série recorrente
// (mantém intactos os meses já passados, que já aconteceram de fato).
export async function deletarLancamentoEFuturos(id: string) {
  const user = await getUsuarioLogado();

  const lancamento = await prisma.lancamento.findFirst({
    where: { id, usuarioId: user.id },
  });
  if (!lancamento) return;

  if (lancamento.serieRecorrenciaId) {
    await prisma.lancamento.deleteMany({
      where: {
        usuarioId: user.id,
        serieRecorrenciaId: lancamento.serieRecorrenciaId,
        data: { gte: lancamento.data },
      },
    });
  } else {
    await prisma.lancamento.deleteMany({ where: { id, usuarioId: user.id } });
  }

  revalidatePath("/dashboard");
}
