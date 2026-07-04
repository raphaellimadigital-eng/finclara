import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { nomeMesAno } from "@/lib/formatos";

// Faixa discreta avisando que a tela mostra um mês diferente do atual (o mês em visualização
// acompanha o usuário pela navegação via ?ano=&mes=).
export function AvisoMesVisualizado({ ano, mes, baseHref }: { ano: number; mes: number; baseHref: string }) {
  const agora = new Date();
  if (ano === agora.getFullYear() && mes === agora.getMonth() + 1) return null;

  return (
    <p className="aviso-mes">
      <CalendarDays size={15} aria-hidden="true" />
      Você está vendo {nomeMesAno(ano, mes)}.
      <Link href={baseHref} style={{ color: "inherit", fontWeight: 600 }}>
        Voltar ao mês atual
      </Link>
    </p>
  );
}
