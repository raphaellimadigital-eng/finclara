import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

// Exporta todos os dados financeiros do usuário logado em um único arquivo JSON — direito de
// portabilidade previsto na LGPD (seção 15.2 da proposta). Protegido pelo middleware, que já
// redireciona requisições sem sessão para /login antes de chegar aqui.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Não autenticado", { status: 401 });
  }

  const [usuario, lancamentos, dividas, cartoes, metas, limitesCategoria] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: user.id } }),
    prisma.lancamento.findMany({ where: { usuarioId: user.id }, orderBy: { data: "asc" } }),
    prisma.divida.findMany({ where: { usuarioId: user.id } }),
    prisma.cartaoCredito.findMany({ where: { usuarioId: user.id }, include: { compras: true } }),
    prisma.meta.findMany({ where: { usuarioId: user.id } }),
    prisma.limiteCategoria.findMany({ where: { usuarioId: user.id } }),
  ]);

  const dados = {
    geradoEm: new Date().toISOString(),
    usuario,
    lancamentos,
    dividas,
    cartoes,
    metas,
    limitesCategoria,
  };

  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finclara-meus-dados.json"`,
    },
  });
}
