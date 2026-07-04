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
  });

  it("mostra estado vazio quando não há registros", () => {
    render(<ListaLancamentos lancamentos={[]} />);
    expect(screen.getByText(/Nenhum registro neste mês/)).toBeInTheDocument();
  });

  it("começa recolhido, mostrando só uma prévia dos registros", () => {
    const lancamentos = Array.from({ length: 8 }, (_, i) => lancamento({ descricao: `Item ${i + 1}` }));
    render(<ListaLancamentos lancamentos={lancamentos} />);

    expect(screen.getByText("Últimos registros")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 8")).not.toBeInTheDocument();
    expect(screen.getByText("Ver todos os 8 registros")).toBeInTheDocument();
  });

  it("expande ao clicar no cabeçalho ou no botão 'ver todos'", async () => {
    const user = userEvent.setup();
    const lancamentos = Array.from({ length: 8 }, (_, i) => lancamento({ descricao: `Item ${i + 1}` }));
    render(<ListaLancamentos lancamentos={lancamentos} />);

    await user.click(screen.getByText("Ver todos os 8 registros"));

    expect(screen.getByText("Registros do mês")).toBeInTheDocument();
    expect(screen.getByText("Item 8")).toBeInTheDocument();
  });

  it("remove um lançamento não recorrente após confirmação", async () => {
    const user = userEvent.setup();
    render(<ListaLancamentos lancamentos={[lancamento({ descricao: "Mercado" })]} />);

    await user.click(screen.getByRole("button", { name: /Remover lançamento Mercado/ }));
    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(deletarLancamentoMock).toHaveBeenCalledTimes(1);
  });

  it("não remove quando o usuário cancela no modal de confirmação", async () => {
    const user = userEvent.setup();
    render(<ListaLancamentos lancamentos={[lancamento({ descricao: "Mercado" })]} />);

    await user.click(screen.getByRole("button", { name: /Remover lançamento Mercado/ }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(deletarLancamentoMock).not.toHaveBeenCalled();
  });
});
