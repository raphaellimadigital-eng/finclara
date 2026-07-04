"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { parseDataLocal } from "@/lib/data";
import { TipoMeta } from "@prisma/client";
import { erroPaywall, podeUsarFeature } from "@/lib/assinatura";
import { calcularProjecao } from "@/lib/metas";
import { MSG_VALOR_MAXIMO, VALOR_MONETARIO_MAXIMO, valorMonetarioValido } from "@/lib/valores";
import { schemaDescricao, validar } from "@/lib/textos";

// Busca todas as metas do usuário logado, ordenadas por prazo (mais próximo primeiro)
export async function getMetas() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  return prisma.meta.findMany({
    where: { usuarioId: user.id },
    orderBy: { prazo: "asc" },
  });
}

// Cria uma nova meta
export async function criarMeta(formData: FormData) {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);

  const metasExistentes = await prisma.meta.findMany({ where: { usuarioId: user.id } });
  const metasAtivas = metasExistentes.filter((m) => !calcularProjecao(m).concluida).length;
  if (!podeUsarFeature(usuario, "meta_extra", { contagemAtual: metasAtivas })) {
    throw erroPaywall("O plano Free permite apenas 1 meta ativa por vez.");
  }

  const tipo = formData.get("tipo") as TipoMeta;
  const descricao = validar(schemaDescricao, formData.get("descricao"));
  const valorAlvo = parseFloat(formData.get("valorAlvo") as string);
  const prazo = parseDataLocal(formData.get("prazo") as string);

  if (isNaN(valorAlvo) || valorAlvo <= 0) {
    throw new Error("Informe um valor maior que zero.");
  }
  if (!valorMonetarioValido(valorAlvo)) throw new Error(MSG_VALOR_MAXIMO);

  await prisma.meta.create({
    data: {
      usuarioId: user.id,
      tipo,
      descricao,
      valorAlvo,
      prazo,
    },
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}

// Registra um aporte em uma meta, aumentando o valor já juntado
export async function aportarMeta(formData: FormData) {
  const user = await getUsuarioLogado();

  const id = formData.get("metaId") as string;
  const valor = parseFloat(formData.get("valor") as string);

  if (!id || isNaN(valor) || valor <= 0) {
    throw new Error("Informe um valor válido para o aporte.");
  }
  if (!valorMonetarioValido(valor)) throw new Error(MSG_VALOR_MAXIMO);

  const meta = await prisma.meta.findFirst({ where: { id, usuarioId: user.id } });
  if (!meta) throw new Error("Meta inválida.");

  // O acumulado também respeita o teto — aportes repetidos não podem estourar a coluna.
  const novoValorAtual = Number(meta.valorAtual) + valor;
  if (novoValorAtual > VALOR_MONETARIO_MAXIMO) {
    throw new Error("O total juntado na meta não pode passar de R$ 1.000.000,00.");
  }

  // Guardar numa meta também vira um registro "Guardei" vinculado (metaId) — o dinheiro é
  // digitado uma vez só e o Resumo/alocação do mês enxergam o aporte. Meta de reserva de
  // emergência conta como reserva; as demais, como investimento.
  await prisma.$transaction([
    prisma.meta.update({
      where: { id },
      data: { valorAtual: novoValorAtual },
    }),
    prisma.lancamento.create({
      data: {
        usuarioId: user.id,
        tipo: "INVESTIMENTO",
        categoria: meta.tipo === "RESERVA" ? "RESERVA_EMERGENCIA" : "OUTROS_INVESTIMENTOS",
        descricao: `Guardado na meta: ${meta.descricao}`,
        valor,
        data: new Date(),
        metaId: meta.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}

// Remove uma meta por id (garante que pertence ao usuário logado)
export async function deletarMeta(id: string) {
  const user = await getUsuarioLogado();

  await prisma.meta.deleteMany({
    where: { id, usuarioId: user.id },
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
}
