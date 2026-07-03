// Script único, executado manualmente (não faz parte do build/deploy): cria o plano de
// assinatura Pro no Mercado Pago e imprime o id gerado, que deve ser copiado para a env var
// MERCADOPAGO_PLAN_ID. Rodar de novo cria um plano novo — não é idempotente, então só deve
// ser executado uma vez por ambiente (dev/staging/produção têm contas Mercado Pago distintas).
//
// Uso: npx tsx scripts/criar-plano-mercadopago.ts
import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";

const PRECO_MENSAL_PRO_BRL = 19.9;

async function main() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Defina MERCADOPAGO_ACCESS_TOKEN antes de rodar este script.");
    process.exit(1);
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preApprovalPlan = new PreApprovalPlan(client);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Sem free_trial aqui de propósito: o trial de 7 dias já é controlado inteiramente pelo
  // FinClara (Usuario.trialEndsAt) — um free_trial também no Mercado Pago geraria um segundo
  // período grátis para quem assina durante o trial do FinClara.
  const plano = await preApprovalPlan.create({
    body: {
      reason: "FinClara Pro",
      back_url: `${siteUrl}/dashboard/assinatura`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: PRECO_MENSAL_PRO_BRL,
        currency_id: "BRL",
      },
    },
  });

  console.log("Plano criado com sucesso.");
  console.log(`MERCADOPAGO_PLAN_ID=${plano.id}`);
}

main().catch((err) => {
  console.error("Falha ao criar o plano no Mercado Pago:", err);
  process.exit(1);
});
