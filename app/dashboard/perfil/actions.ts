"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";
import { cpfValido } from "@/lib/cpf";
import { maiorDeIdade, parseDataLocal } from "@/lib/data";
import { schemaEndereco, schemaNomeUsuario, schemaTelefone, validar } from "@/lib/textos";

// Busca o registro do usuário (incluindo o perfil de investidor já salvo, se houver)
export async function getUsuarioAtual() {
  const user = await getUsuarioLogado();
  await garantirUsuario(user);

  return prisma.usuario.findUniqueOrThrow({ where: { id: user.id } });
}

// Atualiza nome, telefone e endereço dos dados cadastrais. O e-mail não é editável por aqui —
// está atrelado ao login no Supabase Auth e exigiria um fluxo próprio de confirmação. CPF e data
// de nascimento seguem a mesma lógica: só podem ser preenchidos uma vez (contas antigas, criadas
// antes desses campos existirem no cadastro) — depois de definidos, viram identidade fixa.
export async function atualizarDadosCadastrais(formData: FormData) {
  const user = await getUsuarioLogado();
  const usuarioAtual = await garantirUsuario(user);

  const nome = validar(schemaNomeUsuario, formData.get("nome"));
  const telefoneBruto = (formData.get("telefone") as string) || "";
  const enderecoBruto = (formData.get("endereco") as string) || "";
  const telefone = telefoneBruto.trim() ? validar(schemaTelefone, telefoneBruto) : null;
  const endereco = enderecoBruto.trim() ? validar(schemaEndereco, enderecoBruto) : null;

  const dados: Prisma.UsuarioUpdateInput = { nome, telefone, endereco };

  if (!usuarioAtual.cpf) {
    const cpf = (formData.get("cpf") as string) || "";
    if (cpf) {
      if (!cpfValido(cpf)) throw new Error("Digite um CPF válido.");
      dados.cpf = cpf.replace(/\D/g, "");
    }
  }

  if (!usuarioAtual.dataNascimento) {
    const dataNascimentoRaw = (formData.get("dataNascimento") as string) || "";
    if (dataNascimentoRaw) {
      const dataNascimento = parseDataLocal(dataNascimentoRaw);
      if (!maiorDeIdade(dataNascimento)) {
        throw new Error("É preciso ser maior de 18 anos.");
      }
      dados.dataNascimento = dataNascimento;
    }
  }

  try {
    await prisma.usuario.update({ where: { id: user.id }, data: dados });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("Este CPF já está cadastrado em outra conta.");
    }
    throw err;
  }

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard");
}
