import { gerarCpfValido } from "../support/cpf";

// Cada execução cria uma conta nova e descartável (confirmação de e-mail é automática neste
// projeto) — é a única forma de testar de verdade o estado "recém-cadastrado", já que a conta
// de teste fixa usada nos outros specs completa o onboarding na primeira vez e nunca mais volta
// a esse estado.
const timestamp = Date.now();
const EMAIL = `phaelju+cy${timestamp}@gmail.com`;
const SENHA = "Cypress!Onboarding123";
const NOME = "Usuária Teste Cypress";
const CPF = gerarCpfValido();
const DATA_NASCIMENTO = "1990-05-15";

describe("Cadastro e onboarding guiado do primeiro acesso", () => {
  before(() => {
    cy.task("criarContaTeste", { email: EMAIL, senha: SENHA, nome: NOME, cpf: CPF, dataNascimento: DATA_NASCIMENTO });
  });

  beforeEach(() => {
    cy.session(["onboarding", EMAIL], () => {
      cy.visitarLogin();
      cy.get("#email").type(EMAIL);
      cy.get("#senha").type(SENHA, { log: false });
      cy.get('form.card button[type="submit"]').click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");
    });
    cy.visit("/dashboard");
  });

  it("mostra o checklist de primeiros passos e o tour guiado", () => {
    cy.contains("Primeiros passos no FinClara").should("be.visible");

    cy.get('[data-tour="resumo"]').should("be.visible");
    cy.contains("1 de 4").should("be.visible");
    cy.contains("Seu resumo do mês").should("be.visible");
    cy.contains("button", "Pular").click();
    cy.contains("Seu resumo do mês").should("not.exist");
  });

  it("restringe o menu 'Mais' no mobile enquanto o onboarding não termina", () => {
    cy.dismissarTourSePresente();
    cy.viewport(375, 812);
    cy.contains("button", "Mais").click();
    cy.contains("Mais opções aparecem aqui").should("be.visible");
    cy.contains("a", "Relatórios").should("not.exist");
    cy.contains("a", "Configurações").should("not.exist");
    cy.get(".folha").contains("button", "Sair").should("be.visible");
  });

  it("esconde os itens secundários da sidebar no desktop enquanto o onboarding não termina", () => {
    cy.dismissarTourSePresente();
    cy.viewport(1440, 900);
    cy.get(".nav-so-desktop").contains("Relatórios").should("not.exist");
    cy.get(".nav-so-desktop").contains("Configurações").should("not.exist");
    cy.get(".nav-so-desktop").contains("Sair").should("be.visible");
  });

  it("completa os 3 primeiros passos e libera o menu completo", () => {
    cy.dismissarTourSePresente();

    // 1. Receita — o checklist só desaparece por inteiro quando os 3 passos terminam (ver
    // OnboardingPrimeirosPassos: cada linha fica marcada/desabilitada, não some sozinha), então
    // a verificação real de conclusão é só no fim, depois da meta.
    cy.contains("button", "Registre quanto entrou este mês").click();
    cy.get("#descricao").type("Salário de teste Cypress");
    cy.get("#categoria").select(1);
    cy.get("#valor").type("3000,00");
    cy.get(".folha").contains("button", "Salvar").click();
    cy.get(".folha").should("not.exist");
    // Salvar dispara um refresh automático da rota (revalidatePath) — dá um instante pra essa
    // atualização assentar antes de abrir a próxima folha, senão o Cypress interage com um
    // formulário em plena transição.
    cy.wait(500);

    // 2. Despesa
    cy.contains("button", "Registre um gasto de hoje").click();
    cy.get("#descricao").type("Mercado de teste Cypress");
    cy.get("#categoria").select(1);
    cy.get("#valor").type("150,00");
    cy.get(".folha").contains("button", "Salvar").click();
    cy.get(".folha").should("not.exist");

    // 3. Meta
    cy.contains("a", "Crie sua primeira meta").click();
    cy.location("pathname").should("eq", "/dashboard/metas");
    cy.contains("button", "Nova meta").click();
    cy.get("#tipo").select(1);
    cy.get("#descricaoMeta").type("Meta de teste Cypress");
    cy.get("#valorAlvo").type("1000,00");
    const daquiUmAno = new Date();
    daquiUmAno.setFullYear(daquiUmAno.getFullYear() + 1);
    cy.get("#prazo").type(daquiUmAno.toISOString().split("T")[0]);
    cy.contains("button", "Salvar meta").click();
    cy.contains("Meta de teste Cypress").should("be.visible");

    // De volta ao dashboard: onboarding concluído, checklist some e menu libera
    cy.visit("/dashboard");
    cy.contains("Primeiros passos no FinClara").should("not.exist");
    cy.viewport(1440, 900);
    cy.get(".nav-so-desktop").contains("Relatórios").should("be.visible");
  });
});
