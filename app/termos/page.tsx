import Link from "next/link";
import { ChevronLeft, ScrollText } from "lucide-react";

export const metadata = {
  title: "Termos de Uso e Privacidade — FinClara",
};

export default function TermosPage() {
  return (
    <div className="container">
      <Link
        href="/login"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <ScrollText size={20} aria-hidden="true" /> Termos de Uso e Privacidade
      </h1>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section>
          <h2 style={{ fontSize: 15 }}>1. O que é o FinClara</h2>
          <p className="texto-secundario">
            O FinClara é uma ferramenta de organização e educação financeira pessoal. Ele não é uma
            corretora, gestora, instituição financeira ou consultoria de investimentos registrada na
            Comissão de Valores Mobiliários (CVM) ou na ANBIMA.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15 }}>2. Natureza educativa das recomendações</h2>
          <p className="texto-secundario">
            As sugestões de alocação de renda e as recomendações geradas por inteligência artificial
            têm caráter exclusivamente educativo. O FinClara nunca recomenda produtos financeiros
            específicos (ações, fundos, títulos ou instituições) e nunca promete ou garante
            rentabilidade. Qualquer percentual ou valor sugerido é uma referência, não uma instrução.
            Consulte um profissional certificado antes de tomar decisões financeiras.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15 }}>3. Seus dados (LGPD)</h2>
          <p className="texto-secundario">
            Seus dados financeiros são tratados de acordo com a Lei Geral de Proteção de Dados
            (LGPD), com a finalidade exclusiva de operar o FinClara para você. Seus lançamentos são
            isolados por conta — nenhum outro usuário tem acesso a eles. Você pode exportar ou
            excluir todos os seus dados financeiros a qualquer momento, diretamente na página de
            Configurações.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15 }}>4. Segurança</h2>
          <p className="texto-secundario">
            A autenticação é feita com senha criptografada, e toda comunicação com o servidor usa
            HTTPS. Cada usuário só acessa seus próprios lançamentos.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15 }}>5. Responsabilidade</h2>
          <p className="texto-secundario">
            O uso do FinClara é por sua conta e risco quanto a decisões financeiras. O app não se
            responsabiliza por perdas decorrentes de decisões de investimento, quitação de dívidas ou
            planejamento tomadas com base nas informações apresentadas.
          </p>
        </section>

        <p className="texto-secundario" style={{ fontSize: 11.5, marginTop: 4 }}>
          Este texto é um rascunho inicial e ainda não passou por revisão jurídica formal.
        </p>
      </div>
    </div>
  );
}
