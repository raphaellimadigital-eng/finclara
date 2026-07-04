import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSobra } from "./CardSobra";

// O CardSobra embute o FormLancamento (botão "Guardar agora"), que importa a Server Action
// real — fora do runtime do Next, o React cache() usado na cadeia de imports quebra.
vi.mock("@/app/dashboard/actions", () => ({
  criarLancamento: vi.fn().mockResolvedValue(undefined),
}));

const PROPS_BASE = {
  valor: 500,
  prioridade: "INVESTIR" as const,
  metaPrincipal: null,
  ano: 2026,
  mes: 7,
};

describe("CardSobra", () => {
  it("não renderiza nada quando não há sobra", () => {
    const { container } = render(<CardSobra {...PROPS_BASE} valor={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o valor que pode ser guardado e o botão de guardar", () => {
    render(<CardSobra {...PROPS_BASE} />);
    expect(screen.getByText("Pode guardar este mês")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?500,00/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar agora/ })).toBeInTheDocument();
  });

  it("orienta quitar dívidas caras quando essa é a prioridade", () => {
    render(<CardSobra {...PROPS_BASE} prioridade="QUITAR_DIVIDA" />);
    expect(screen.getByText(/quitar dívidas caras/)).toBeInTheDocument();
  });

  it("orienta formar a reserva de emergência quando essa é a prioridade", () => {
    render(<CardSobra {...PROPS_BASE} prioridade="FORMAR_RESERVA" />);
    expect(screen.getByText(/reserva de emergência/)).toBeInTheDocument();
  });

  it("sugere guardar na meta em andamento quando pronto para investir", () => {
    render(
      <CardSobra
        {...PROPS_BASE}
        metaPrincipal={{ descricao: "Viagem", percentual: 10, situacao: "em_dia" }}
      />
    );
    expect(screen.getByText(/guardar na meta "Viagem"/)).toBeInTheDocument();
  });

  it("sugere investir de acordo com o perfil quando não há meta em andamento", () => {
    render(<CardSobra {...PROPS_BASE} />);
    expect(screen.getByText(/investir de acordo com o seu perfil/)).toBeInTheDocument();
  });
});
