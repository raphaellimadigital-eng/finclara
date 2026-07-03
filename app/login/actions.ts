"use server";

import { prisma } from "@/lib/prisma";

// Checa se o CPF já está em uso por outra conta, antes de criar o cadastro no Supabase Auth —
// evita criar uma conta de autenticação "órfã" que só descobriria o CPF duplicado depois, na
// primeira visita ao dashboard (quando garantirUsuario tenta gravar a linha em "usuarios").
export async function cpfDisponivel(cpf: string): Promise<boolean> {
  const digitos = cpf.replace(/\D/g, "");
  const existente = await prisma.usuario.findUnique({ where: { cpf: digitos } });
  return !existente;
}
