import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Resumo } from "./Resumo";

const PROPS_BASE = {
  totalReceitas: 5000,
  totalDespesas: 2000,
  saldo: 3000,
  parcelasCartaoMes: 0,
  parcelasDividaMes: 0,
  poupancaRecomendada: 0,
  qtdCartoes: 0,
  disponivelCartoes: 0,
  qtdDividas: 0,
  totalDevedor: 0,
  metaPrincipal: null,
};

describe("Resumo", () => {
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
    expect(screen.getByText(/faturas de cartão/)).toBeInTheDocument();
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
});
