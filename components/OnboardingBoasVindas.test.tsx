import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OnboardingBoasVindas } from "./OnboardingBoasVindas";
import { PERGUNTAS_PERFIL } from "@/lib/perfilInvestidor";

const salvarPerfilInvestidor = vi.fn().mockResolvedValue(undefined);
vi.mock("@/app/dashboard/perfil-investidor/actions", () => ({
  salvarPerfilInvestidor: (fd: FormData) => salvarPerfilInvestidor(fd),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const CHAVE = "finclara-onboarding-perfil-visto";

describe("OnboardingBoasVindas", () => {
  beforeEach(() => {
    localStorage.clear();
    salvarPerfilInvestidor.mockClear();
  });

  it("não aparece quando o perfil já está definido (mostrar=false)", () => {
    const { container } = render(<OnboardingBoasVindas mostrar={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("não aparece quando já foi visto neste navegador", () => {
    localStorage.setItem(CHAVE, "1");
    const { container } = render(<OnboardingBoasVindas mostrar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra a abertura e avança para a primeira pergunta", () => {
    render(<OnboardingBoasVindas mostrar />);
    expect(screen.getByText(/Boas-vindas ao/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));
    expect(screen.getByText(PERGUNTAS_PERFIL[0].pergunta)).toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("pular fecha o onboarding e marca como visto", () => {
    const { container } = render(<OnboardingBoasVindas mostrar />);
    fireEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(container).toBeEmptyDOMElement();
    expect(localStorage.getItem(CHAVE)).toBe("1");
  });

  it("responder as três perguntas salva o perfil e fecha", async () => {
    const { container } = render(<OnboardingBoasVindas mostrar />);
    fireEvent.click(screen.getByRole("button", { name: /Começar/ }));

    // Responde a primeira opção de cada uma das três perguntas.
    for (let i = 0; i < PERGUNTAS_PERFIL.length; i++) {
      const texto = PERGUNTAS_PERFIL[i].opcoes[0].texto;
      fireEvent.click(screen.getByText(texto).closest("button")!);
    }

    await waitFor(() => expect(salvarPerfilInvestidor).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(localStorage.getItem(CHAVE)).toBe("1");
  });
});
