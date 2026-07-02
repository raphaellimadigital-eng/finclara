import Link from "next/link";
import { ChevronLeft, LifeBuoy, MessageCircle } from "lucide-react";
import { FormContatoSuporte } from "@/components/FormContatoSuporte";
import { PerguntaIA } from "@/components/PerguntaIA";

const WHATSAPP_SUPORTE = "5521982232973";

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

      <PerguntaIA />

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
        <p>
          <strong>Como baixar um relatório?</strong>
          <br />
          No menu do usuário, toque em &quot;Relatórios&quot;: lá tem o Relatório Mensal, o Diagnóstico
          Financeiro (com IA), o Extrato de Lançamentos (Excel/CSV), o Comparativo Mensal e a
          Evolução Patrimonial, cada um com seu próprio botão de download.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Como faço um lançamento se repetir todo mês?</strong>
          <br />
          Ao cadastrar o lançamento, marque a opção &quot;esse lançamento se repete todo mês&quot;: o
          FinClara já cria os próximos 12 meses automaticamente.
        </p>
      </div>

      <a
        href={`https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent("Olá! Vim do FinClara e preciso de ajuda.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="card"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}
      >
        <MessageCircle size={18} aria-hidden="true" style={{ color: "var(--verde)", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>WhatsApp</div>
          <div className="texto-secundario" style={{ fontSize: 12 }}>Precisa de ajuda? Chame por aqui</div>
        </div>
      </a>

      <FormContatoSuporte />

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
