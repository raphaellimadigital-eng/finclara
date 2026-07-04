import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardMetas } from "./CardMetas";
import type { Meta } from "@prisma/client";

function meta(overrides: Partial<Meta> = {}): Meta {
  return {
    id: Math.random().toString(),
    usuarioId: "u1",
    tipo: "OUTRO",
    descricao: "Meta",
    valorAlvo: 1000 as any,
    valorAtual: 0 as any,
    prazo: new Date("2020-01-01"),
    criadoEm: new Date("2019-01-01"),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("CardMetas", () => {
  it("convida a criar a primeira meta quando não há metas", () => {
    render(<CardMetas metas={[]} />);
    expect(screen.getByText("Crie sua primeira meta")).toBeInTheDocument();
  });

  it("mostra o nome do card, mesmo sem metas cadastradas", () => {
    render(<CardMetas metas={[]} />);
    expect(screen.getByText("Metas")).toBeInTheDocument();
  });

  it("mostra a quantidade de metas cadastradas", () => {
    render(<CardMetas metas={[meta(), meta()]} />);
    expect(screen.getByText(/2 metas/)).toBeInTheDocument();
  });

  it("alerta quando há metas atrasadas", () => {
    render(<CardMetas metas={[meta()]} />);
    expect(screen.getByText(/atrasada/)).toBeInTheDocument();
  });

  it("não alerta quando não há metas atrasadas", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    render(<CardMetas metas={[meta({ prazo: futuro, criadoEm: new Date() })]} />);
    expect(screen.queryByText(/atrasada/)).not.toBeInTheDocument();
  });

  it("destaca a meta principal com o percentual de progresso", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    render(
      <CardMetas
        metas={[meta({ descricao: "Viagem", valorAtual: 250 as any, prazo: futuro, criadoEm: new Date() })]}
      />
    );
    expect(screen.getByText("Viagem")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("prioriza a meta não concluída mais próxima do prazo", () => {
    const daqui1Ano = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    const daqui2Anos = new Date(Date.now() + 1000 * 60 * 60 * 24 * 730);
    render(
      <CardMetas
        metas={[
          meta({ descricao: "Longe", prazo: daqui2Anos, criadoEm: new Date() }),
          meta({ descricao: "Perto e concluída", valorAtual: 1000 as any, prazo: daqui1Ano, criadoEm: new Date() }),
        ]}
      />
    );
    expect(screen.getByText("Longe")).toBeInTheDocument();
  });
});
