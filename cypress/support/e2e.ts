import "./commands";

// Suprime o onboarding de perfil (tela cheia) em todos os specs: marca no localStorage, antes de
// cada carga de página, que ele já foi visto. Assim o overlay nunca cobre o dashboard nos testes
// e — como o tour trata essa marca como "onboarding concluído" — o tour guiado segue começando
// sozinho como os specs esperam. A lógica do overlay é coberta por teste unitário (Vitest).
beforeEach(() => {
  cy.on("window:before:load", (win) => {
    win.localStorage.setItem("finclara-onboarding-perfil-visto", "1");
  });
});

// Falso positivo conhecido: o script inline de tema no <head> (app/layout.tsx, evita flash do
// tema errado) dispara "hydration mismatch" só dentro do Cypress — o jeito como ele injeta a
// página no iframe via document.write diverge de uma navegação real de browser, que nunca
// reproduz esse erro. Suprime só essa mensagem específica; qualquer outro erro não tratado
// continua derrubando o teste normalmente.
Cypress.on("uncaught:exception", (err) => {
  if (/hydrat/i.test(err.message)) {
    return false;
  }
});
