import { gerarCpfValido } from "../support/cpf";

// Troca de senha usa uma conta descartável própria (não a fixa): se algo der errado no meio do
// teste, o pior caso é perder uma conta de teste, nunca travar o acesso da conta reaproveitada
// pelos outros specs.
const timestamp = Date.now();
const EMAIL = `phaelju+cyseguranca${timestamp}@gmail.com`;
const SENHA_INICIAL = "Cypress!Seguranca123";
const SENHA_NOVA = "Cypress!NovaSenha456";
const CPF = gerarCpfValido();

describe("Segurança: troca de senha", () => {
  before(() => {
    cy.task("criarContaTeste", {
      email: EMAIL,
      senha: SENHA_INICIAL,
      nome: "Usuária Teste Segurança",
      cpf: CPF,
      dataNascimento: "1990-05-15",
    });
  });

  it("troca a senha e permite entrar de novo só com a nova", () => {
    cy.visitarLogin();
    cy.get("#email").type(EMAIL);
    cy.get("#senha").type(SENHA_INICIAL, { log: false });
    cy.get('form.card button[type="submit"]').click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");

    cy.visit("/dashboard/seguranca");
    cy.contains("h1", "Segurança").should("be.visible");
    cy.wait(300);

    cy.get("#senhaAtual").type(SENHA_INICIAL, { log: false });
    cy.get("#novaSenha").type(SENHA_NOVA, { log: false });
    cy.get("#confirmarSenha").type(SENHA_NOVA, { log: false });
    cy.contains("button", "Trocar senha").click();
    cy.contains("Senha alterada com sucesso").should("be.visible");

    // Sai e confirma que só a senha nova funciona agora
    cy.contains("button", "Sair").click();
    cy.location("pathname", { timeout: 10000 }).should("eq", "/login");

    cy.get("#email").type(EMAIL);
    cy.get("#senha").type(SENHA_NOVA, { log: false });
    cy.get('form.card button[type="submit"]').click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");
  });
});
