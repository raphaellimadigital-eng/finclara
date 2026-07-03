import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mapearStatusMercadoPago, verificarAssinaturaWebhook } from "@/lib/mercadopago";

// Recebe notificações de assinatura do Mercado Pago. Fica fora de /dashboard (e portanto fora
// do matcher do middleware.ts) porque o Mercado Pago chama isso sem sessão de usuário — a
// autenticidade é garantida pela assinatura HMAC do header x-signature, não por cookie.
export async function POST(request: Request) {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!segredo || !accessToken) {
    console.error("Webhook Mercado Pago recebido sem MERCADOPAGO_WEBHOOK_SECRET/MERCADOPAGO_ACCESS_TOKEN configurados.");
    return new Response(null, { status: 500 });
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!dataId || !verificarAssinaturaWebhook({ xSignature, xRequestId }, dataId, segredo)) {
    return new Response(null, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return new Response(null, { status: 400 });

  const mpEventoId = "id" in payload && payload.id != null ? String(payload.id) : null;
  const tipo = "type" in payload && typeof payload.type === "string" ? payload.type : "desconhecido";
  if (!mpEventoId) return new Response(null, { status: 400 });

  // Idempotência: o Mercado Pago reenvia notificações quando não recebe 2xx a tempo — se esse
  // evento já foi processado, respondemos 200 sem refazer o trabalho.
  const jaProcessado = await prisma.eventoWebhookAssinatura.findUnique({ where: { mpEventoId } });
  if (jaProcessado) return new Response(null, { status: 200 });

  let usuario = await prisma.usuario.findUnique({ where: { mpAssinaturaId: dataId } });

  if (tipo === "subscription_preapproval") {
    // Nunca confiamos só no corpo da notificação — buscamos o estado canônico da assinatura.
    const preApproval = new PreApproval(new MercadoPagoConfig({ accessToken }));
    const assinatura = await preApproval.get({ id: dataId });

    // O checkout usa o link hospedado do próprio plano (sem chamar a API no clique de "Assinar",
    // já que isso exigiria coletar o cartão no back-end) — então ainda não sabemos qual usuário
    // corresponde a esse mpAssinaturaId até essa primeira notificação chegar. Faz o link agora
    // pelo e-mail do pagador (único na tabela de usuários).
    if (!usuario && assinatura.payer_email) {
      usuario = await prisma.usuario.findUnique({ where: { email: assinatura.payer_email } });
    }

    if (usuario) {
      const statusAssinatura = mapearStatusMercadoPago(assinatura.status ?? "pending");

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          mpAssinaturaId: dataId,
          statusAssinatura,
          plano: statusAssinatura === "ATIVA" || statusAssinatura === "PAUSADA" ? "PRO" : usuario.plano,
          // periodoAtualFim só avança enquanto a assinatura segue cobrando; depois de cancelada o
          // Mercado Pago não manda mais next_payment_date novo, então o valor fica congelado no
          // último ciclo já pago — é isso que garante acesso até o fim do período (ver
          // lib/assinatura.ts:temAcessoCompleto).
          periodoAtualFim: assinatura.next_payment_date
            ? new Date(assinatura.next_payment_date)
            : usuario.periodoAtualFim,
        },
      });
    }
  }

  await prisma.eventoWebhookAssinatura.create({
    data: {
      usuarioId: usuario?.id,
      mpEventoId,
      tipo,
      payload,
    },
  });

  return new Response(null, { status: 200 });
}
