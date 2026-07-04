import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListaDividas } from "./ListaDividas";
import type { Divida } from "@prisma/client";

const deletarDividaMock = vi.fn().mockResolvedValue(undefined);
const marcarDividaPagaMock = vi.fn().mockResolvedValue(undefined);
const desfazerPagamentoDividaMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/app/dashboard/dividas/actions", () => ({
  deletarDivida: (...args: unknown[]) => deletarDividaMock(...args),
  marcarDividaPaga: (...args: unknown[]) => marcarDividaPagaMock(...args),
  desfazerPagamentoDivida: (...args: unknown[]) => desfazerPagamentoDividaMock(...args),
}));

function divida(overrides: Partial<Divida> = {}): Divida {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    descricao: "Empréstimo",
    valorOriginal: 1000 as any,
    valorTotal: 1000 as any,
    valorParcela: 200 as any,
    taxaJuros: 1 as any,
    vencimento: new Date("2026-08-10"),
    quitada: false,
    quitadaEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("ListaDividas", () => {
  beforeEach(() => {
    deletarDividaMock.mockClear();
    marcarDividaPagaMock.mockClear();
    desfazerPagamentoDividaMock.mockClear();
  });

  it("mostra estado vazio quando não há dívidas", () => {
    render(<ListaDividas dividas={[]} />);
    expect(screen.getByText(/Nenhuma dívida cadastrada/)).toBeInTheDocument();
  });

  it("mostra o percentual quitado com base no valor original", () => {
    render(<ListaDividas dividas={[divida({ valorOriginal: 1000 as any, valorTotal: 600 as any })]} />);
    expect(screen.getByText("40% quitado")).toBeInTheDocument();
  });

  it("marca a parcela como paga ao clicar no botão", async () => {
    const user = userEvent.setup();
    const vencimentoPassado = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
    render(<ListaDividas dividas={[divida({ descricao: "Empréstimo", vencimento: vencimentoPassado })]} />);

    await user.click(screen.getByRole("button", { name: /Marcar parcela de Empréstimo como paga/ }));

    expect(marcarDividaPagaMock).toHaveBeenCalledTimes(1);
  });

  it("avisa quando a dívida ainda não venceu, antes de marcar como paga", async () => {
    const user = userEvent.setup();
    const vencimentoFuturo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10); // 10 dias no futuro
    render(<ListaDividas dividas={[divida({ descricao: "Empréstimo", vencimento: vencimentoFuturo })]} />);

    await user.click(screen.getByRole("button", { name: /Marcar parcela de Empréstimo como paga/ }));

    expect(screen.getByText(/ainda não venceu/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marcar como paga" }));

    expect(marcarDividaPagaMock).toHaveBeenCalledTimes(1);
  });

  it("não marca como paga se o usuário cancelar o aviso de dívida ainda não vencida", async () => {
    const user = userEvent.setup();
    const vencimentoFuturo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    render(<ListaDividas dividas={[divida({ descricao: "Empréstimo", vencimento: vencimentoFuturo })]} />);

    await user.click(screen.getByRole("button", { name: /Marcar parcela de Empréstimo como paga/ }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(marcarDividaPagaMock).not.toHaveBeenCalled();
  });

  it("não avisa quando a dívida já venceu", async () => {
    const user = userEvent.setup();
    const vencimentoPassado = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3); // 3 dias atrás
    render(<ListaDividas dividas={[divida({ descricao: "Empréstimo", vencimento: vencimentoPassado })]} />);

    await user.click(screen.getByRole("button", { name: /Marcar parcela de Empréstimo como paga/ }));

    expect(screen.queryByText(/ainda não venceu/)).not.toBeInTheDocument();
    expect(marcarDividaPagaMock).toHaveBeenCalledTimes(1);
  });

  it("não mostra o botão de desfazer quando ainda não há pagamento registrado", () => {
    render(<ListaDividas dividas={[divida({ valorOriginal: 1000 as any, valorTotal: 1000 as any })]} />);
    expect(screen.queryByRole("button", { name: /Desfazer/ })).not.toBeInTheDocument();
  });

  it("mostra e aciona o botão de desfazer quando já há progresso", async () => {
    const user = userEvent.setup();
    render(
      <ListaDividas
        dividas={[divida({ descricao: "Empréstimo", valorOriginal: 1000 as any, valorTotal: 600 as any })]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Desmarcar parcela paga de Empréstimo/ }));

    expect(desfazerPagamentoDividaMock).toHaveBeenCalledTimes(1);
  });

  it("remove uma dívida após confirmação", async () => {
    const user = userEvent.setup();
    render(<ListaDividas dividas={[divida({ descricao: "Empréstimo" })]} />);

    await user.click(screen.getByRole("button", { name: /Remover dívida Empréstimo/ }));
    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(deletarDividaMock).toHaveBeenCalledTimes(1);
  });

  it("mostra dívidas quitadas separadamente, sem botão de marcar como paga", () => {
    render(
      <ListaDividas
        dividas={[divida({ descricao: "Cartão antigo", quitada: true, valorTotal: 0 as any, quitadaEm: new Date("2026-06-01") })]}
      />
    );

    expect(screen.getByText("Quitadas")).toBeInTheDocument();
    expect(screen.getByText("Cartão antigo")).toBeInTheDocument();
    expect(screen.getByText("quitada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Marcar parcela/ })).not.toBeInTheDocument();
  });

  it("permite reabrir uma dívida quitada por engano", async () => {
    const user = userEvent.setup();
    render(
      <ListaDividas
        dividas={[divida({ descricao: "Cartão antigo", quitada: true, valorTotal: 0 as any, quitadaEm: new Date("2026-06-01") })]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Reabrir dívida Cartão antigo/ }));

    expect(desfazerPagamentoDividaMock).toHaveBeenCalledTimes(1);
  });
});
