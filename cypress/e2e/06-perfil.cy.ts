import { credenciaisContaFixa } from "../support/contas";

describe("Perfil: dados cadastrais", () => {
  beforeEach(() => {
    const { email, senha } = credenciaisContaFixa();
    cy.login(email, senha);
    cy.visit("/dashboard/perfil");
    cy.contains("h1", "Perfil").should("be.visible");
    cy.wait(300);
  });

  it("edita telefone e endereço e o card volta a mostrar os novos valores", () => {
    const telefone = "(21) 99876-5432";
    const endereco = `Rua de Teste Cypress, ${Date.now()}`;

    cy.contains("button", "Editar").click();
    cy.get("#telefoneEdit").should("be.visible");
    cy.wait(300);
    cy.get("#telefoneEdit").clear().type(telefone);
    cy.get("#enderecoEdit").clear().type(endereco);
    cy.contains("button", "Salvar").click();

    cy.contains(telefone).should("be.visible");
    cy.contains(endereco).should("be.visible");
  });
});
