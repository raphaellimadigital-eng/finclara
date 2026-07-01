import { Loader2 } from "lucide-react";

export default function CarregandoRaiz() {
  return (
    <div className="container">
      <div className="tela-carregando">
        <Loader2 size={28} className="icone-carregando" style={{ color: "var(--azul)" }} aria-hidden="true" />
        <span>Carregando...</span>
      </div>
    </div>
  );
}
