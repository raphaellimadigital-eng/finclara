import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useValidadeFormulario } from "./useValidadeFormulario";

// Regressão: um <form> que só passa a existir depois de um toggle dentro do MESMO componente
// (ex: FormDadosCadastrais alternando entre "ver" e "editar") não pode deixar o botão de salvar
// preso em desabilitado para sempre — precisa do parâmetro `gatilho` pra religar os listeners
// quando o form aparece de verdade.
function FormularioComToggle() {
  const [editando, setEditando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const valido = useValidadeFormulario(formRef, editando);

  if (!editando) {
    return <button onClick={() => setEditando(true)}>Editar</button>;
  }

  return (
    <form ref={formRef}>
      <input aria-label="nome" required defaultValue="Ana" />
      <button type="submit" disabled={!valido}>
        Salvar
      </button>
    </form>
  );
}

describe("useValidadeFormulario", () => {
  it("habilita o botão quando o form já existe desde a primeira renderização", () => {
    function FormularioSimples() {
      const formRef = useRef<HTMLFormElement>(null);
      const valido = useValidadeFormulario(formRef);
      return (
        <form ref={formRef}>
          <input aria-label="nome" required defaultValue="Ana" />
          <button type="submit" disabled={!valido}>
            Salvar
          </button>
        </form>
      );
    }

    render(<FormularioSimples />);
    expect(screen.getByRole("button", { name: "Salvar" })).not.toBeDisabled();
  });

  it("religa a validação quando o form só aparece depois de um toggle no mesmo componente", async () => {
    const user = userEvent.setup();
    render(<FormularioComToggle />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    // Sem o gatilho, o botão ficaria preso em desabilitado para sempre mesmo com o campo válido.
    expect(await screen.findByRole("button", { name: "Salvar" })).not.toBeDisabled();
  });
});
