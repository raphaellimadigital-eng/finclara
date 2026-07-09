import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingPrimeirosPassos } from "./OnboardingPrimeirosPassos";

vi.mock("@/app/dashboard/actions", () => ({
  criarLancamento: vi.fn().mockResolvedValue(undefined),
}));

describe("OnboardingPrimeirosPassos", () => {
  it("mostra os três passos quando nada foi feito ainda", () => {
    render(<OnboardingPrimeirosPassos temReceita={false} temDespesa={false} temMeta={false} ano={2026} mes={7} />);
    expect(screen.getByText("Registre quanto entrou este mês")).toBeInTheDocument();
    expect(screen.getByText("Registre um gasto de hoje")).toBeInTheDocument();
    expect(screen.getByText("Crie sua primeira meta")).toBeInTheDocument();
  });

  it("some quando os três passos já foram concluídos", () => {
    const { container } = render(
      <OnboardingPrimeirosPassos temReceita temDespesa temMeta ano={2026} mes={7} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o progresso em percentual conforme os passos são concluídos", () => {
    const { rerender } = render(
      <OnboardingPrimeirosPassos temReceita={false} temDespesa={false} temMeta={false} ano={2026} mes={7} />
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(<OnboardingPrimeirosPassos temReceita temDespesa={false} temMeta={false} ano={2026} mes={7} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33");
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("desabilita o passo já concluído", () => {
    render(<OnboardingPrimeirosPassos temReceita temDespesa={false} temMeta={false} ano={2026} mes={7} />);
    expect(screen.getByText("Registre quanto entrou este mês").closest("button")).toBeDisabled();
    expect(screen.getByText("Registre um gasto de hoje").closest("button")).not.toBeDisabled();
  });
});
