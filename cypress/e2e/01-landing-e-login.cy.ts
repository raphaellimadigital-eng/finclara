import { credenciaisContaFixa } from "../support/contas";

describe("Landing pública e autenticação", () => {
  it("mostra a landing page com CTA de cadastro para visitante não logado", () => {
    cy.visit("/");
    cy.contains("h1", "Organize suas finanças").should("be.visible");
    // Dá um instante pro root terminar de hidratar antes de clicar — clicar cedo demais no
    // primeiro visit da suíte deixa o link do Next ainda não interativo.
    cy.wait(300);
    cy.contains("a", "Criar conta grátis").first().click();
    cy.location("pathname", { timeout: 10000 }).should("eq", "/login");
    cy.location("search").should("eq", "?modo=cadastro");
    cy.get("#nome").should("be.visible");
  });

  it("alterna entre as abas Entrar e Criar conta grátis", () => {
    cy.visitarLogin();
    cy.get("#nome").should("not.exist");
    cy.contains('[role="tab"]', "Criar conta grátis").click();
    cy.get("#nome").should("be.visible");
    cy.get("#cpf").should("be.visible");
    cy.contains('[role="tab"]', "Entrar").click();
    cy.get("#nome").should("not.exist");
  });

  it("mostra erro claro para credenciais inválidas", () => {
    cy.visitarLogin();
    cy.get("#email").type("naoexiste-cypress@finclara.invalido");
    cy.get("#senha").type("senha-errada-123", { log: false });
    cy.get('form.card button[type="submit"]').click();
    cy.get('[role="alert"]').should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("faz login com a conta de teste e chega ao dashboard", () => {
    const { email, senha } = credenciaisContaFixa();
    cy.visitarLogin();
    cy.get("#email").type(email);
    cy.get("#senha").type(senha, { log: false });
    cy.get('form.card button[type="submit"]').click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");
    cy.contains("Olá,").should("be.visible");
    cy.contains("Como está seu mês").should("be.visible");
  });
});
