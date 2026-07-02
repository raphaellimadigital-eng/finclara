import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardCartoes } from "./CardCartoes";
import type { CartaoCredito, CompraParcelada } from "@prisma/client";

type CartaoComCompras = CartaoCredito & { compras: CompraParcelada[] };

function cartao(overrides: Partial<CartaoComCompras> = {}): CartaoComCompras {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    nome: "Cartão A",
    limite: 1000 as any,
    diaFechamento: 10,
    diaVencimento: 20,
    compras: [],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

function compra(overrides: Partial<CompraParcelada> = {}): CompraParcelada {
  return {
    id: Math.random().toString(),
    cartaoId: "c1",
    descricao: "Compra",
    valorTotal: 300 as any,
    numParcelas: 3,
    dataCompra: new Date(2026, 6, 5),
    criadoEm: new Date(),
    ...overrides,
  };
}

describe("CardCartoes", () => {
  it("mostra estado vazio quando não há cartões", () => {
    render(<CardCartoes cartoes={[]} mes={7} ano={2026} />);
    expect(screen.getByText("Sem cartões cadastrados")).toBeInTheDocument();
  });

  it("mostra a quantidade de cartões cadastrados", () => {
    render(<CardCartoes cartoes={[cartao(), cartao()]} mes={7} ano={2026} />);
    expect(screen.getByText("2 cartões cadastrados")).toBeInTheDocument();
  });

  it("usa singular para um único cartão", () => {
    render(<CardCartoes cartoes={[cartao()]} mes={7} ano={2026} />);
    expect(screen.getByText("1 cartão cadastrado")).toBeInTheDocument();
  });

  it("mostra o disponível e a fatura do mês", () => {
    render(<CardCartoes cartoes={[cartao({ compras: [compra()] })]} mes={7} ano={2026} />);
    expect(screen.getByText("Disponível")).toBeInTheDocument();
    expect(screen.getByText("Fatura deste mês")).toBeInTheDocument();
  });

  it("com mais de um cartão, destaca o cartão mais próximo de estourar o limite", () => {
    const arriscado = cartao({
      nome: "Cartão Arriscado",
      limite: 100 as any,
      compras: [compra({ valorTotal: 90 as any, numParcelas: 1 })],
    });
    const seguro = cartao({ nome: "Cartão Seguro", limite: 1000 as any, compras: [] });
    render(<CardCartoes cartoes={[arriscado, seguro]} mes={7} ano={2026} />);
    expect(screen.getByText(/Cartão Arriscado está com/)).toBeInTheDocument();
  });

  it("não mostra o destaque de risco quando há apenas um cartão", () => {
    render(<CardCartoes cartoes={[cartao()]} mes={7} ano={2026} />);
    expect(screen.queryByText(/está com/)).not.toBeInTheDocument();
  });
});
