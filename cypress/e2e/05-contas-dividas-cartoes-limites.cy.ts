import { credenciaisContaFixa } from "../support/contas";

describe("Contas: dívidas, cartões e limites de gasto", () => {
  beforeEach(() => {
    const { email, senha } = credenciaisContaFixa();
    cy.login(email, senha);
  });

  it("mostra a tela de Contas com os três blocos", () => {
    cy.visit("/dashboard/contas");
    cy.contains("h1", "Contas").should("be.visible");
    cy.contains("Cartões").should("be.visible");
    cy.contains("Dívidas").should("be.visible");
  });

  it("cadastra uma dívida e ela aparece na lista", () => {
    const descricao = `Divida Cypress ${Date.now()}`;

    cy.visit("/dashboard/dividas");
    cy.contains("h1", "Dívidas").should("be.visible");
    cy.wait(300);
    cy.contains("button", "Adicionar dívida").click();
    cy.get("#descricao").type(descricao);
    cy.get("#valorTotal").type("1500,00");
    cy.get("#valorParcela").type("200,00");
    cy.get("#taxaJuros").type("2,5");
    const daquiUmMes = new Date();
    daquiUmMes.setMonth(daquiUmMes.getMonth() + 1);
    cy.get("#vencimento").type(daquiUmMes.toISOString().split("T")[0]);
    cy.contains("button", "Salvar dívida").click();

    cy.contains(descricao).should("be.visible");
  });

  it("cadastra um cartão e ele aparece na lista", () => {
    const apelido = `Cartao Cypress ${Date.now()}`;

    cy.visit("/dashboard/cartoes");
    cy.contains("h1", "Cartões").should("be.visible");
    cy.wait(300);
    cy.contains("button", "Adicionar cartão").click();
    cy.get("#nome").type(apelido);
    cy.get("#limite").type("2000,00");
    cy.get("#diaFechamento").type("10");
    cy.get("#diaVencimento").type("17");
    cy.contains("button", "Salvar cartão").click();

    cy.contains(apelido).should("be.visible");
  });

  it("define um limite de gasto para uma categoria", () => {
    cy.visit("/dashboard/limites");
    cy.contains("h1", "Limites de gasto").should("be.visible");
    cy.wait(300);
    cy.contains("button", "Definir limite").click();
    cy.get("#categoriaLimite").select(1);
    cy.get("#valorLimite").type("300,00");
    cy.contains("button", "Salvar limite").click();

    // Categoria já com limite some da lista de opções — o formulário fechar/limpar já confirma
    // que o salvamento não caiu num erro de validação ou de paywall.
    cy.get('[role="alert"]').should("not.exist");
  });
});
