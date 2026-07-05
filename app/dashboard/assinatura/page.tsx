import Link from "next/link";
import { ChevronLeft, Crown, CheckCircle2 } from "lucide-react";
import { getStatusAssinatura } from "@/lib/auth";
import { diasRestantesTrial, temAcessoCompleto, trialAtivo } from "@/lib/assinatura";
import { BotaoAssinar, BotaoCancelarAssinatura, BotaoVerificarPagamento } from "@/components/BotaoAssinatura";

const BENEFICIOS_PRO = [
  "Marcar parcelas de dívidas como pagas e acompanhar a quitação",
  "Cartões de crédito e metas ilimitados",
  "Central de alertas completa e limites de gasto por categoria",
  "Relatórios em PDF (mensal, comparativo, diagnóstico, evolução patrimonial)",
  "Recomendação personalizada por IA",
];

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export default async function AssinaturaPage() {
  const usuario = await getStatusAssinatura();
  const acessoCompleto = temAcessoCompleto(usuario);
  const emTrial = trialAtivo(usuario);
  const ehProPago = usuario.plano === "PRO" && (usuario.statusAssinatura === "ATIVA" || usuario.statusAssinatura === "PAUSADA");
  const canceladaMasAindaValida =
    usuario.statusAssinatura === "CANCELADA" && usuario.periodoAtualFim !== null && acessoCompleto;

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
        <Crown size={20} aria-hidden="true" /> Assinatura
      </h1>

      <div className="card">
        {emTrial && (
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>
            Você está no período de teste gratuito — {diasRestantesTrial(usuario)}{" "}
            {diasRestantesTrial(usuario) === 1 ? "dia restante" : "dias restantes"} com tudo
            desbloqueado.
          </p>
        )}

        {ehProPago && !canceladaMasAindaValida && (
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>
            Sua assinatura Pro está ativa.
          </p>
        )}

        {canceladaMasAindaValida && usuario.periodoAtualFim && (
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>
            Assinatura cancelada — você mantém acesso Pro até {formatarData(usuario.periodoAtualFim)}.
          </p>
        )}

        {!acessoCompleto && usuario.statusAssinatura !== "PENDENTE" && (
          <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 10 }}>
            Você está no plano Free. Assine o Pro para desbloquear tudo abaixo.
          </p>
        )}

        {usuario.statusAssinatura === "PENDENTE" && (
          <div style={{ marginBottom: 10 }}>
            <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 8 }}>
              Estamos aguardando a confirmação do seu pagamento pelo Mercado Pago. Se você já
              concluiu o checkout, isso costuma ser automático — mas se demorar, verifique manualmente.
            </p>
            <BotaoVerificarPagamento />
          </div>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 16px" }}>
          {BENEFICIOS_PRO.map((beneficio) => (
            <li key={beneficio} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13.5 }}>
              <CheckCircle2 size={16} style={{ color: "var(--verde)", flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              {beneficio}
            </li>
          ))}
        </ul>

        {ehProPago ? <BotaoCancelarAssinatura /> : <BotaoAssinar />}
      </div>
    </div>
  );
}
