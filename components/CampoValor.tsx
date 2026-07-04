"use client";

import { useEffect, useRef, useState } from "react";
import { parseValorBR, formatarValorParaCampo, VALOR_MONETARIO_MAXIMO, MSG_VALOR_MAXIMO } from "@/lib/valores";

type Props = {
  id: string;
  name: string;
  valorInicial?: number;
  obrigatorio?: boolean;
  // Teto e mensagem podem ser sobrescritos (ex: taxa de juros usa outro limite)
  max?: number;
  mensagemMax?: string;
  placeholder?: string;
};

// Campo de valor que aceita o jeito brasileiro de digitar ("1.234,56" ou "1234,56") — o
// input type="number" nativo rejeita vírgula. O valor normalizado (ponto decimal) segue num
// input hidden com o `name` do campo, então as Server Actions continuam lendo como antes.
// A validação usa mensagens claras em português via a validação nativa do formulário.
export function CampoValor({
  id,
  name,
  valorInicial,
  obrigatorio = true,
  max = VALOR_MONETARIO_MAXIMO,
  mensagemMax = MSG_VALOR_MAXIMO,
  placeholder = "0,00",
}: Props) {
  const [texto, setTexto] = useState(valorInicial != null ? formatarValorParaCampo(valorInicial) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const numero = parseValorBR(texto);
  const valorNormalizado = isNaN(numero) ? "" : String(numero);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (texto === "") {
      input.setCustomValidity(obrigatorio ? "Informe um valor." : "");
    } else if (isNaN(numero) || numero <= 0) {
      input.setCustomValidity("Informe um valor maior que zero.");
    } else if (numero > max) {
      input.setCustomValidity(mensagemMax);
    } else {
      input.setCustomValidity("");
    }
  }, [texto, numero, obrigatorio, max, mensagemMax]);

  // Os formulários chamam form.reset() após salvar — um campo controlado não volta sozinho,
  // então escutamos o evento de reset do próprio form.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const aoResetar = () => setTexto(valorInicial != null ? formatarValorParaCampo(valorInicial) : "");
    form.addEventListener("reset", aoResetar);
    return () => form.removeEventListener("reset", aoResetar);
  }, [valorInicial]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Só dígitos, ponto e vírgula — qualquer outra tecla é ignorada
    setTexto(e.target.value.replace(/[^\d.,]/g, ""));
  }

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={texto}
        onChange={handleChange}
        required={obrigatorio}
        autoComplete="off"
      />
      <input type="hidden" name={name} value={valorNormalizado} />
    </>
  );
}
