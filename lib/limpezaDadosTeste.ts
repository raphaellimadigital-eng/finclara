import type { PrismaClient } from "@prisma/client";

// Padrão de e-mail usado pelas contas descartáveis criadas pelos specs de Cypress (cadastro,
// onboarding, plano limitado) — ver cypress/e2e/02-cadastro-onboarding.cy.ts e
// cypress/e2e/04-plano-limitado.cy.ts. A conta fixa reaproveitada entre execuções usa "+teste"
// (sem "+cy"), então não é atingida por esse filtro.
const PADRAO_EMAIL_CONTA_DESCARTAVEL = "+cy";

// Marca usada nas descrições de lançamentos/metas criados pelos testes (na conta fixa e nas
// descartáveis) — ver os vários `Cypress ${Date.now()}` espalhados pelos specs.
const MARCA_DESCRICAO_TESTE = "Cypress";

export type ResultadoLimpezaTeste = {
  contasDescartaveisRemovidas: number;
  lancamentosDeTesteRemovidos: number;
  metasDeTesteRemovidas: number;
};

// Limpa os dados que os testes de Cypress vão acumulando no banco a cada execução:
// - Contas descartáveis (padrão "+cy" no e-mail): apaga o usuário inteiro — cascata do schema
//   (onDelete: Cascade) já remove lançamentos, metas, dívidas, cartões e limites junto.
// - Conta fixa reaproveitada entre execuções (e-mail passado em `emailContaFixa`): mantém o
//   usuário, só remove os lançamentos/metas com a marca "Cypress" na descrição.
export async function limparDadosDeTeste(
  prisma: PrismaClient,
  emailContaFixa?: string
): Promise<ResultadoLimpezaTeste> {
  const { count: contasDescartaveisRemovidas } = await prisma.usuario.deleteMany({
    where: { email: { contains: PADRAO_EMAIL_CONTA_DESCARTAVEL } },
  });

  let lancamentosDeTesteRemovidos = 0;
  let metasDeTesteRemovidas = 0;

  if (emailContaFixa) {
    const contaFixa = await prisma.usuario.findUnique({ where: { email: emailContaFixa } });
    if (contaFixa) {
      const lancamentos = await prisma.lancamento.deleteMany({
        where: { usuarioId: contaFixa.id, descricao: { contains: MARCA_DESCRICAO_TESTE } },
      });
      const metas = await prisma.meta.deleteMany({
        where: { usuarioId: contaFixa.id, descricao: { contains: MARCA_DESCRICAO_TESTE } },
      });
      lancamentosDeTesteRemovidos = lancamentos.count;
      metasDeTesteRemovidas = metas.count;
    }
  }

  return { contasDescartaveisRemovidas, lancamentosDeTesteRemovidos, metasDeTesteRemovidas };
}
