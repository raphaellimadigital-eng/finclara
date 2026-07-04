import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardDividas } from "./CardDividas";
import type { Divida } from "@prisma/client";

function divida(overrides: Partial<Divida> = {}): Divida {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    descricao: "Dívida",
    valorOriginal: 1000 as any,
    valorTotal: 1000 as any,
    valorParcela: 100 as any,
    taxaJuros: 1 as any,
    vencimento: new Date(),
    quitada: false,
    quitadaEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("CardDividas", () => {
  it("mostra estado vazio quando não há dívidas", () => {
    render(<CardDividas dividas={[]} />);
    expect(screen.getByText(/Nenhuma dívida/)).toBeInTheDocument();
  });

  it("mostra o nome do card, mesmo sem dívidas cadastradas", () => {
    render(<CardDividas dividas={[]} />);
    expect(screen.getByText("Dívidas")).toBeInTheDocument();
  });

  it("mostra o total devedor", () => {
    render(<CardDividas dividas={[divida({ valorTotal: 1000 as any }), divida({ valorTotal: 500 as any })]} />);
    expect(screen.getByText(/R\$\s?1\.500,00 em dívidas/)).toBeInTheDocument();
  });

  it("alerta quando há dívida com juros altos", () => {
    render(<CardDividas dividas={[divida({ taxaJuros: 5 as any })]} />);
    expect(screen.getByText(/[Jj]uros altos/)).toBeInTheDocument();
  });

  it("não alerta quando nenhuma dívida é cara", () => {
    render(<CardDividas dividas={[divida({ taxaJuros: 0.5 as any })]} />);
    expect(screen.queryByText(/[Jj]uros altos/)).not.toBeInTheDocument();
  });
});
