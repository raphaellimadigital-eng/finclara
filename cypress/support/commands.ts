/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Faz login pela UI e guarda a sessão (cookies) para os testes seguintes reaproveitarem. */
      login(email: string, senha: string): Chainable<void>;
      /** Fecha o tour guiado dos primeiros passos se ele estiver na tela (idempotente). */
      dismissarTourSePresente(): Chainable<void>;
      /** Visita /login e espera a página estabilizar (evita flakiness de hidratação do Cypress). */
      visitarLogin(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("visitarLogin", () => {
  cy.visit("/login");
  cy.get("#email").should("be.visible");
  // Pequena espera proposital: logo após o visit, o React recupera de um falso positivo de
  // hidratação (ver support/e2e.ts) refazendo a árvore inteira — interagir cedo demais faz o
  // Cypress pegar um elemento que está prestes a ser substituído.
  cy.wait(300);
});

Cypress.Commands.add("login", (email: string, senha: string) => {
  cy.session(
    [email],
    () => {
      cy.visitarLogin();
      cy.get("#email").type(email);
      cy.get("#senha").type(senha, { log: false });
      cy.get('form.card button[type="submit"]').click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");
    },
    {
      validate() {
        cy.visit("/dashboard");
        cy.location("pathname").should("eq", "/dashboard");
      },
    }
  );
});

Cypress.Commands.add("dismissarTourSePresente", () => {
  // O tour só aparece depois de um useEffect (checagem de localStorage) rodar após a montagem —
  // sem essa espera, o check abaixo roda cedo demais e nunca vê o balão a tempo de fechá-lo.
  cy.wait(500);
  cy.get("body").then(($body) => {
    if ($body.find(".tour-balao").length > 0) {
      cy.get(".tour-balao").contains("button", "Pular").click();
    }
  });
});

export {};
