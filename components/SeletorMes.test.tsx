import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SeletorMes } from "./SeletorMes";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

// Um teto bem à frente, fixo, pra nenhum teste depender da data real em que roda.
const TETO_FOLGADO = { ano: 2030, mes: 12 };

describe("SeletorMes", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("mostra o mês e ano atuais", () => {
    render(<SeletorMes ano={2026} mes={7} limiteFuturo={TETO_FOLGADO} />);
    expect(screen.getByText("Julho de 2026")).toBeInTheDocument();
  });

  it("desabilita 'Mês anterior' em janeiro do anoMinimo (piso de navegação)", () => {
    render(<SeletorMes ano={2026} mes={1} anoMinimo={2026} limiteFuturo={TETO_FOLGADO} />);
    expect(screen.getByLabelText("Mês anterior")).toBeDisabled();
  });

  it("não desabilita 'Mês anterior' fora do piso", () => {
    render(<SeletorMes ano={2026} mes={2} anoMinimo={2026} limiteFuturo={TETO_FOLGADO} />);
    expect(screen.getByLabelText("Mês anterior")).not.toBeDisabled();
  });

  it("sem anoMinimo informado, não trava a navegação pra trás (compatibilidade)", () => {
    render(<SeletorMes ano={2026} mes={1} limiteFuturo={TETO_FOLGADO} />);
    expect(screen.getByLabelText("Mês anterior")).not.toBeDisabled();
  });

  it("desabilita 'Próximo mês' exatamente no limiteFuturo", () => {
    render(<SeletorMes ano={2026} mes={9} limiteFuturo={{ ano: 2026, mes: 9 }} />);
    expect(screen.getByLabelText("Próximo mês")).toBeDisabled();
  });

  it("não desabilita 'Próximo mês' antes do limiteFuturo", () => {
    render(<SeletorMes ano={2026} mes={8} limiteFuturo={{ ano: 2026, mes: 9 }} />);
    expect(screen.getByLabelText("Próximo mês")).not.toBeDisabled();
  });

  it("abre o popover de mês/ano ao clicar no rótulo", () => {
    render(<SeletorMes ano={2026} mes={7} anoMinimo={2024} limiteFuturo={TETO_FOLGADO} />);
    expect(screen.queryByLabelText("Mês")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Julho de 2026"));

    expect(screen.getByLabelText("Mês")).toBeInTheDocument();
    expect(screen.getByLabelText("Ano")).toBeInTheDocument();
  });

  it("o seletor de ano só lista anos entre anoMinimo e o ano do limiteFuturo", () => {
    render(<SeletorMes ano={2026} mes={7} anoMinimo={2024} limiteFuturo={{ ano: 2027, mes: 6 }} />);
    fireEvent.click(screen.getByText("Julho de 2026"));

    const selectAno = screen.getByLabelText("Ano") as HTMLSelectElement;
    const opcoes = Array.from(selectAno.options).map((o) => o.value);

    expect(opcoes).toEqual(["2024", "2025", "2026", "2027"]);
  });

  it("no ano do limiteFuturo, o seletor de mês só vai até o mês-teto", () => {
    render(<SeletorMes ano={2027} mes={3} anoMinimo={2024} limiteFuturo={{ ano: 2027, mes: 6 }} />);
    fireEvent.click(screen.getByText("Março de 2027"));

    const selectMes = screen.getByLabelText("Mês") as HTMLSelectElement;
    const opcoes = Array.from(selectMes.options).map((o) => o.value);

    expect(opcoes).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("em anos antes do limiteFuturo, o seletor de mês lista os 12 meses normalmente", () => {
    render(<SeletorMes ano={2026} mes={7} anoMinimo={2024} limiteFuturo={{ ano: 2027, mes: 6 }} />);
    fireEvent.click(screen.getByText("Julho de 2026"));

    const selectMes = screen.getByLabelText("Mês") as HTMLSelectElement;
    expect(selectMes.options).toHaveLength(12);
  });

  it("navega ao escolher um novo mês no popover", () => {
    render(<SeletorMes ano={2026} mes={7} anoMinimo={2024} limiteFuturo={TETO_FOLGADO} />);
    fireEvent.click(screen.getByText("Julho de 2026"));

    fireEvent.change(screen.getByLabelText("Mês"), { target: { value: "3" } });

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("mes=3"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("ano=2026"));
  });

  it("navega ao escolher um novo ano no popover", () => {
    render(<SeletorMes ano={2026} mes={7} anoMinimo={2024} limiteFuturo={TETO_FOLGADO} />);
    fireEvent.click(screen.getByText("Julho de 2026"));

    fireEvent.change(screen.getByLabelText("Ano"), { target: { value: "2024" } });

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("ano=2024"));
  });

  it("ao trocar pro ano-teto com mês fora do intervalo, ajusta pro mês-teto em vez de navegar pra um mês inválido", () => {
    render(<SeletorMes ano={2026} mes={11} anoMinimo={2024} limiteFuturo={{ ano: 2027, mes: 3 }} />);
    fireEvent.click(screen.getByText("Novembro de 2026"));

    fireEvent.change(screen.getByLabelText("Ano"), { target: { value: "2027" } });

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("ano=2027"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("mes=3"));
  });

  it("navega ao clicar no botão de próximo mês", () => {
    render(<SeletorMes ano={2026} mes={7} limiteFuturo={TETO_FOLGADO} />);
    fireEvent.click(screen.getByLabelText("Próximo mês"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("mes=8"));
  });

  it("vira o ano ao avançar de dezembro", () => {
    render(<SeletorMes ano={2026} mes={12} limiteFuturo={TETO_FOLGADO} />);
    fireEvent.click(screen.getByLabelText("Próximo mês"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("ano=2027"));
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("mes=1"));
  });

  it("sem limiteFuturo informado, o padrão é liberar só até o próximo mês a partir de hoje", () => {
    const hoje = new Date();
    const proximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    render(<SeletorMes ano={proximo.getFullYear()} mes={proximo.getMonth() + 1} />);
    expect(screen.getByLabelText("Próximo mês")).toBeDisabled();
  });
});
