import { Info } from "lucide-react";

// Aviso legal exigido em toda tela de orientação financeira (ver proposta, seção 15.1):
// nunca recomendar produto específico, nunca prometer rentabilidade, sempre indicar
// que o conteúdo é educativo e não substitui um profissional certificado (CVM/ANBIMA).
export function DisclaimerFinanceiro() {
  return (
    <p
      className="texto-secundario"
      style={{ fontSize: 11.5, lineHeight: 1.5, display: "flex", gap: 6, marginTop: 12 }}
    >
      <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      Conteúdo educativo, não constitui recomendação de investimento. O FinClara não indica produtos
      financeiros específicos nem promete rentabilidade. Consulte um profissional certificado
      (CVM/ANBIMA) antes de tomar decisões financeiras.
    </p>
  );
}
