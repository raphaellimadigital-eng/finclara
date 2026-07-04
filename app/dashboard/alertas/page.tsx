import Link from "next/link";
import { ChevronLeft, Bell, AlertOctagon, AlertTriangle, ChevronRight, Gauge } from "lucide-react";
import { getLancamentos } from "../actions";
import { getLimites } from "../limites/actions";
import { getCartoes } from "../cartoes/actions";
import { getDividas } from "../dividas/actions";
import { getMetas } from "../metas/actions";
import { calcularProgressoLimites } from "@/lib/limites";
import { alertasLimites, alertasCartoes, alertasDividas, alertasMetas, ordenarPorSeveridade } from "@/lib/alertas";
import type { Alerta } from "@/lib/alertas";
import { LABEL_CATEGORIA } from "@/lib/categorias";
import { AvisoMesVisualizado } from "@/components/AvisoMesVisualizado";

const ICONE_SEVERIDADE: Record<Alerta["severidade"], typeof AlertOctagon> = {
  estouro: AlertOctagon,
  urgente: AlertOctagon,
  aviso: AlertTriangle,
};

const COR_SEVERIDADE: Record<Alerta["severidade"], string> = {
  estouro: "var(--vermelho)",
  urgente: "var(--vermelho)",
  aviso: "var(--amarelo)",
};

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function AlertasPage({ searchParams }: Props) {
  const agora = new Date();
  const ano = Number(searchParams.ano) || agora.getFullYear();
  const mes = Number(searchParams.mes) || agora.getMonth() + 1;

  const [lancamentos, limites, cartoes, dividas, metas] = await Promise.all([
    getLancamentos(ano, mes),
    getLimites(),
    getCartoes(),
    getDividas(),
    getMetas(),
  ]);

  const progressoLimites = calcularProgressoLimites(lancamentos, limites);

  const alertas = ordenarPorSeveridade([
    ...alertasLimites(progressoLimites, LABEL_CATEGORIA),
    ...alertasCartoes(cartoes),
    ...alertasDividas(dividas),
    ...alertasMetas(metas),
  ]);

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
        <Bell size={20} aria-hidden="true" /> Central de alertas
      </h1>

      <AvisoMesVisualizado ano={ano} mes={mes} baseHref="/dashboard/alertas" />

      {alertas.length === 0 ? (
        <div className="card">
          <div className="estado-vazio">
            <Bell size={28} className="estado-vazio-icone" aria-hidden="true" />
            <p className="texto-secundario" style={{ margin: 0 }}>
              Nenhum alerta no momento. Tudo sob controle.
            </p>
          </div>
        </div>
      ) : (
        alertas.map((alerta) => {
          const Icone = ICONE_SEVERIDADE[alerta.severidade];
          const cor = COR_SEVERIDADE[alerta.severidade];
          return (
            <Link
              key={alerta.id}
              href={alerta.href}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icone size={18} style={{ color: cor, flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{alerta.titulo}</div>
                  <div className="texto-secundario" style={{ fontSize: 12 }}>{alerta.descricao}</div>
                </div>
              </div>
              <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
            </Link>
          );
        })
      )}

      <Link
        href="/dashboard/limites"
        className="card"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Gauge size={18} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>Gerenciar limites de gasto</span>
        </div>
        <ChevronRight size={16} aria-hidden="true" style={{ color: "var(--texto-secundario)", flexShrink: 0 }} />
      </Link>
    </div>
  );
}
