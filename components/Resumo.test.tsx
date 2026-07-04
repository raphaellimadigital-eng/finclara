import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Resumo } from "./Resumo";

const PROPS_BASE = {
  totalReceitas: 5000,
  totalDespesas: 2000,
  totalInvestimentos: 0,
  saldo: 3000,
  parcelasCartaoMes: 0,
  parcelasDividaMes: 0,
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

  it("mostra 'Sobrou até agora' quando o saldo é positivo", () => {
    render(<Resumo {...PROPS_BASE} />);
    expect(screen.getByText("Sobrou até agora")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?3\.000,00/)).toBeInTheDocument();
  });

  it("mostra 'Faltou' com tom acolhedor quando o saldo é negativo", () => {
    render(<Resumo {...PROPS_BASE} totalReceitas={1000} totalDespesas={1500} saldo={-500} />);
    expect(screen.getByText("Faltou")).toBeInTheDocument();
    // O valor aparece sem sinal negativo (o rótulo "Faltou" já diz a direção)
    expect(screen.getByText(/R\$\s?500,00/)).toBeInTheDocument();
    expect(screen.getByText(/Vamos ver juntos onde dá pra ajustar/)).toBeInTheDocument();
  });

  it("mostra os três números do mês: Entrou, Saiu e Guardado", () => {
    render(<Resumo {...PROPS_BASE} totalInvestimentos={500} />);
    expect(screen.getByText("Entrou")).toBeInTheDocument();
    expect(screen.getByText("Saiu")).toBeInTheDocument();
    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?500,00/)).toBeInTheDocument();
  });

  it("mostra o detalhamento de cartão/dívida quando existem outros compromissos", () => {
    render(<Resumo {...PROPS_BASE} parcelasCartaoMes={100} parcelasDividaMes={50} />);
    expect(screen.getByText(/Cartões:/)).toBeInTheDocument();
    expect(screen.getByText(/Dívidas:/)).toBeInTheDocument();
  });

  it("não mostra o detalhamento quando não há cartão nem dívida", () => {
    render(<Resumo {...PROPS_BASE} />);
    expect(screen.queryByText(/Cartões:/)).not.toBeInTheDocument();
  });

  it("mostra quanto da renda já tem dono", () => {
    render(<Resumo {...PROPS_BASE} totalReceitas={1000} totalDespesas={400} />);
    expect(screen.getByText(/Quanto da renda já tem dono/)).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("avisa quando dívidas + cartão passam de 30% da renda", () => {
    render(<Resumo {...PROPS_BASE} totalReceitas={1000} totalDespesas={100} parcelasCartaoMes={200} parcelasDividaMes={150} />);
    expect(screen.getByText(/Suas dívidas estão pesando no orçamento/)).toBeInTheDocument();
  });

  it("não avisa quando dívidas + cartão ficam abaixo de 30% da renda", () => {
    render(<Resumo {...PROPS_BASE} totalReceitas={1000} totalDespesas={100} parcelasCartaoMes={100} parcelasDividaMes={100} />);
    expect(screen.queryByText(/Suas dívidas estão pesando no orçamento/)).not.toBeInTheDocument();
  });
});
