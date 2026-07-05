import { gerarCpfValido } from "../support/cpf";

// Conta descartável e independente da fixa: força o trial pra fora (task forcarPlanoLimitado)
// e isso não pode "vazar" pra outros specs que dependem da conta fixa estar em trial/Pro.
const timestamp = Date.now();
const EMAIL = `phaelju+cyplano${timestamp}@gmail.com`;
const SENHA = "Cypress!PlanoLimitado123";
const CPF = gerarCpfValido();

// Tolerante a já estar logado: quando a sessão da conta de teste ainda está válida (ex: entre
// tasks do mesmo teste), visitar /login é redirecionado direto pro dashboard pelo middleware —
// nesse caso não há formulário pra preencher, só seguimos.
function logarNaContaDeTeste() {
  cy.visit("/login");
  cy.location("pathname").then((pathname) => {
    if (pathname === "/dashboard") return;
    cy.get("#email").should("be.visible");
    cy.wait(300);
    cy.get("#email").type(EMAIL);
    cy.get("#senha").type(SENHA, { log: false });
    cy.get('form.card button[type="submit"]').click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/dashboard");
  });
}

describe("Aviso de plano limitado e reconciliação de pagamento pendente", () => {
  before(() => {
    cy.task("criarContaTeste", {
      email: EMAIL,
      senha: SENHA,
      nome: "Usuária Teste Plano Limitado",
      cpf: CPF,
      dataNascimento: "1990-05-15",
    });
    // A linha em "usuarios" só existe após a primeira visita autenticada (garantirUsuario) —
    // por isso login antes de forçar o plano.
    logarNaContaDeTeste();
  });

  it("mostra a faixa de plano Free quando o trial expira sem assinatura", () => {
    cy.task("forcarPlanoLimitado", { email: EMAIL, statusAssinatura: "SEM_ASSINATURA" });
    logarNaContaDeTeste();

    cy.contains("Você está no plano Free, com acesso limitado").should("be.visible");
    cy.contains("a", "Conhecer o Pro").click();
    cy.location("pathname").should("eq", "/dashboard/assinatura");
    cy.contains("Você está no plano Free. Assine o Pro").should("be.visible");
  });

  it("mostra o aviso de pagamento pendente e o botão de verificação manual", () => {
    cy.task("forcarPlanoLimitado", { email: EMAIL, statusAssinatura: "PENDENTE" });
    logarNaContaDeTeste();

    cy.contains("Seu pagamento ainda está sendo confirmado").should("be.visible");

    cy.visit("/dashboard/assinatura");
    cy.contains("aguardando a confirmação do seu pagamento").should("be.visible");
    cy.wait(300);
    cy.contains("button", "Já paguei, verificar agora").click();
    // A resposta depende do estado real no Mercado Pago (sandbox/produção) — o que importa
    // aqui é que a ação sempre responde com uma mensagem visível, sem travar nem quebrar a tela.
    cy.get('[role="status"]', { timeout: 15000 }).should("be.visible");
  });
});
