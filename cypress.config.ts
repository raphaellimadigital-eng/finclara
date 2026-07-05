import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { limparDadosDeTeste } from "./lib/limpezaDadosTeste";

// Cypress não carrega .env.local do Next automaticamente — lê na mão as poucas variáveis que os
// testes e tasks precisam (banco e credenciais do Supabase para criar contas de teste
// descartáveis). Não sobrescreve nada que já esteja definido no ambiente (ex: CI).
function carregarEnvLocal() {
  const caminho = path.join(__dirname, ".env.local");
  if (!fs.existsSync(caminho)) return;
  for (const linha of fs.readFileSync(caminho, "utf-8").split("\n")) {
    const match = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, chave, valorBruto] = match;
    if (!process.env[chave]) process.env[chave] = valorBruto.trim().replace(/^"|"$/g, "");
  }
}

carregarEnvLocal();

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      const prisma = new PrismaClient();
      const emailContaFixa: string | undefined = config.env.TEST_EMAIL;

      on("task", {
        // Cria uma conta de teste descartável direto pela API do Supabase (mais rápido e
        // desacoplado do formulário) — usado pelo cenário de onboarding, que precisa de uma
        // conta sempre "zerada". Confirmação automática de e-mail está ativa neste projeto.
        async criarContaTeste({
          email,
          senha,
          nome,
          cpf,
          dataNascimento,
        }: {
          email: string;
          senha: string;
          nome: string;
          cpf: string;
          dataNascimento: string;
        }) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (!url || !apikey) {
            throw new Error("NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes para o task criarContaTeste.");
          }
          const resposta = await fetch(`${url}/auth/v1/signup`, {
            method: "POST",
            headers: { apikey, "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: senha, data: { nome, cpf, dataNascimento } }),
          });
          if (!resposta.ok) {
            throw new Error(`Falha ao criar conta de teste (${resposta.status}): ${await resposta.text()}`);
          }
          return null;
        },

        // Força o usuário (já autenticado ao menos uma vez, ou seja, já com linha em "usuarios")
        // para fora do trial e em plano Free/pendente — sem isso, testar a FaixaPlanoLimitado e
        // o botão "Já paguei, verificar agora" exigiria esperar 7 dias de verdade.
        async forcarPlanoLimitado({
          email,
          statusAssinatura,
        }: {
          email: string;
          statusAssinatura: "SEM_ASSINATURA" | "PENDENTE";
        }) {
          await prisma.usuario.update({
            where: { email },
            data: {
              trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              plano: "FREE",
              statusAssinatura,
            },
          });
          return null;
        },

        // Callable de dentro de qualquer spec, se algum dia for útil limpar no meio da suíte —
        // hoje quem chama isso de fato é o hook after:run logo abaixo, automaticamente.
        async limparDadosDeTeste() {
          return limparDadosDeTeste(prisma, emailContaFixa);
        },
      });

      // Roda sozinho ao final de toda execução (cypress run ou cypress open) — sem isso, cada
      // rodada deixa uma conta descartável nova e mais lançamentos/metas de teste acumulados na
      // conta fixa, lotando o banco à toa com o tempo.
      on("after:run", async () => {
        const resultado = await limparDadosDeTeste(prisma, emailContaFixa);
        console.log(
          `[limpeza de teste] contas descartáveis removidas: ${resultado.contasDescartaveisRemovidas}, ` +
            `lançamentos de teste removidos: ${resultado.lancamentosDeTesteRemovidos}, ` +
            `metas de teste removidas: ${resultado.metasDeTesteRemovidas}`
        );
        await prisma.$disconnect();
      });
    },
  },
});
