"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Calculator } from "lucide-react";
import { calcularSimulacao, OPCOES_INVESTIMENTO, type TipoInvestimento } from "@/lib/simulador";
import { parseValorBR, formatarValorParaCampo, VALOR_MONETARIO_MAXIMO } from "@/lib/valores";
import { formatarMoeda } from "@/lib/formatos";
import { DisclaimerFinanceiro } from "@/components/DisclaimerFinanceiro";

// Em meses, não anos — metas com prazo curto (ex: 6 meses) não podem ser arredondadas para
// cima até 1 ano, isso dobraria o prazo simulado e distorceria o valor final.
const OPCOES_PRAZO_MESES = [3, 6, 12, 24, 36, 60, 120, 180, 240];

function rotuloPrazo(meses: number): string {
  if (meses < 12) return `${meses} meses`;
  const anos = meses / 12;
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

// Input de valor monetário controlado localmente (sem hidden field de form) — o simulador
// recalcula ao vivo a cada tecla, diferente do CampoValor usado em formulários com submit.
function CampoValorSimulador({
  id,
  rotulo,
  valor,
  aoAlterar,
}: {
  id: string;
  rotulo: string;
  valor: number;
  aoAlterar: (valor: number) => void;
}) {
  const [texto, setTexto] = useState(formatarValorParaCampo(valor));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const novoTexto = e.target.value.replace(/[^\d.,]/g, "");
    setTexto(novoTexto);
    const numero = parseValorBR(novoTexto);
    aoAlterar(!isNaN(numero) && numero >= 0 && numero <= VALOR_MONETARIO_MAXIMO ? numero : 0);
  }

  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      <input id={id} type="text" inputMode="decimal" placeholder="0,00" value={texto} onChange={handleChange} autoComplete="off" />
    </div>
  );
}

// Mapeia o prazo exato em meses (vindo do link de uma meta) para a opção mais próxima do seletor.
function prazoMaisProximo(meses: number): number {
  return OPCOES_PRAZO_MESES.reduce((maisProximo, opcao) =>
    Math.abs(opcao - meses) < Math.abs(maisProximo - meses) ? opcao : maisProximo
  );
}

export function SimuladorInvestimento() {
  const params = useSearchParams();

  const tipoParam = params.get("tipo");
  const tipoInicial = tipoParam && tipoParam in OPCOES_INVESTIMENTO ? (tipoParam as TipoInvestimento) : "TESOURO_SELIC";
  const mesesParam = Number(params.get("meses"));

  const [valorInicial, setValorInicial] = useState(Number(params.get("valorInicial")) || 1000);
  const [aporteMensal, setAporteMensal] = useState(Number(params.get("aporteMensal")) || 200);
  const [meses, setMeses] = useState(mesesParam > 0 ? prazoMaisProximo(mesesParam) : 60);
  const [tipoInvestimento, setTipoInvestimento] = useState<TipoInvestimento>(tipoInicial);

  const resultado = useMemo(
    () => calcularSimulacao({ valorInicial, aporteMensal, meses, tipoInvestimento }),
    [valorInicial, aporteMensal, meses, tipoInvestimento]
  );

  const comparativo = useMemo(
    () =>
      (Object.keys(OPCOES_INVESTIMENTO) as TipoInvestimento[]).map((tipo) => ({
        tipo,
        rotulo: OPCOES_INVESTIMENTO[tipo].rotulo,
        valorFinal: calcularSimulacao({ valorInicial, aporteMensal, meses, tipoInvestimento: tipo }).valorFinal,
      })),
    [valorInicial, aporteMensal, meses]
  );

  const dadosGrafico = resultado.serieMensal
    .filter((p) => p.mes % Math.max(1, Math.round(meses / 24)) === 0 || p.mes === meses)
    .map((p) => ({ label: `${Math.floor(p.mes / 12)}a ${p.mes % 12}m`, valorAcumulado: p.valorAcumulado, totalInvestido: p.totalInvestido }));

  return (
    <>
      <div className="card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calculator size={16} aria-hidden="true" /> Simule seu investimento
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <CampoValorSimulador id="valor-inicial" rotulo="Valor inicial" valor={valorInicial} aoAlterar={setValorInicial} />
          <CampoValorSimulador id="aporte-mensal" rotulo="Aporte mensal" valor={aporteMensal} aoAlterar={setAporteMensal} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label htmlFor="prazo-meses" className="rotulo">
              Por quanto tempo
            </label>
            <select id="prazo-meses" value={meses} onChange={(e) => setMeses(Number(e.target.value))}>
              {OPCOES_PRAZO_MESES.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {rotuloPrazo(opcao)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tipo-investimento" className="rotulo">
              Onde investir
            </label>
            <select id="tipo-investimento" value={tipoInvestimento} onChange={(e) => setTipoInvestimento(e.target.value as TipoInvestimento)}>
              {(Object.keys(OPCOES_INVESTIMENTO) as TipoInvestimento[]).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {OPCOES_INVESTIMENTO[tipo].rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="texto-secundario" style={{ fontSize: 12.5, marginTop: 10 }}>
          {OPCOES_INVESTIMENTO[tipoInvestimento].descricao}
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Resultado da simulação</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <div className="rotulo">Total investido</div>
            <strong style={{ fontSize: 15 }}>{formatarMoeda(resultado.totalInvestido)}</strong>
          </div>
          <div>
            <div className="rotulo">Juros ganhos</div>
            <strong style={{ fontSize: 15, color: "var(--verde)" }}>{formatarMoeda(resultado.totalJuros)}</strong>
          </div>
          <div>
            <div className="rotulo">Valor final</div>
            <strong style={{ fontSize: 15 }}>{formatarMoeda(resultado.valorFinal)}</strong>
          </div>
        </div>

        <p className="texto-secundario" style={{ fontSize: 12, marginBottom: 12 }}>
          Rendimento equivalente a {(resultado.taxaAnualEquivalente * 100).toFixed(2)}% ao ano, considerando a taxa de
          referência atual — valores reais variam conforme o mercado.
        </p>

        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={dadosGrafico} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradienteSimulador" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--verde)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--verde)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--borda)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatarMoeda(Number(v))} labelStyle={{ color: "#111827" }} />
              <Area type="monotone" dataKey="totalInvestido" stroke="var(--texto-secundario)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
              <Area type="monotone" dataKey="valorAcumulado" stroke="var(--verde)" strokeWidth={2} fill="url(#gradienteSimulador)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <DisclaimerFinanceiro />
      </div>

      <div className="card">
        <h2 className="card-title">Comparativo entre opções</h2>
        <p className="texto-secundario" style={{ fontSize: 12.5, marginBottom: 10 }}>
          Valor final estimado com os mesmos aportes, ao final de {rotuloPrazo(meses)}.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {comparativo
            .sort((a, b) => b.valorFinal - a.valorFinal)
            .map((item) => (
              <div key={item.tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                <span style={{ fontWeight: item.tipo === tipoInvestimento ? 700 : 400 }}>{item.rotulo}</span>
                <span style={{ fontWeight: item.tipo === tipoInvestimento ? 700 : 400 }}>{formatarMoeda(item.valorFinal)}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
