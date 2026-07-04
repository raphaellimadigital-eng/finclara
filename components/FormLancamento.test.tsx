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
    expect(screen.getByLabelText("O que foi?")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toBeInTheDocument();
    expect(screen.getByLabelText("Data")).toBeInTheDocument();
  });

  it("usa linguagem simples nos tipos: Entrou, Saiu e Guardei", () => {
    render(<FormLancamento ano={2026} mes={7} />);
    expect(screen.getByRole("radio", { name: /Entrou/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Saiu/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Guardei/ })).toBeInTheDocument();
  });

  it("sugere categoria automaticamente a partir da descrição", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    await user.type(screen.getByLabelText("O que foi?"), "Mercado do bairro");

    expect(screen.getByLabelText("Categoria")).toHaveValue("ALIMENTACAO");
    expect(screen.getByText(/sugerida com base na descrição/)).toBeInTheDocument();
  });

  it("respeita a escolha manual do usuário mesmo digitando depois", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "OUTRAS_DESPESAS" } });
    await user.type(screen.getByLabelText("O que foi?"), "Mercado do bairro");

    expect(screen.getByLabelText("Categoria")).toHaveValue("OUTRAS_DESPESAS");
  });

  it("reseta a categoria ao trocar o tipo de registro", async () => {
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} />);

    await user.click(screen.getByRole("radio", { name: /Entrou/ }));
    await user.type(screen.getByLabelText("O que foi?"), "Salário de julho");
    expect(screen.getByLabelText("Categoria")).toHaveValue("SALARIO");

    await user.click(screen.getByRole("radio", { name: /Guardei/ }));
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

  it("aceita tipo e valor iniciais (pré-preenchimento do 'Guardar agora')", () => {
    render(<FormLancamento ano={2026} mes={7} tipoInicial="INVESTIMENTO" valorInicial={350.5} />);

    expect(screen.getByRole("radio", { name: /Guardei/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Valor")).toHaveValue("350,50");
  });

  it("envia o formulário chamando a action de criar lançamento e avisa quem abriu", async () => {
    const aoSalvar = vi.fn();
    const user = userEvent.setup();
    render(<FormLancamento ano={2026} mes={7} aoSalvar={aoSalvar} />);

    await user.type(screen.getByLabelText("O que foi?"), "Mercado");
    await user.type(screen.getByLabelText("Valor"), "100");
    await user.click(screen.getByRole("button", { name: /^Salvar$/ }));

    expect(criarLancamentoMock).toHaveBeenCalledTimes(1);
    expect(aoSalvar).toHaveBeenCalledTimes(1);
  });
});
