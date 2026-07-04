"use client";

import { useEffect, useState, type RefObject } from "react";

// Acompanha a validade nativa do formulário (required, minLength, maxLength, pattern,
// setCustomValidity) em tempo real — usado para desabilitar o botão de enviar enquanto houver
// erro, em vez de só bloquear no clique do submit.
export function useValidadeFormulario(formRef: RefObject<HTMLFormElement>) {
  const [valido, setValido] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function verificar() {
      setValido(form!.checkValidity());
    }

    verificar();
    form.addEventListener("input", verificar);
    form.addEventListener("change", verificar);
    form.addEventListener("reset", verificar);
    return () => {
      form.removeEventListener("input", verificar);
      form.removeEventListener("change", verificar);
      form.removeEventListener("reset", verificar);
    };
  }, [formRef]);

  return valido;
}
