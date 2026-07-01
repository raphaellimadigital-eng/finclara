import Link from "next/link";
import { ChevronLeft, LifeBuoy } from "lucide-react";

export default function AjudaPage() {
  return (
    <div className="container">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <LifeBuoy size={20} aria-hidden="true" /> Ajuda ou suporte
      </h1>

      <div className="card">
        <p style={{ marginTop: 0 }}>
          <strong>Como lançar uma receita ou despesa?</strong>
          <br />
          Use o formulário &quot;Novo lançamento&quot; no dashboard: escolha o tipo, categoria, valor e data.
        </p>
        <p>
          <strong>Como funciona a sugestão de alocação?</strong>
          <br />
          É baseada na regra 50/30/20 aplicada à sua receita do mês, e você também pode pedir uma
          recomendação personalizada por IA.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Precisa de mais ajuda?</strong>
          <br />
          Em breve você poderá falar com o suporte diretamente por aqui.
        </p>
      </div>

      <p className="texto-secundario" style={{ fontSize: 12.5 }}>
        Veja também nossos{" "}
        <Link href="/termos" className="botao-secundario" style={{ padding: 0, fontSize: 12.5 }}>
          Termos de Uso e Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
