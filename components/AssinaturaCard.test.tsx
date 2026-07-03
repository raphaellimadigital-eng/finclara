import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssinaturaCard } from "./AssinaturaCard";
import type { Usuario } from "@prisma/client";

function usuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: "u1",
    nome: "Teste",
    email: "teste@example.com",
    criadoEm: new Date(),
    perfilInvestidor: null,
    telefone: null,
    endereco: null,
    trialEndsAt: new Date(Date.now() - 1000),
    plano: "FREE",
    statusAssinatura: "SEM_ASSINATURA",
    mpAssinaturaId: null,
    periodoAtualFim: null,
    ...overrides,
  } as Usuario;
}

describe("AssinaturaCard", () => {
  it("mostra plano Free quando o trial já venceu e não há assinatura", () => {
    render(<AssinaturaCard usuario={usuario()} />);
    expect(screen.getByText("Plano Free")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /assinar o pro/i })).toBeInTheDocument();
  });

  it("mostra contagem de dias durante o trial", () => {
    const u = usuario({ trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1000) });
    render(<AssinaturaCard usuario={u} />);
    expect(screen.getByText(/Período de teste — 4 dias restantes/)).toBeInTheDocument();
  });

  it("mostra plano Pro ativo e botão de gerenciar", () => {
    const u = usuario({ plano: "PRO", statusAssinatura: "ATIVA" });
    render(<AssinaturaCard usuario={u} />);
    expect(screen.getByText("Plano Pro ativo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gerenciar assinatura/i })).toBeInTheDocument();
  });

  it("mostra data de acesso até quando cancelado mas ainda dentro do período pago", () => {
    const periodoAtualFim = new Date("2026-08-15T00:00:00Z");
    const u = usuario({ plano: "PRO", statusAssinatura: "CANCELADA", periodoAtualFim });
    render(<AssinaturaCard usuario={u} />);
    expect(screen.getByText(/Cancelado — acesso Pro até/)).toBeInTheDocument();
  });
});
