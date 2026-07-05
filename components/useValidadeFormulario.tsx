"use client";

import { useEffect, useState, type RefObject } from "react";

// Acompanha a validade nativa do formulário (required, minLength, maxLength, pattern,
// setCustomValidity) em tempo real — usado para desabilitar o botão de enviar enquanto houver
// erro, em vez de só bloquear no clique do submit.
//
// `gatilho` é opcional e serve para os casos em que o <form> não existe já na primeira
// renderização do componente (ex: um formulário de edição que só aparece depois de clicar em
// "Editar", alternando dentro do mesmo componente) — sem isso, o efeito roda uma única vez com
// formRef.current ainda nulo e nunca liga os listeners quando o form aparece de verdade, deixando
// o botão de salvar preso em desabilitado para sempre. Passe algo que mude nesse momento (ex: o
// próprio estado que alterna entre ver/editar).
export function useValidadeFormulario(formRef: RefObject<HTMLFormElement>, gatilho: unknown = null) {
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
  }, [formRef, gatilho]);

  return valido;
}
