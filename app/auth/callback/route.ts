import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Recebe o clique no link de confirmação de e-mail (ou outros fluxos com "code", como
// recuperação de senha) e troca o código por uma sessão de verdade antes de redirecionar.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const proximaRota = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${proximaRota}`);
}
