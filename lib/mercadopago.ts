import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import type { StatusAssinatura } from "@prisma/client";

// Mapeia o status do preapproval do Mercado Pago para o enum interno do FinClara.
// Referência: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview
export function mapearStatusMercadoPago(statusMp: string): StatusAssinatura {
  switch (statusMp) {
    case "authorized":
      return "ATIVA";
    case "paused":
      return "PAUSADA";
    case "cancelled":
      return "CANCELADA";
    case "pending":
    default:
      return "PENDENTE";
  }
}

export type CabecalhosAssinaturaMp = {
  xSignature: string | null;
  xRequestId: string | null;
};

// Segue a mesma manifest string documentada pelo Mercado Pago e usada internamente pelo
// WebhookSignatureValidator do SDK — exportada aqui só para montar assinaturas válidas em teste.
export function montarManifestAssinatura(dataId: string, ts: string, xRequestId: string): string {
  return `id:${dataId};request-id:${xRequestId};ts:${ts};`;
}

// Verifica a assinatura HMAC-SHA256 de um webhook do Mercado Pago via SDK oficial (comparação em
// tempo constante, com tolerância de 5 minutos contra replay de notificações antigas). Retorna
// false em vez de lançar, para o caller decidir o código HTTP de resposta.
export function verificarAssinaturaWebhook(
  headers: CabecalhosAssinaturaMp,
  dataId: string,
  segredo: string
): boolean {
  try {
    WebhookSignatureValidator.validate({
      xSignature: headers.xSignature,
      xRequestId: headers.xRequestId,
      dataId,
      secret: segredo,
      toleranceSeconds: 300,
    });
    return true;
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) return false;
    throw err;
  }
}
