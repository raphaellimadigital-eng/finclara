import { credenciaisContaFixa } from "../support/contas";

describe("Dashboard: lançamentos e metas (regressão dos fluxos críticos)", () => {
  beforeEach(() => {
    const { email, senha } = credenciaisContaFixa();
    cy.login(email, senha);
    cy.visit("/dashboard");
    cy.dismissarTourSePresente();
  });

  it("mostra o resumo do mês no dashboard", () => {
    cy.contains("Como está seu mês").should("be.visible");
    cy.contains("Entrou").should("be.visible");
    cy.contains("Saiu").should("be.visible");
  });

  it("adiciona uma receita pelo botão Registrar e ela aparece nos últimos registros", () => {
    const descricao = `Receita Cypress ${Date.now()}`;

    cy.contains("button", "Registrar").click();
    cy.get(".folha").within(() => {
      cy.contains("button", "Entrou").click();
      cy.get("#descricao").type(descricao);
      cy.get("#categoria").select(1);
      cy.get("#valor").type("500,00");
    });
    cy.get(".folha").contains("button", "Salvar").click();
    cy.get(".folha").should("not.exist");
    // Recarrega pra garantir dados frescos do servidor, em vez de confiar no tempo do refresh
    // automático da rota (variável) — mais determinístico que um wait fixo.
    cy.reload();
    cy.contains("Últimos registros").should("be.visible");
    cy.wait(300);

    // A conta fixa acumula lançamentos entre execuções — "Últimos registros" só mostra os 5
    // mais recentes por padrão, então o item novo pode cair fora da prévia.
    cy.get("body").then(($body) => {
      if ($body.find('button:contains("Ver todos")').length > 0) {
        cy.contains("button", "Ver todos").click();
      }
    });
    cy.contains(descricao).should("be.visible");
  });

  it("adiciona uma despesa pelo botão Registrar e ela aparece nos últimos registros", () => {
    const descricao = `Despesa Cypress ${Date.now()}`;

    cy.contains("button", "Registrar").click();
    cy.get(".folha").within(() => {
      cy.contains("button", "Saiu").click();
      cy.get("#descricao").type(descricao);
      cy.get("#categoria").select(1);
      cy.get("#valor").type("75,50");
    });
    cy.get(".folha").contains("button", "Salvar").click();
    cy.get(".folha").should("not.exist");
    // Recarrega pra garantir dados frescos do servidor, em vez de confiar no tempo do refresh
    // automático da rota (variável) — mais determinístico que um wait fixo.
    cy.reload();
    cy.contains("Últimos registros").should("be.visible");
    cy.wait(300);

    // A conta fixa acumula lançamentos entre execuções — "Últimos registros" só mostra os 5
    // mais recentes por padrão, então o item novo pode cair fora da prévia.
    cy.get("body").then(($body) => {
      if ($body.find('button:contains("Ver todos")').length > 0) {
        cy.contains("button", "Ver todos").click();
      }
    });
    cy.contains(descricao).should("be.visible");
  });

  it("cria uma meta e ela aparece na lista de metas", () => {
    const descricao = `Meta Cypress ${Date.now()}`;

    cy.visit("/dashboard/metas");
    cy.contains("Metas").should("be.visible");
    cy.wait(300);
    cy.contains("button", "Nova meta").click();
    cy.get("#tipo").select(1);
    cy.get("#descricaoMeta").type(descricao);
    cy.get("#valorAlvo").type("2000,00");
    const daquiUmAno = new Date();
    daquiUmAno.setFullYear(daquiUmAno.getFullYear() + 1);
    cy.get("#prazo").type(daquiUmAno.toISOString().split("T")[0]);
    cy.contains("button", "Salvar meta").click();

    cy.contains(descricao).should("be.visible");
  });
});
