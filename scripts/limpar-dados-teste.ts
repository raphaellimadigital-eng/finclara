// Limpa manualmente os dados que os testes de Cypress acumulam no banco: apaga as contas
// descartáveis (e-mail com "+cy") e os lançamentos/metas de teste da conta fixa reaproveitada
// entre execuções. Normalmente isso já roda sozinho ao final de `npm run test:e2e` (ver
// cypress.config.ts, hook after:run) — este script é só para limpar manualmente quando quiser,
// sem precisar rodar a suíte inteira.
//
// Uso: npx tsx scripts/limpar-dados-teste.ts
import { prisma } from "../lib/prisma";
import { limparDadosDeTeste } from "../lib/limpezaDadosTeste";

async function main() {
  let emailContaFixa: string | undefined;
  try {
    const cypressEnv = require("../cypress.env.json");
    emailContaFixa = cypressEnv.TEST_EMAIL;
  } catch {
    // cypress.env.json não existe neste ambiente — segue só limpando as contas descartáveis.
  }

  const resultado = await limparDadosDeTeste(prisma, emailContaFixa);
  console.log(`Contas descartáveis removidas: ${resultado.contasDescartaveisRemovidas}`);
  console.log(`Lançamentos de teste removidos (conta fixa): ${resultado.lancamentosDeTesteRemovidos}`);
  console.log(`Metas de teste removidas (conta fixa): ${resultado.metasDeTesteRemovidas}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
