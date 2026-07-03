import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Resumo } from "./Resumo";
import type { Alocacao } from "@/lib/financas";

const pedirRecomendacaoIAMock = vi.fn().mockResolvedValue("Recomendação de teste da IA.");

vi.mock("@/app/dashboard/ai-actions", () => ({
  pedirRecomendacaoIA: (...args: unknown[]) => pedirRecomendacaoIAMock(...args),
}));

const ALOCACAO_SEM_RECEITA: Alocacao = {
  totalReceitas: 0,
  atual: { essenciais: 0, desejos: 0, reserva: 0, investimento: 0, naoAlocado: 0 },
  ideal: { essenciais: 0, desejos: 0, reserva: 0, investimento: 0 },
  dicas: [],
  temDividaCara: false,
};

const PROPS_BASE = {
  totalReceitas: 5000,
  totalDespesas: 2000,
  totalInvestimentos: 0,
  saldo: 3000,
  parcelasCartaoMes: 0,
  parcelasDividaMes: 0,
  poupancaRecomendada: 0,
  qtdCartoes: 0,
  disponivelCartoes: 0,
  qtdDividas: 0,
  totalDevedor: 0,
  metaPrincipal: null,
  orientacaoPrioridade: "INVESTIR" as const,
  alocacao: ALOCACAO_SEM_RECEITA,
};

describe("Resumo", () => {
  beforeEach(() => {
    pedirRecomendacaoIAMock.mockClear();
  });

  it("mostra situação confortável quando o comprometimento é baixo", () => {
    render(<Resumo {...PROPS_BASE} />);
    expect(screen.getByText("Situação confortável")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?5\.000,00/)).toBeInTheDocument();
  });

  it("mostra situação crítica quando despesas + cartão + dívida ultrapassam a renda", () => {
    render(
      <Resumo
        {...PROPS_BASE}
        totalReceitas={1000}
        totalDespesas={600}
        parcelasCartaoMes={300}
        parcelasDividaMes={200}
      />
    );
    expect(screen.getByText("Gastos acima da renda")).toBeInTheDocument();
  });

  it("mostra o detalhamento de cartão/dívida quando existem outros compromissos", () => {
    render(<Resumo {...PROPS_BASE} parcelasCartaoMes={100} parcelasDividaMes={50} />);
    expect(screen.getByText(/Cartões:/)).toBeInTheDocument();
    expect(screen.getByText(/Dívidas:/)).toBeInTheDocument();
  });

  it("mostra o valor investido no detalhamento", () => {
    render(<Resumo {...PROPS_BASE} totalInvestimentos={500} />);
    expect(screen.getByText("Investido")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?500,00/)).toBeInTheDocument();
  });

  it("avisa que cartões e dívidas não entram no saldo disponível", () => {
    render(<Resumo {...PROPS_BASE} />);
    expect(screen.getByText(/não são descontados do saldo disponível/)).toBeInTheDocument();
  });

  it("mostra 'Nenhum'/'Nenhuma' quando não há cartões, dívidas ou metas", () => {
    render(<Resumo {...PROPS_BASE} />);
    expect(screen.getByText("Nenhum")).toBeInTheDocument();
    // "Nenhuma" aparece duas vezes: dívidas e meta principal (ambas ausentes neste cenário)
    expect(screen.getAllByText("Nenhuma")).toHaveLength(2);
  });

  it("mostra a meta principal com o percentual e a situação", () => {
    render(
      <Resumo
        {...PROPS_BASE}
        metaPrincipal={{ descricao: "Reserva", percentual: 42, situacao: "em_dia" }}
      />
    );
    expect(screen.getByText(/42% · no prazo/)).toBeInTheDocument();
  });

  it("mostra a poupança recomendada quando maior que zero", () => {
    render(<Resumo {...PROPS_BASE} poupancaRecomendada={500} />);
    expect(screen.getByText(/guardar com segurança/)).toBeInTheDocument();
  });

  it("não mostra a poupança recomendada quando zero", () => {
    render(<Resumo {...PROPS_BASE} poupancaRecomendada={0} />);
    expect(screen.queryByText(/guardar com segurança/)).not.toBeInTheDocument();
  });

  it("orienta quitar dívidas caras quando essa é a prioridade", () => {
    render(<Resumo {...PROPS_BASE} poupancaRecomendada={500} orientacaoPrioridade="QUITAR_DIVIDA" />);
    expect(screen.getByText(/quitar dívidas caras/)).toBeInTheDocument();
  });

  it("orienta formar a reserva de emergência quando essa é a prioridade", () => {
    render(<Resumo {...PROPS_BASE} poupancaRecomendada={500} orientacaoPrioridade="FORMAR_RESERVA" />);
    expect(screen.getByText(/reserva de emergência/)).toBeInTheDocument();
  });

  it("sugere aportar na meta em andamento quando pronto para investir", () => {
    render(
      <Resumo
        {...PROPS_BASE}
        poupancaRecomendada={500}
        orientacaoPrioridade="INVESTIR"
        metaPrincipal={{ descricao: "Viagem", percentual: 10, situacao: "em_dia" }}
      />
    );
    expect(screen.getByText(/aportar na meta "Viagem"/)).toBeInTheDocument();
  });

  it("sugere investir de acordo com o perfil quando não há meta em andamento", () => {
    render(<Resumo {...PROPS_BASE} poupancaRecomendada={500} orientacaoPrioridade="INVESTIR" />);
    expect(screen.getByText(/investir de acordo com o seu perfil/)).toBeInTheDocument();
  });

  it("não mostra o botão de recomendação da IA quando não há receita registrada", () => {
    render(<Resumo {...PROPS_BASE} alocacao={ALOCACAO_SEM_RECEITA} />);
    expect(screen.queryByRole("button", { name: /Pedir sugestão personalizada/ })).not.toBeInTheDocument();
  });

  it("pede e mostra a recomendação da IA ao clicar no botão", async () => {
    const user = userEvent.setup();
    const alocacaoComReceita: Alocacao = { ...ALOCACAO_SEM_RECEITA, totalReceitas: 5000 };
    render(<Resumo {...PROPS_BASE} alocacao={alocacaoComReceita} />);

    await user.click(screen.getByRole("button", { name: /Pedir sugestão personalizada/ }));

    expect(pedirRecomendacaoIAMock).toHaveBeenCalledWith(alocacaoComReceita);
    await waitFor(() => {
      expect(screen.getByText("Recomendação de teste da IA.")).toBeInTheDocument();
    });
  });

  it("mostra erro quando a recomendação da IA falha", async () => {
    pedirRecomendacaoIAMock.mockRejectedValueOnce(new Error("Falhou"));
    const user = userEvent.setup();
    const alocacaoComReceita: Alocacao = { ...ALOCACAO_SEM_RECEITA, totalReceitas: 5000 };
    render(<Resumo {...PROPS_BASE} alocacao={alocacaoComReceita} />);

    await user.click(screen.getByRole("button", { name: /Pedir sugestão personalizada/ }));

    await waitFor(() => {
      expect(screen.getByText("Falhou")).toBeInTheDocument();
    });
  });
});
