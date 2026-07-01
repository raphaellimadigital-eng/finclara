"use server";

import { createClient } from "@/lib/supabase-server";
import { gerarRecomendacaoIA } from "@/lib/gemini";
import type { Alocacao } from "@/lib/financas";

export async function pedirRecomendacaoIA(alocacao: Alocacao): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  return gerarRecomendacaoIA(alocacao);
}
