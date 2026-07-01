import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";
import { getMetas } from "./actions";
import { FormMeta } from "@/components/FormMeta";
import { ListaMetas } from "@/components/ListaMetas";

export default async function MetasPage() {
  const metas = await getMetas();

  return (
    <div className="container">
      <Link
        href="/dashboard"
        className="botao-secundario"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, marginBottom: 16 }}>
        <Target size={20} aria-hidden="true" /> Metas financeiras
      </h1>

      <FormMeta />
      <ListaMetas metas={metas} />
    </div>
  );
}
