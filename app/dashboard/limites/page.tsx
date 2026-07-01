import Link from "next/link";
import { ChevronLeft, Gauge } from "lucide-react";
import { getLimites } from "./actions";
import { getLancamentos } from "../actions";
import { calcularProgressoLimites } from "@/lib/limites";
import { FormLimiteCategoria } from "@/components/FormLimiteCategoria";
import { ListaLimites } from "@/components/ListaLimites";

export default async function LimitesPage() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  const [limites, lancamentos] = await Promise.all([
    getLimites(),
    getLancamentos(ano, mes),
  ]);

  const progresso = calcularProgressoLimites(lancamentos, limites).map((p, i) => ({
    ...p,
    id: limites[i].id,
  }));

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
        <Gauge size={20} aria-hidden="true" /> Limites por categoria
      </h1>

      <p className="texto-secundario" style={{ fontSize: 13, marginBottom: 16 }}>
        Defina quanto pretende gastar em cada categoria de despesa por mês. A partir de 80% do
        limite você recebe um aviso; ao ultrapassar 100%, um alerta de estouro.
      </p>

      <FormLimiteCategoria />
      <ListaLimites limites={progresso} />
    </div>
  );
}
