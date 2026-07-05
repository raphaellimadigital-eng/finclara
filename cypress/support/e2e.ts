import "./commands";

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
