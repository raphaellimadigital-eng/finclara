// Credenciais da conta de teste fixa (já onboardada), usada pelos specs que só precisam de um
// usuário logado com dados variados — configuradas via cypress.env.json (fora do git) ou
// variáveis de ambiente CYPRESS_TEST_EMAIL / CYPRESS_TEST_PASSWORD.
export function credenciaisContaFixa(): { email: string; senha: string } {
  const email = Cypress.env("TEST_EMAIL");
  const senha = Cypress.env("TEST_PASSWORD");
  if (!email || !senha) {
    throw new Error(
      "Configure TEST_EMAIL e TEST_PASSWORD em cypress.env.json (ver cypress.env.json.example) antes de rodar os testes."
    );
  }
  return { email, senha };
}
