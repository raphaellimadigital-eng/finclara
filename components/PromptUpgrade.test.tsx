import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromptUpgrade } from "./PromptUpgrade";

describe("PromptUpgrade", () => {
  it("mostra a mensagem recebida", () => {
    render(<PromptUpgrade mensagem="Marcar parcelas como pagas é um recurso do plano Pro." />);
    expect(screen.getByText(/Marcar parcelas como pagas é um recurso do plano Pro\./)).toBeInTheDocument();
  });

  it("tem um link para a página de assinatura", () => {
    render(<PromptUpgrade mensagem="Recurso do plano Pro." />);
    const link = screen.getByRole("link", { name: /assine o pro/i });
    expect(link).toHaveAttribute("href", "/dashboard/assinatura");
  });
});
