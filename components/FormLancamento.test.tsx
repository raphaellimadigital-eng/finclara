import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormLancamento } from "./FormLancamento";

const criarLancamentoMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/app/dashboard/actions", () => ({
  criarLancamento: (...args: unknown[]) => criarLancamentoMock(...args),
}));

describe("FormLancamento", () => {
  beforeEach(() => {
    criarLancamentoMock.mockClear();
  });

  it("renderiza os campos principais", () => {
    render(<FormLancamento ano={2026} mes={7} />);
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toBeInTheDocument();
    expect(screen.getByLabelText("Data")).toBeInTheDocument();
  });

  it("sugere categoria automaticamente a partir da descrição", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    await user.type(screen.getByLabelText("Descrição"), "Mercado do bairro");

    expect(screen.getByLabelText("Categoria")).toHaveValue("ALIMENTACAO");
    expect(screen.getByText(/sugerida com base na descrição/)).toBeInTheDocument();
  });

  it("respeita a escolha manual do usuário mesmo digitando depois", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "OUTRAS_DESPESAS" } });
    await user.type(screen.getByLabelText("Descrição"), "Mercado do bairro");

    expect(screen.getByLabelText("Categoria")).toHaveValue("OUTRAS_DESPESAS");
  });

  it("reseta a categoria ao trocar o tipo de lançamento", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    await user.click(screen.getByRole("radio", { name: /Receita/ }));
    await user.type(screen.getByLabelText("Descrição"), "Salário de julho");
    expect(screen.getByLabelText("Categoria")).toHaveValue("SALARIO");

    await user.click(screen.getByRole("radio", { name: /Investimento/ }));
    expect(screen.getByLabelText("Categoria")).toHaveValue("");
  });

  it("usa o mês/ano informado como padrão da data, ajustando pro último dia se o mês for mais curto", () => {
    const ano = 2026;
    const mesAlvo = 2; // fevereiro, mês curto — força o ajuste quando "hoje" tem dia > 28
    const ultimoDiaFevereiro = new Date(ano, mesAlvo, 0).getDate();
    const diaEsperado = Math.min(new Date().getDate(), ultimoDiaFevereiro);
    const valorEsperado = `${ano}-02-${String(diaEsperado).padStart(2, "0")}`;

    render(<FormLancamento ano={ano} mes={mesAlvo} />);

    expect(screen.getByLabelText("Data")).toHaveValue(valorEsperado);
  });

  it("envia o formulário chamando a action de criar lançamento", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    await user.type(screen.getByLabelText("Descrição"), "Mercado");
    await user.type(screen.getByLabelText("Valor"), "100");
    await user.click(screen.getByRole("button", { name: /Salvar lançamento/ }));

    expect(criarLancamentoMock).toHaveBeenCalledTimes(1);
  });
});
