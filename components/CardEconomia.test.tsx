import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardEconomia } from "./CardEconomia";

describe("CardEconomia", () => {
  it("não renderiza nada quando nada foi guardado no mês", () => {
    const { container } = render(<CardEconomia totalReceitas={5000} totalInvestimentos={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada quando não houve renda no mês", () => {
    const { container } = render(<CardEconomia totalReceitas={0} totalInvestimentos={300} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o valor guardado e o percentual da renda", () => {
    render(<CardEconomia totalReceitas={5000} totalInvestimentos={1000} />);
    expect(screen.getByText(/R\$\s?1\.000,00/)).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("celebra quando guardou 20% ou mais da renda", () => {
    render(<CardEconomia totalReceitas={5000} totalInvestimentos={1000} />);
    expect(screen.getByText(/Excelente!/)).toBeInTheDocument();
    expect(screen.getByText(/meta saudável de 20%/)).toBeInTheDocument();
  });

  it("incentiva sem culpar quando guardou pouco", () => {
    render(<CardEconomia totalReceitas={5000} totalInvestimentos={250} />);
    expect(screen.getByText(/Bom começo!/)).toBeInTheDocument();
  });
});
