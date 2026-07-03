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

// Inicia o checkout de assinatura Pro redirecionando pro link hospedado do próprio plano — sem
// coletar dados de cartão no FinClara. Esse link é o mesmo pra qualquer assinante (não muda por
// usuário), então NÃO chama a API do Mercado Pago aqui: criar a assinatura via POST /preapproval
// exige card_token_id (tokenizar o cartão no back-end), que é justamente o que queremos evitar.
// O Mercado Pago cria a assinatura de verdade quando o próprio usuário termina o checkout na
// página dele — ainda não sabemos o id dessa assinatura nesse momento, só quando o webhook avisa
// (ver app/api/mercadopago/webhook/route.ts, que faz esse vínculo pelo e-mail na primeira
// notificação). Até lá o status fica PENDENTE (ainda gateado como Free, ver lib/assinatura.ts).
export async function criarAssinatura() {
  const user = await getUsuarioLogado();
  const usuario = await garantirUsuario(user);

  const planId = process.env.MERCADOPAGO_PLAN_ID;
  if (!planId) throw new Error("Mercado Pago não configurado (MERCADOPAGO_PLAN_ID ausente).");

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { statusAssinatura: "PENDENTE" },
  });

  redirect(`https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${planId}`);
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
