import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GridMosaico } from "./GridMosaico";

// jsdom não tem motor de layout de verdade (offsetWidth/offsetHeight sempre 0), então aqui só dá
// pra testar que os filhos renderizam e nada quebra — o algoritmo de distribuição em si é
// testado isoladamente em lib/mosaico.test.ts, com números conhecidos.
describe("GridMosaico", () => {
  it("renderiza todos os filhos", () => {
    render(
      <GridMosaico>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </GridMosaico>
    );
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
    expect(screen.getByText("Card 3")).toBeInTheDocument();
  });

  it("não quebra com um único filho", () => {
    render(
      <GridMosaico>
        <div>Único card</div>
      </GridMosaico>
    );
    expect(screen.getByText("Único card")).toBeInTheDocument();
  });
});
