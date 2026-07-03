import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaixaTrial } from "./FaixaTrial";

describe("FaixaTrial", () => {
  it("mostra os dias restantes no plural", () => {
    render(<FaixaTrial diasRestantes={5} />);
    expect(screen.getByText(/termina em 5 dias/)).toBeInTheDocument();
  });

  it("mostra 'dia' no singular quando resta 1", () => {
    render(<FaixaTrial diasRestantes={1} />);
    expect(screen.getByText(/termina em 1 dia\b/)).toBeInTheDocument();
  });

  it("tem um link para a página de assinatura", () => {
    render(<FaixaTrial diasRestantes={3} />);
    const link = screen.getByRole("link", { name: /assinar agora/i });
    expect(link).toHaveAttribute("href", "/dashboard/assinatura");
  });
});
