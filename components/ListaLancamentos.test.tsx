import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListaLancamentos } from "./ListaLancamentos";
import type { Lancamento } from "@prisma/client";

const deletarLancamentoMock = vi.fn().mockResolvedValue(undefined);
const deletarLancamentoEFuturosMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/app/dashboard/actions", () => ({
  deletarLancamento: (...args: unknown[]) => deletarLancamentoMock(...args),
  deletarLancamentoEFuturos: (...args: unknown[]) => deletarLancamentoEFuturosMock(...args),
}));

function lancamento(overrides: Partial<Lancamento> = {}): Lancamento {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    tipo: "DESPESA",
    categoria: "ALIMENTACAO",
    descricao: "Item",
    valor: 50 as any,
    data: new Date(),
    recorrente: false,
    serieRecorrenciaId: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("ListaLancamentos", () => {
  beforeEach(() => {
    deletarLancamentoMock.mockClear();
    deletarLancamentoEFuturosMock.mockClear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("mostra estado vazio quando não há lançamentos", () => {
    render(<ListaLancamentos lancamentos={[]} />);
    expect(screen.getByText(/Nenhum lançamento neste mês/)).toBeInTheDocument();
  });

  it("começa recolhido, mostrando só uma prévia dos lançamentos", () => {
    const lancamentos = Array.from({ length: 8 }, (_, i) => lancamento({ descricao: `Item ${i + 1}` }));
    render(<ListaLancamentos lancamentos={lancamentos} />);

    expect(screen.getByText("Lançamentos recentes")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 8")).not.toBeInTheDocument();
    expect(screen.getByText("Ver todos os 8 lançamentos")).toBeInTheDocument();
  });

  it("expande ao clicar no cabeçalho ou no botão 'ver todos'", async () => {
    const user = userEvent.setup();
    const lancamentos = Array.from({ length: 8 }, (_, i) => lancamento({ descricao: `Item ${i + 1}` }));
    render(<ListaLancamentos lancamentos={lancamentos} />);

    await user.click(screen.getByText("Ver todos os 8 lançamentos"));

    expect(screen.getByText("Lançamentos do mês")).toBeInTheDocument();
    expect(screen.getByText("Item 8")).toBeInTheDocument();
  });

  it("remove um lançamento não recorrente após confirmação", async () => {
    const user = userEvent.setup();
    render(<ListaLancamentos lancamentos={[lancamento({ descricao: "Mercado" })]} />);

    await user.click(screen.getByRole("button", { name: /Remover lançamento Mercado/ }));

    expect(deletarLancamentoMock).toHaveBeenCalledTimes(1);
  });
});
