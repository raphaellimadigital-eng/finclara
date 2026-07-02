"use server";

import { Resend } from "resend";
import { getUsuarioLogado } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LIMITE_CARACTERES_MENSAGEM } from "@/lib/suporte";

const EMAIL_SUPORTE = "raphaellima.digital@gmail.com";

// Envia a mensagem do formulário de suporte por e-mail via Resend, com os dados do cliente
// (nome, e-mail, telefone) para identificação rápida. Usa o domínio de teste
// onboarding@resend.dev — funciona sem verificar domínio próprio porque o destinatário é
// sempre o e-mail da conta Resend (raphaellima.digital@gmail.com).
export async function enviarMensagemSuporte(formData: FormData) {
  const user = await getUsuarioLogado();

  const mensagem = (formData.get("mensagem") as string ?? "").trim();
  if (!mensagem) {
    throw new Error("Escreva sua mensagem antes de enviar.");
  }
  if (mensagem.length > LIMITE_CARACTERES_MENSAGEM) {
    throw new Error(`Sua mensagem passou de ${LIMITE_CARACTERES_MENSAGEM} caracteres. Resuma um pouco e tente de novo.`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Envio de e-mail não configurado. Tente pelo WhatsApp por enquanto.");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: user.id } });
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "FinClara <onboarding@resend.dev>",
    to: EMAIL_SUPORTE,
    replyTo: user.email,
    subject: "FinClara - Nova mensagem de suporte",
    text: [
      `Nome: ${usuario?.nome || "-"}`,
      `E-mail: ${user.email}`,
      `Telefone: ${usuario?.telefone || "-"}`,
      "",
      "Mensagem:",
      mensagem,
    ].join("\n"),
  });

  if (error) {
    throw new Error("Não foi possível enviar sua mensagem agora. Tente novamente ou use o WhatsApp.");
  }
}
