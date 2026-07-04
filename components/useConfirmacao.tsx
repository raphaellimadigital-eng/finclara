"use client";

import { useCallback, useRef, useState } from "react";
import { ModalConfirmacao } from "@/components/ModalConfirmacao";

// Hook que substitui window.confirm(): `confirmar(mensagem)` retorna uma Promise<boolean>,
// resolvida quando o usuário responde ao modal próprio do app. Uso:
//   const { confirmar, modal } = useConfirmacao();
//   if (!(await confirmar("Remover X?"))) return;
//   ...
//   return <>{modal}{restante}</>;
export function useConfirmacao() {
  const [pedido, setPedido] = useState<{ mensagem: string; textoConfirmar?: string } | null>(null);
  const resolverRef = useRef<(valor: boolean) => void>();

  const confirmar = useCallback((mensagem: string, textoConfirmar?: string) => {
    setPedido({ mensagem, textoConfirmar });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  function responder(valor: boolean) {
    setPedido(null);
    resolverRef.current?.(valor);
  }

  const modal = (
    <ModalConfirmacao
      aberta={pedido !== null}
      mensagem={pedido?.mensagem ?? ""}
      textoConfirmar={pedido?.textoConfirmar}
      aoConfirmar={() => responder(true)}
      aoCancelar={() => responder(false)}
    />
  );

  return { confirmar, modal };
}
