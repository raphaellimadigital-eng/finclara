"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getUsuarioLogado, garantirUsuario } from "@/lib/auth";

function clienteMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Mercado Pago não configurado (MERCADOPAGO_ACCESS_TOKEN ausente).");
  return new MercadoPagoConfig({ accessToken });
}

// Inicia o checkout de assinatura Pro: cria o preapproval vinculado ao plano configurado e
// redireciona o usuário para o checkout hospedado do Mercado Pago (init_point) — sem coletar
// dados de cartão no FinClara. O status só vira ATIVA quando o webhook confirmar a autorização;
// até lá fica PENDENTE (ainda gateado como Free, ver lib/assinatura.ts).
export async function criarAssinatura() {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);

  const planId = process.env.MERCADOPAGO_PLAN_ID;
  if (!planId) throw new Error("Mercado Pago não configurado (MERCADOPAGO_PLAN_ID ausente).");

  const preApproval = new PreApproval(clienteMercadoPago());
  const assinatura = await preApproval.create({
    body: {
      preapproval_plan_id: planId,
      payer_email: usuario.email,
      external_reference: usuario.id,
      back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/assinatura?sucesso=1`,
    },
  });

  if (!assinatura.id || !assinatura.init_point) {
    throw new Error("Não foi possível iniciar a assinatura no Mercado Pago.");
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { mpAssinaturaId: assinatura.id, statusAssinatura: "PENDENTE" },
  });

  redirect(assinatura.init_point);
}

// Cancela a assinatura Pro no Mercado Pago. O acesso Pro continua valendo até
// usuario.periodoAtualFim (o webhook mantém esse campo no último next_payment_date recebido,
// sem avançar mais depois do cancelamento) — ver lib/assinatura.ts:temAcessoCompleto.
export async function cancelarAssinatura() {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);

  if (!usuario.mpAssinaturaId) throw new Error("Nenhuma assinatura para cancelar.");

  const preApproval = new PreApproval(clienteMercadoPago());
  await preApproval.update({ id: usuario.mpAssinaturaId, body: { status: "cancelled" } });

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { statusAssinatura: "CANCELADA" },
  });

  revalidatePath("/dashboard/assinatura");
  revalidatePath("/dashboard/perfil");
}
